import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "./useCurrentUser";
import { QUERY_KEYS } from "@/constants";
import type { MonthlyFeedback } from "@/types/monthly-feedback";

/**
 * 월간 피드백 조회 (month 기반)
 */
export function useGetMonthlyFeedback(month: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, month],
    queryFn: async () => {
      if (!month) return null;

      const userId = await getCurrentUserId();
      const response = await fetch(
        `/api/monthly-feedback/list?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch monthly feedback list: ${response.statusText}`
        );
      }

      const result = await response.json();
      const monthlyFeedback = result.data.find(
        (item: MonthlyFeedback) => item.month === month
      );

      if (!monthlyFeedback) {
        return null;
      }

      // 상세 조회
      const detailResponse = await fetch(
        `/api/monthly-feedback/${monthlyFeedback.id}?userId=${userId}`
      );
      if (!detailResponse.ok) {
        throw new Error("Failed to fetch monthly feedback detail");
      }

      const detailResult = await detailResponse.json();
      return detailResult.data as MonthlyFeedback;
    },
    enabled: !!month,
  });
}

/**
 * 월간 피드백 조회 (id 기반)
 */
export function useGetMonthlyFeedbackById(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "id", id],
    queryFn: async () => {
      if (!id) return null;

      const userId = await getCurrentUserId();
      const response = await fetch(
        `/api/monthly-feedback/${id}?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch monthly feedback");
      }

      const result = await response.json();
      return result.data as MonthlyFeedback;
    },
    enabled: !!id,
  });
}

/**
 * 월간 피드백 리스트 조회
 */
export function useGetMonthlyFeedbackList(enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "list"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      const response = await fetch(
        `/api/monthly-feedback/list?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch monthly feedback list");
      }

      const result = await response.json();
      return result.data;
    },
    enabled, // enabled 파라미터로 조건부 조회 제어
  });
}
