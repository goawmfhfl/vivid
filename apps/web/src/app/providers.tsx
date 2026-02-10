"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { supabase } from "@/lib/supabase";
import { clearAllCache, clearUserDataCache } from "@/lib/cache-utils";
import { isInvalidRefreshTokenError } from "@/lib/auth-utils";

// React Query 클라이언트 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: (failureCount, error) => {
        if (isInvalidRefreshTokenError(error)) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export function JournalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Invalid Refresh Token 에러 발생 시 세션 정리, 로그아웃, 로그인 페이지로 리다이렉트
  const handleInvalidRefreshToken = useCallback(async () => {
    console.log("[Auth] Invalid Refresh Token 감지, 세션 정리 후 로그인으로 이동...");
    try {
      clearAllCache(queryClient);
      await supabase.auth.signOut({ scope: "local" });
      router.replace("/login");
    } catch (error) {
      console.error("[Auth] 세션 정리 중 오류:", error);
      router.replace("/login");
    }
  }, [router]);

  // 초기 세션 검증 및 에러 핸들링 (앱 로드 시 한 번)
  useEffect(() => {
    const validateSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error && isInvalidRefreshTokenError(error)) {
          await handleInvalidRefreshToken();
        }
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          await handleInvalidRefreshToken();
        } else {
          console.error("[Auth] 세션 검증 중 오류:", error);
        }
      }
    };

    validateSession();
  }, [handleInvalidRefreshToken]);

  // Supabase 인증 상태 변경 감지 및 캐시 관리
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        // 로그아웃 시 모든 캐시 클리어
        clearAllCache(queryClient);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // 로그인 또는 토큰 갱신 시 이전 사용자 데이터만 클리어
        // 새로운 사용자의 데이터는 캐시에 유지
        if (session?.user) {
          clearUserDataCache(queryClient);
        }
      } else if (event === "TOKEN_REFRESH_FAILED" as never) {
        await handleInvalidRefreshToken();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleInvalidRefreshToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
