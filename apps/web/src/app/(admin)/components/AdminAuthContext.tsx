"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/design-system";

interface AdminAuthContextType {
  isAdmin: boolean | null;
  isLoading: boolean;
  isInitialized: boolean;
  refetchAdminStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// 관리자 권한 캐시 (컨텍스트 외부에서도 재사용)
const adminAuthCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasCheckedRef = useRef(false);

  const checkAdminStatus = useCallback(async () => {
    // 사용자 로딩 중이면 대기
    if (userLoading) {
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      setIsInitialized(true);
      router.push("/");
      return;
    }

    // 캐시 확인
    const cacheKey = user.id;
    const cached = adminAuthCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setIsAdmin(cached.isAdmin);
      setIsLoading(false);
      setIsInitialized(true);
      hasCheckedRef.current = true;
      if (!cached.isAdmin) {
        router.push("/");
      }
      return;
    }

    // 이미 확인 중이거나 초기화된 경우 스킵
    if (hasCheckedRef.current && isInitialized) {
      return;
    }

    try {
      hasCheckedRef.current = true;

      // Supabase 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("세션이 없습니다.");
        setIsAdmin(false);
        adminAuthCache.set(cacheKey, { isAdmin: false, timestamp: now });
        router.push("/");
        return;
      }

      // API를 통해 관리자 권한 확인
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
      adminAuthCache.set(cacheKey, { isAdmin: adminStatus, timestamp: now });

      if (!adminStatus) {
        console.error("관리자 권한이 없습니다.");
        router.push("/");
        return;
      }
    } catch (error) {
      console.error("관리자 권한 확인 실패:", error);
      setIsAdmin(false);
      adminAuthCache.set(user.id, { isAdmin: false, timestamp: now });
      router.push("/");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [user, userLoading, router, isInitialized]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // 초기 로딩 중이거나 아직 초기화되지 않은 경우에만 로딩 화면 표시
  if (!isInitialized || (isLoading && !hasCheckedRef.current) || userLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: COLORS.background.base }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.brand.primary }}
          />
          <p style={{ color: COLORS.text.secondary }}>관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 관리자 권한이 없는 경우
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        isLoading,
        isInitialized,
        refetchAdminStatus: checkAdminStatus,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
