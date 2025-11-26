import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { MonthlyFeedback } from "@/types/monthly-feedback";

export interface MonthlyFeedbackGenerateRequest {
  month: string; // "YYYY-MM"
}

/**
 * 월간 피드백 생성
 */
const createMonthlyFeedback = async (
  params: MonthlyFeedbackGenerateRequest
): Promise<MonthlyFeedback> => {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/monthly-feedback/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...params }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create monthly feedback");
  }
  const data = await res.json();
  return data.data;
};

/**
 * 월간 피드백 생성 훅
 */
export function useCreateMonthlyFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MonthlyFeedbackGenerateRequest) =>
      createMonthlyFeedback(params),
    onSuccess: () => {
      // 리스트 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "list"],
      });
      // 후보 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
      });
      // 상세 쿼리도 무효화 (생성된 항목의 경우)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK],
      });
    },
    onError: (error) => {
      console.error("월간 피드백 생성 실패:", error);
    },
  });
}

