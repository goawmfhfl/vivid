import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";

/**
 * 특정 월의 daily-feedback이 있는 날짜 목록 조회
 */
const fetchDailyFeedbackDatesByMonth = async (
  year: number,
  month: number
): Promise<string[]> => {
  const userId = await getCurrentUserId();

  // 해당 월의 시작일과 종료일 계산
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
    year,
    month,
    0
  ).getDate()}`;

  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("report_date")
    .eq("user_id", userId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily feedback dates: ${error.message}`);
  }

  return (data || []).map((item) => item.report_date as string);
};

/**
 * 월별 daily-feedback 날짜 목록 조회 훅
 */
export const useDailyFeedbackDatesByMonth = (year: number, month: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "dates", year, month],
    queryFn: () => fetchDailyFeedbackDatesByMonth(year, month),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    placeholderData: keepPreviousData, // 이전 데이터 유지
  });
};
