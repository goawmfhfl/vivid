"use client";

import { useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginPath } from "@/lib/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Home } from "@/components/Home";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { withAuth } from "@/components/auth";
import { QUERY_KEYS } from "@/constants";

/**
 * 홈 페이지 - 날짜는 searchParams.date로만 관리.
 * / 와 /?date=yyyy-mm-dd 가 동일 페이지 → Link 클릭 시 라우트 변경 없음 → 깜빡임 없음.
 */
function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // 쿼리 파라미터에서 날짜 (없으면 오늘)
  const selectedDate = searchParams?.get("date") ?? undefined;

  useEffect(() => {
    if (typeof window !== "undefined" && searchParams) {
      const errorParam = searchParams.get("error");
      const errorCode = searchParams.get("error_code");
      const typeParam = searchParams.get("type");

      if (errorParam && typeParam === "vivid") {
        if (
          errorCode === "identity_already_exists" ||
          errorParam === "identity_already_exists"
        ) {
          router.replace(
            "/user?error=kakao_already_linked&message=" +
              encodeURIComponent(
                "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다. 다른 카카오 계정을 사용하거나 관리자에게 문의해주세요."
              ),
            { scroll: false }
          );
          return;
        }
        const errorDescription = searchParams.get("error_description");
        const errorMessage =
          errorDescription ||
          (errorCode === "server_error"
            ? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            : "인증 중 오류가 발생했습니다.");
        router.replace(getLoginPath(searchParams, { error: errorMessage }), {
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
      <Home selectedDate={selectedDate} />
    </PullToRefresh>
  );
}

export default withAuth(function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
});
