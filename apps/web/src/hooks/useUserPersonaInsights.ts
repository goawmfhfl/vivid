import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { supabase } from "@/lib/supabase";
import type { UserPersonaInsightsResponse } from "@/app/api/user-persona/insights/route";

export async function fetchUserPersonaInsights(): Promise<UserPersonaInsightsResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("인증이 필요합니다.");
  }

  const response = await fetch("/api/user-persona/insights", {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch user persona insights");
  }
  return response.json();
}

export type UseUserPersonaInsightsOptions = { enabled?: boolean };

export function useUserPersonaInsights(options?: UseUserPersonaInsightsOptions) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PERSONA_INSIGHTS],
    queryFn: fetchUserPersonaInsights,
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
