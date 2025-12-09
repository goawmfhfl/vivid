"use client";

import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { supabase } from "@/lib/supabase";
import { clearAllCache, clearUserDataCache } from "@/lib/cache-utils";

// React Query 클라이언트 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function JournalProvider({ children }: { children: ReactNode }) {
  // Supabase 인증 상태 변경 감지 및 캐시 관리
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // 로그아웃 시 모든 캐시 클리어
        clearAllCache(queryClient);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // 로그인 또는 토큰 갱신 시 이전 사용자 데이터만 클리어
        // 새로운 사용자의 데이터는 캐시에 유지
        if (session?.user) {
          clearUserDataCache(queryClient);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
