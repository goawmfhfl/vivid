import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

const fetchDailyFeedback = async (
  date: string
): Promise<DailyFeedbackRow | null> => {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .eq("report_date", date)
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return data as unknown as DailyFeedbackRow;
};

export const useGetDailyFeedback = (date: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, date],
    queryFn: () => fetchDailyFeedback(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
  });
};
