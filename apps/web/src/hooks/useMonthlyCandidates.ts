import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { MonthlyCandidate } from "@/types/monthly-candidate";

/**
 * Monthly Candidates 조회 함수
 */
type FetchOptions = { force?: boolean };

export const fetchMonthlyCandidates = async (
  options?: FetchOptions
): Promise<MonthlyCandidate[]> => {
  const userId = await getCurrentUserId();
  const forceParam = options?.force ? "&force=1" : "";

  const res = await fetch(`/api/monthly-vivid/candidates?userId=${userId}${forceParam}`, {
    cache: options?.force ? "no-store" : "default",
  });
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
  return useQuery<MonthlyCandidate[]>({
    queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
    queryFn: () => fetchMonthlyCandidates(),
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
    placeholderData: keepPreviousData, // 이전 데이터 유지
  });
};

