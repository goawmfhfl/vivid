"use client";

import { use, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Home } from "@/components/Home";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { withAuth } from "@/components/auth";
import { QUERY_KEYS } from "@/constants";

function DatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.RECORDS] }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RECORDS, "dates", "all"],
      }),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] }),
    ]);
  }, [queryClient]);

  // 날짜 형식 검증 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>잘못된 날짜 형식입니다.</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Home selectedDate={date} />
    </PullToRefresh>
  );
}

export default withAuth(DatePage);
