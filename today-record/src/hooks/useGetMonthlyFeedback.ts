import { useQuery } from "@tanstack/react-query";
import { getServiceSupabase } from "@/lib/supabase-service";
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

      const supabase = getServiceSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `/api/monthly-feedback/list?userId=${user.id}`
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
        `/api/monthly-feedback/${monthlyFeedback.id}?userId=${user.id}`
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

      const supabase = getServiceSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `/api/monthly-feedback/${id}?userId=${user.id}`
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
export function useGetMonthlyFeedbackList() {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "list"],
    queryFn: async () => {
      const supabase = getServiceSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `/api/monthly-feedback/list?userId=${user.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch monthly feedback list");
      }

      const result = await response.json();
      return result.data;
    },
  });
}
