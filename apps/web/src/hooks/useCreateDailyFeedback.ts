import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

const createDailyFeedback = async (date: string): Promise<DailyFeedbackRow> => {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/daily-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, date }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create daily feedback");
  }
  const response = await res.json();
  return response.data as DailyFeedbackRow;
};

export const useCreateDailyFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date }: { date: string }) => createDailyFeedback(date),
    onSuccess: (data, variables) => {
      // 생성된 피드백의 ID로 쿼리 무효화
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "id", data.id],
        });
      }

      if (variables?.date) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK, variables.date],
        });
        // 날짜별 쿼리도 무효화 (dates 쿼리 포함)
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "dates"],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK],
        });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    },
    onError: (error) => {
      console.error("일일 피드백 생성 실패:", error);
    },
  });
};
