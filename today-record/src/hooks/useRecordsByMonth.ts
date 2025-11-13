import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { Record } from "./useRecords";

/**
 * 특정 월의 records 조회
 */
const fetchRecordsByMonth = async (
  year: number,
  month: number
): Promise<Record[]> => {
  const userId = await getCurrentUserId();

  // 해당 월의 시작일과 종료일 계산
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
    year,
    month,
    0
  ).getDate()}`;

  const { data, error } = await supabase
    .from(API_ENDPOINTS.RECORDS)
    .select("*")
    .eq("user_id", userId)
    .gte("kst_date", startDate)
    .lte("kst_date", endDate)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  return (data || []) as Record[];
};

/**
 * 월별 records 조회 훅
 */
export const useRecordsByMonth = (year: number, month: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECORDS, "month", year, month],
    queryFn: () => fetchRecordsByMonth(year, month),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    placeholderData: keepPreviousData, // 이전 데이터 유지
  });
};
