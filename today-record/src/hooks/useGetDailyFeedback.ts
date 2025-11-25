import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

const fetchDailyFeedbackByDate = async (
  date: string
): Promise<DailyFeedbackRow | null> => {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .eq("report_date", date)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DailyFeedbackRow | null;
};

const fetchDailyFeedbackById = async (
  id: string
): Promise<DailyFeedbackRow | null> => {
  // id 유효성 검사
  if (!id || id === "undefined" || id === "null" || id.trim() === "") {
    throw new Error("Invalid feedback ID");
  }

  // UUID 형식 검사 (간단한 검사)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const userId = await getCurrentUserId();

  // userId도 유효성 검사
  if (!userId || userId === "undefined" || userId.trim() === "") {
    throw new Error("Invalid user ID");
  }

  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DailyFeedbackRow | null;
};

export const useGetDailyFeedback = (date: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, date],
    queryFn: () => fetchDailyFeedbackByDate(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetDailyFeedbackById = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "id", id],
    queryFn: () => (id ? fetchDailyFeedbackById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
