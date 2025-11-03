import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
// 새로운 daily_feedback 스키마(Row) 타입 (간단 매핑)
export type DailyFeedbackRow = {
  user_id: string;
  report_date: string;
  day_of_week: string | null;
  integrity_score: number | null;
  narrative_summary: string | null;
  emotion_curve: string[];
  narrative: string | null;
  lesson: string | null;
  keywords: string[];
  daily_ai_comment: string | null;
  vision_summary: string | null;
  vision_self: string | null;
  vision_keywords: string[];
  reminder_sentence: string | null;
  vision_ai_feedback: string | null;
  core_insight: string | null;
  learning_source: string | null;
  meta_question: string | null;
  insight_ai_comment: string | null;
  core_feedback: string | null;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string | null;
  ai_message: string | null;
  growth_point: string | null;
  adjustment_point: string | null;
  tomorrow_focus: string | null;
  integrity_reason: string | null;
};

// Daily Feedback 조회 함수
const fetchDailyFeedback = async (
  date: string
): Promise<DailyFeedbackRow | null> => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_FEEDBACK)
      .select("*")
      .eq("user_id", userId)
      .eq("report_date", date)
      .single();

    if (error) {
      // 데이터가 없는 경우 null 반환 (에러가 아닌 빈 상태)
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    if (!data) return null;
    return data as DailyFeedbackRow;
  } catch (error) {
    console.error("일일 피드백 조회 중 오류:", error);
    throw error;
  }
};

// Daily Feedback 조회 훅
export const useDailyFeedback = (date: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, date],
    queryFn: () => fetchDailyFeedback(date),
    enabled: !!date, // date가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};

// Daily Feedback 생성(트리거) 함수 - 서버 라우트 호출
const createDailyFeedback = async (date: string) => {
  const userId = await getCurrentUserId();

  const res = await fetch("/api/daily-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, date }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create daily feedback");
  }
  return (await res.json().catch(() => ({}))) as unknown;
};

// Daily Feedback 생성 훅 (TanStack Query Mutation)
export const useCreateDailyFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date }: { date: string }) => createDailyFeedback(date),
    onSuccess: (_data, variables) => {
      // 생성 성공 시 해당 날짜의 일일 피드백 쿼리 무효화
      if (variables?.date) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK, variables.date],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK],
        });
      }
      // 기록 변화가 반영되도록 records도 새로고침(선택)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    },
    onError: (error) => {
      console.error("일일 피드백 생성 실패:", error);
    },
  });
};
