import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyVividRow } from "@/types/daily-vivid";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";

// Daily Vivid 조회 함수
const fetchDailyVivid = async (
  date: string
): Promise<DailyVividRow | null> => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("report_date", date)
      .single();

    if (error) {
      // 데이터가 없는 경우 null 반환 (에러가 아닌 빈 상태)
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    if (!data) return null;
    // 복호화 처리
    return decryptDailyVivid(
      data as unknown as { [key: string]: unknown }
    ) as unknown as DailyVividRow;
  } catch (error) {
    console.error("일일 비비드 조회 중 오류:", error);
    throw error;
  }
};

// Daily Vivid 조회 훅
export const useDailyVivid = (date: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, date],
    queryFn: () => fetchDailyVivid(date),
    enabled: !!date, // date가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};

// Daily Vivid 생성(트리거) 함수 - 서버 라우트 호출
const createDailyVivid = async (date: string) => {
  const userId = await getCurrentUserId();

  const res = await fetch("/api/daily-vivid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, date }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create daily vivid");
  }
  return (await res.json().catch(() => ({}))) as unknown;
};

// Daily Vivid 생성 훅 (TanStack Query Mutation)
export const useCreateDailyVivid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date }: { date: string }) => createDailyVivid(date),
    onSuccess: (_data, variables) => {
      // 생성 성공 시 해당 날짜의 일일 피드백 쿼리 무효화
      if (variables?.date) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_VIVID, variables.date],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_VIVID],
        });
      }
      // 기록 변화가 반영되도록 records도 새로고침(선택)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    },
    onError: (error) => {
      console.error("일일 비비드 생성 실패:", error);
    },
  });
};
