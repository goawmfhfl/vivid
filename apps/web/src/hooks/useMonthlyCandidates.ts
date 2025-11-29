import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { MonthlyCandidate } from "@/types/monthly-candidate";

/**
 * Monthly Candidates 조회 함수
 */
const fetchMonthlyCandidates = async (): Promise<MonthlyCandidate[]> => {
  const userId = await getCurrentUserId();

  const res = await fetch(`/api/monthly-feedback/candidates?userId=${userId}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch monthly candidates");
  }
  const data = await res.json();
  return data.data || [];
};

/**
 * Monthly Candidates 조회 훅
 */
export const useMonthlyCandidates = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
    queryFn: fetchMonthlyCandidates,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    placeholderData: keepPreviousData, // 이전 데이터 유지
  });
};

