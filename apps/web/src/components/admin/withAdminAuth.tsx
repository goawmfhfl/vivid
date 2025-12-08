"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabase";

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
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAdminStatus = async () => {
        if (userLoading || !user) {
          setIsLoading(true);
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
            router.push("/");
            return;
          }

          const data = await response.json();
          const adminStatus = data.isAdmin === true;
          setIsAdmin(adminStatus);

          if (!adminStatus) {
            console.error("관리자 권한이 없습니다.");
            router.push("/");
            return;
          }
        } catch (error) {
          console.error("관리자 권한 확인 실패:", error);
          setIsAdmin(false);
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminStatus();
    }, [user, userLoading, router]);

    // 로딩 중이거나 인증되지 않은 경우
    if (isLoading || userLoading || isAdmin === null || !isAdmin) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
          </div>
        </div>
      );
    }

    // 관리자 권한이 있는 경우 원래 컴포넌트 렌더링
    return <Component {...props} />;
  };
}
