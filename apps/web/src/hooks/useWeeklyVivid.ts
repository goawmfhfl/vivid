import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type {
  WeeklyVivid,
  WeeklyVividListItem,
  WeeklyVividGenerateRequest,
} from "@/types/weekly-vivid";
import type { TrackingInfo } from "@/app/api/types";

/**
 * 주간 vivid 리스트 조회
 */
const fetchWeeklyVividList = async (): Promise<WeeklyVividListItem[]> => {
  const userId = await getCurrentUserId();
  const res = await fetch(`/api/weekly-vivid/list?userId=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch weekly vivid list");
  }
  const data = await res.json();
  return data.data || [];
};

/**
 * 주간 vivid 상세 조회 (id 기반)
 */
const fetchWeeklyVividDetail = async (
  id: string
): Promise<WeeklyVivid | null> => {
  const userId = await getCurrentUserId();
  const res = await fetch(`/api/weekly-vivid/${id}?userId=${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch weekly vivid detail");
  }
  const data = await res.json();
  return data.data || null;
};

/**
 * 주간 피드백 생성
 */
const createWeeklyVivid = async (
  params: WeeklyVividGenerateRequest
): Promise<WeeklyVivid & { __tracking?: TrackingInfo[] }> => {
  const userId = await getCurrentUserId();
  
  const res = await fetch("/api/weekly-vivid/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...params }),
  });
  if (!res.ok) {
    let errorMessage = "주간 비비드 생성에 실패했습니다.";
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
export function useWeeklyVividList() {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_VIVID, "list"],
    queryFn: fetchWeeklyVividList,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 주간 vivid 상세 조회 훅 (id 기반)
 */
export function useWeeklyVividDetail(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_VIVID, "detail", id],
    queryFn: () => (id ? fetchWeeklyVividDetail(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 주간 vivid 생성 훅
 */
export function useCreateWeeklyVivid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: WeeklyVividGenerateRequest) =>
      createWeeklyVivid(params),
    onSuccess: (data) => {
      // 리스트 쿼리 캐시에 새 피드백을 리스트 앞에 추가
      queryClient.setQueryData<WeeklyVividListItem[]>(
        [QUERY_KEYS.WEEKLY_VIVID, "list"],
        (oldList = []) => {
          // WeeklyVivid를 WeeklyVividListItem으로 변환
          const newItem: WeeklyVividListItem = {
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
        queryClient.setQueryData<WeeklyVivid | null>(
          [QUERY_KEYS.WEEKLY_VIVID, "detail", data.id],
          data
        );
      }
    },
    onError: (error) => {
      console.error("주간 vivid 생성 실패:", error);
    },
  });
}
