import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type {
  WeeklyFeedback,
  WeeklyFeedbackListItem,
  WeeklyFeedbackGenerateRequest,
} from "@/types/weekly-feedback";
import type { TrackingInfo } from "@/app/api/types";

/**
 * 주간 vivid 리스트 조회
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
 * 주간 vivid 상세 조회 (id 기반)
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
): Promise<WeeklyFeedback & { __tracking?: TrackingInfo[] }> => {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/weekly-feedback/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...params }),
  });
  if (!res.ok) {
    let errorMessage = "주간 피드백 생성에 실패했습니다.";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 텍스트로 시도
      const text = await res.text().catch(() => "");
      if (text) {
        try {
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      }
    }
    const error = new Error(errorMessage);
    (error as { status?: number }).status = res.status;
    throw error;
  }
  const data = await res.json();

  // 추적 정보가 있으면 결과에 포함
  if (data.tracking) {
    return { ...data.data, __tracking: data.tracking };
  }

  return data.data;
};

/**
 * 주간 vivid 리스트 조회 훅
 */
export function useWeeklyFeedbackList() {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_FEEDBACK, "list"],
    queryFn: fetchWeeklyFeedbackList,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 주간 vivid 상세 조회 훅 (id 기반)
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
 * 주간 vivid 생성 훅
 */
export function useCreateWeeklyFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<WeeklyFeedbackGenerateRequest, "userId">) =>
      createWeeklyFeedback(params),
    onSuccess: (data) => {
      // 리스트 쿼리 캐시에 새 피드백을 리스트 앞에 추가
      queryClient.setQueryData<WeeklyFeedbackListItem[]>(
        [QUERY_KEYS.WEEKLY_FEEDBACK, "list"],
        (oldList = []) => {
          // WeeklyFeedback을 WeeklyFeedbackListItem으로 변환
          const newItem: WeeklyFeedbackListItem = {
            id: data.id!,
            title: `${data.week_range.start} ~ ${data.week_range.end}`,
            week_range: {
              start: data.week_range.start,
              end: data.week_range.end,
            },
            is_ai_generated: data.is_ai_generated,
            created_at: data.created_at,
          };

          // 중복 체크 (같은 id가 이미 있는 경우)
          const exists = oldList.some((item) => item.id === newItem.id);
          if (exists) {
            // 이미 있으면 업데이트
            return oldList.map((item) =>
              item.id === newItem.id ? newItem : item
            );
          }

          // 리스트 앞에 추가
          return [newItem, ...oldList];
        }
      );

      // 생성된 피드백의 id가 있으면 상세 쿼리에 데이터 설정
      if (data?.id) {
        queryClient.setQueryData<WeeklyFeedback | null>(
          [QUERY_KEYS.WEEKLY_FEEDBACK, "detail", data.id],
          data
        );
      }
    },
    onError: (error) => {
      console.error("주간 vivid 생성 실패:", error);
    },
  });
}
