import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type {
  WeeklyFeedback,
  WeeklyFeedbackListItem,
  WeeklyFeedbackGenerateRequest,
} from "@/types/weekly-feedback";

/**
 * 주간 피드백 리스트 조회
 */
const fetchWeeklyFeedbackList = async (): Promise<WeeklyFeedbackListItem[]> => {
  const userId = await getCurrentUserId();
  const res = await fetch(`/api/weekly-feedback/list?userId=${userId}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch weekly feedback list");
  }
  const data = await res.json();
  return data.data || [];
};

/**
 * 주간 피드백 상세 조회
 */
const fetchWeeklyFeedbackDetail = async (
  id: string
): Promise<WeeklyFeedback | null> => {
  const userId = await getCurrentUserId();
  const res = await fetch(`/api/weekly-feedback/${id}?userId=${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch weekly feedback detail");
  }
  const data = await res.json();
  return data.data || null;
};

/**
 * 주간 피드백 생성
 */
const createWeeklyFeedback = async (
  params: Omit<WeeklyFeedbackGenerateRequest, "userId">
): Promise<WeeklyFeedback> => {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/weekly-feedback/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...params }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create weekly feedback");
  }
  const data = await res.json();
  return data.data;
};

/**
 * 주간 피드백 리스트 조회 훅
 */
export function useWeeklyFeedbackList() {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_FEEDBACK, "list"],
    queryFn: fetchWeeklyFeedbackList,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 주간 피드백 상세 조회 훅
 */
export function useWeeklyFeedbackDetail(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_FEEDBACK, "detail", id],
    queryFn: () => (id ? fetchWeeklyFeedbackDetail(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 주간 피드백 생성 훅
 */
export function useCreateWeeklyFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<WeeklyFeedbackGenerateRequest, "userId">) =>
      createWeeklyFeedback(params),
    onSuccess: () => {
      // 리스트 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WEEKLY_FEEDBACK, "list"],
      });
      // 상세 쿼리도 무효화 (생성된 항목의 경우)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WEEKLY_FEEDBACK, "detail"],
      });
    },
    onError: (error) => {
      console.error("주간 피드백 생성 실패:", error);
    },
  });
}
