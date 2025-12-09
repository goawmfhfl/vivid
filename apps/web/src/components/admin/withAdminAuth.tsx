"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabase";

// 관리자 권한 캐시 (페이지 간 이동 시 재사용)
const adminAuthCache = new Map<
  string,
  { isAdmin: boolean; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 관리자 권한이 필요한 페이지를 보호하는 고차 컴포넌트 (HOC)
 *
 * 사용법:
 * ```tsx
 * export default withAdminAuth(AdminPageComponent);
 * ```
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminAuthenticatedComponent(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasCheckedRef = useRef(false);

    useEffect(() => {
      const checkAdminStatus = async () => {
        // 사용자 로딩 중이면 대기
        if (userLoading || !user) {
          if (!hasCheckedRef.current) {
            setIsLoading(true);
          }
          return;
        }

        // 캐시 확인
        const cacheKey = user.id;
        const cached = adminAuthCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setIsAdmin(cached.isAdmin);
          setIsLoading(false);
          hasCheckedRef.current = true;
          if (!cached.isAdmin) {
            router.push("/");
          }
          return;
        }

        // 캐시가 없거나 만료된 경우에만 API 호출
        if (hasCheckedRef.current) {
          // 이미 확인했으면 로딩 표시하지 않음
          return;
        }

        try {
          // Supabase 세션 가져오기
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            console.error("세션이 없습니다.");
            setIsAdmin(false);
            adminAuthCache.set(cacheKey, { isAdmin: false, timestamp: now });
            router.push("/");
            return;
          }

          // API를 통해 관리자 권한 확인 (Authorization 헤더 포함)
          const response = await fetch("/api/admin/check", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
          });

          if (!response.ok) {
            console.error("관리자 권한 확인 API 실패:", response.status);
            setIsAdmin(false);
            adminAuthCache.set(cacheKey, { isAdmin: false, timestamp: now });
            router.push("/");
            return;
          }

          const data = await response.json();
          const adminStatus = data.isAdmin === true;
          setIsAdmin(adminStatus);
          adminAuthCache.set(cacheKey, {
            isAdmin: adminStatus,
            timestamp: now,
          });
          hasCheckedRef.current = true;

          if (!adminStatus) {
            console.error("관리자 권한이 없습니다.");
            router.push("/");
            return;
          }
        } catch (error) {
          console.error("관리자 권한 확인 실패:", error);
          setIsAdmin(false);
          adminAuthCache.set(cacheKey, { isAdmin: false, timestamp: now });
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminStatus();
    }, [user, userLoading, router, pathname]);

    // 사용자 로딩 중이거나 아직 확인하지 않은 경우에만 로딩 표시
    if (
      (isLoading && !hasCheckedRef.current) ||
      userLoading ||
      isAdmin === null
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
          </div>
        </div>
      );
    }

    // 관리자 권한이 없는 경우
    if (!isAdmin) {
      return null; // 로딩창 없이 조용히 리다이렉트
    }

    // 관리자 권한이 있는 경우 원래 컴포넌트 렌더링
    return <Component {...props} />;
  };
}
