import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/constants";
import type { UserTrendsRow } from "@/types/user-trends";

type UseUserTrendsWeeklyOptions = {
  enabled?: boolean;
  count?: number;
  mode?: "latest" | "history";
};

async function fetchUserTrendsWeekly(
  mode: "latest" | "history",
  count: number
): Promise<UserTrendsRow[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("인증이 필요합니다.");
  }

  const response = await fetch(
    `/api/user-trends/weekly?mode=${mode}&count=${count}`,
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch user trends weekly");
  }

  const result = await response.json();
  return (result?.data ?? []) as UserTrendsRow[];
}

export function useUserTrendsWeekly(options?: UseUserTrendsWeeklyOptions) {
  const enabled = options?.enabled ?? true;
  const count = options?.count ?? 4;
  const mode = options?.mode ?? "history";

  return useQuery({
    queryKey: [QUERY_KEYS.USER_TRENDS, "weekly", mode, count],
    queryFn: () => fetchUserTrendsWeekly(mode, count),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
