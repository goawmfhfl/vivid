"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Home } from "@/components/Home";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { withAuth } from "@/components/auth";
import { QUERY_KEYS } from "@/constants";

function RootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // 루트 URL로 리다이렉션된 OAuth 에러 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      const errorParam = searchParams.get("error");
      const errorCode = searchParams.get("error_code");
      const typeParam = searchParams.get("type");

      // OAuth 에러가 루트 URL로 리다이렉션된 경우 처리
      if (errorParam && typeParam === "vivid") {
        // identity_already_exists 에러인 경우 연동 플로우로 간주
        if (errorCode === "identity_already_exists" || errorParam === "identity_already_exists") {
          // 프로필 설정 페이지로 리다이렉션 (에러 메시지와 함께)
          router.replace(
            "/user?error=kakao_already_linked&message=" +
              encodeURIComponent(
                "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다. 다른 카카오 계정을 사용하거나 관리자에게 문의해주세요."
              ),
            { scroll: false }
          );
          return;
        }

        // 기타 OAuth 에러는 로그인 페이지로 리다이렉션
        const errorDescription = searchParams.get("error_description");
        const errorMessage =
          errorDescription ||
          (errorCode === "server_error"
            ? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            : "인증 중 오류가 발생했습니다.");
        router.replace(`/login?error=${encodeURIComponent(errorMessage)}`, {
          scroll: false,
        });
      }
    }
  }, [router, searchParams]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.RECORDS] }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RECORDS, "dates", "all"],
      }),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] }),
    ]);
  }, [queryClient]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Home />
    </PullToRefresh>
  );
}

export default withAuth(RootPage);
