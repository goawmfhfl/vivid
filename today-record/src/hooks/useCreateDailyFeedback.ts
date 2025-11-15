import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";

const createDailyFeedback = async (date: string) => {
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
  return (await res.json().catch(() => ({}))) as unknown;
};

export const useCreateDailyFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date }: { date: string }) => createDailyFeedback(date),
    onSuccess: (_data, variables) => {
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
