"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { supabase } from "@/lib/supabase";
import { clearAllCache, clearUserDataCache } from "@/lib/cache-utils";
import { isAuthFailureNoRetry } from "@/lib/auth-error";
import { QUERY_KEYS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";

// React Query 클라이언트 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: (failureCount, error) => {
        if (isAuthFailureNoRetry(error)) return false;
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

  // Invalid Refresh Token 에러 발생 시 세션 정리 + 현재 사용자 쿼리 제거
  const handleInvalidRefreshToken = useCallback(async () => {
    try {
      clearAllCache(queryClient);
      await supabase.auth.signOut({ scope: "local" });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        router.replace("/login");
      }
    } catch (_error) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [router]);

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
          // WebView 내 앱: RevenueCat app_user_id 연동을 위해 네이티브에 userId 전달
          const rnw = typeof window !== "undefined" && (window as { ReactNativeWebView?: { postMessage?: (msg: string) => void } }).ReactNativeWebView;
          if (rnw?.postMessage && session.user.id) {
            rnw.postMessage(JSON.stringify({ type: "SUPABASE_SESSION_READY", userId: session.user.id }));
          }
        }
      } else if (event === "TOKEN_REFRESH_FAILED" as never) {
        await handleInvalidRefreshToken();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleInvalidRefreshToken]);

  // 앱 포그라운드 복귀 시 할 일/피드백 캐시 무효화 (날짜 변경 시 어제 데이터가 보이는 캐싱 버그 방지)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const lastDateRef = { current: getKSTDateString() };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const today = getKSTDateString();
      // 날짜가 바뀌었으면 캐시 무효화 (할 일 최신화)
      const shouldInvalidate = lastDateRef.current !== today;
      lastDateRef.current = today;
      if (shouldInvalidate) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 네이티브 앱 결제 완료 시 호출 (WebView는 localStorage에 세션 보유)
  // Promise를 반환하여 inject 스크립트가 완료 시점을 알 수 있음
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__completePurchaseSync = async (planType: "annual" | "monthly") => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.warn("[Membership] 구독 sync: 세션 없음");
          return;
        }
        const res = await fetch("/api/subscriptions/complete-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({ planType }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("[Membership] 구독 sync 실패:", res.status, err);
        } else {
          console.log("[Membership] 구독 정보 Supabase 업데이트 완료");
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
        }
      } catch (e) {
        console.warn("[Membership] 구독 sync 오류:", e);
      }
    };
    return () => {
      delete (window as any).__completePurchaseSync;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
