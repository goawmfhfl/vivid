import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { supabase } from "@/lib/supabase";
import type { DailyVividRow } from "@/types/daily-vivid";

const fetchDailyVividInsights = async (count: number): Promise<DailyVividRow[]> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("인증이 필요합니다.");
  }

  const response = await fetch(`/api/daily-vivid/insights?mode=latest&count=${count}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch daily vivid insights");
  }

  const result = await response.json();
  return (result?.data ?? []) as DailyVividRow[];
};

type UseDailyVividInsightsOptions = {
  enabled?: boolean;
  count?: number;
};

export const useDailyVividInsights = (options?: UseDailyVividInsightsOptions) => {
  const enabled = options?.enabled ?? true;
  const count = options?.count ?? 7;

  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, "insights", "latest", count],
    queryFn: () => fetchDailyVividInsights(count),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
