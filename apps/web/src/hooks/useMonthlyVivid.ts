import { useQuery } from "@tanstack/react-query";
import { getCurrentUserCacheContext } from "./useCurrentUser";
import { QUERY_KEYS } from "@/constants";
import type { MonthlyVividListItem } from "@/types/monthly-vivid";
import type { MonthlyVivid } from "@/types/monthly-vivid";

type FetchOptions = { force?: boolean };

export const fetchMonthlyVividList = async (
  options?: FetchOptions
): Promise<MonthlyVividListItem[]> => {
  const { userId, cacheBust } = await getCurrentUserCacheContext();
  const forceParam = options?.force ? "&force=1" : "";
  const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";
  const response = await fetch(
    `/api/monthly-vivid/list?userId=${userId}${forceParam}${cacheParam}`,
    {
      cache: options?.force ? "no-store" : "default",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch monthly vivid list");
  }

  const result = await response.json();
  return result.data as MonthlyVividListItem[];
};

/**
 * 월간 vivid 조회 (month 기반)
 */
export function useMonthlyVivid(month: string | null) {
  return useQuery<MonthlyVivid | null>({
    queryKey: [QUERY_KEYS.MONTHLY_VIVID, month],
    queryFn: async () => {
      if (!month) return null;

      const list = await fetchMonthlyVividList();
      const monthlyVivid = list.find(
        (item: MonthlyVividListItem) => item.month === month
      );

      if (!monthlyVivid) {
        return null;
      }

      // 상세 조회
      const { userId, cacheBust } = await getCurrentUserCacheContext();
      const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";
      const detailResponse = await fetch(
        `/api/monthly-vivid/${monthlyVivid.id}?userId=${userId}${cacheParam}`
      );
      if (!detailResponse.ok) {
        throw new Error("Failed to fetch monthly vivid detail");
      }

      const detailResult = await detailResponse.json();
      return detailResult.data as MonthlyVivid;
    },
    enabled: !!month,
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
  });
}

/**
 * 월간 vivid 조회 (id 기반)
 */
export function useMonthlyVividById(id: string | null) {
  return useQuery<MonthlyVivid | null>({
    queryKey: [QUERY_KEYS.MONTHLY_VIVID, "id", id],
    queryFn: async () => {
      if (!id) return null;

      const { userId, cacheBust } = await getCurrentUserCacheContext();
      const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";
      const response = await fetch(
        `/api/monthly-vivid/${id}?userId=${userId}${cacheParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch monthly vivid");
      }

      const result = await response.json();
      return result.data as MonthlyVivid;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
  });
}

/**
 * 월간 vivid 리스트 조회
 */
export function useMonthlyVividList(enabled: boolean = true) {
  return useQuery<MonthlyVividListItem[]>({
    queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
    queryFn: () => fetchMonthlyVividList(),
    enabled, // enabled 파라미터로 조건부 조회 제어
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
  });
}
