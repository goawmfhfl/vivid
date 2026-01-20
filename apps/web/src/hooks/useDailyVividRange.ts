import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyVividRow } from "@/types/daily-vivid";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";

type UseDailyVividRangeParams = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
};

/**
 * 날짜 범위로 daily-vivid 조회
 */
const fetchDailyVividRange = async (
  params: UseDailyVividRangeParams
): Promise<DailyVividRow[]> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", params.start)
    .lte("report_date", params.end)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily vivid range: ${error.message}`);
  }

  // 복호화 처리
  return (data || []).map(
    (item) =>
      decryptDailyVivid(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyVividRow
  );
};

/**
 * 날짜 범위로 daily-vivid 조회 훅
 */
export function useDailyVividRange(params: UseDailyVividRangeParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, "range", params.start, params.end],
    queryFn: () => fetchDailyVividRange(params),
    enabled: !!params.start && !!params.end,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
