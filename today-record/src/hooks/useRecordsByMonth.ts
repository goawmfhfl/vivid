import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/constants";
import type { Record } from "./useRecords";

/**
 * 특정 월의 records 조회
 */
const fetchRecordsByMonth = async (
  year: number,
  month: number
): Promise<Record[]> => {
  // 해당 월의 시작일과 종료일 계산
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
    year,
    month,
    0
  ).getDate()}`;

  // 세션 토큰 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("로그인이 필요합니다.");
  }

  // API 라우트를 통해 조회 (서버 사이드에서 복호화)
  // 월별 조회는 쿼리 파라미터로 필터링
  const response = await fetch(
    `/api/records?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch records");
  }

  const result = await response.json();
  return (result.data || []) as Record[];
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
