import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

const createDailyFeedback = async (date: string): Promise<DailyFeedbackRow> => {
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
  const response = await res.json();
  return response.data as DailyFeedbackRow;
};

export const useCreateDailyFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date }: { date: string }) => createDailyFeedback(date),
    onSuccess: (data, variables) => {
      if (!variables?.date) {
        // 날짜가 없으면 전체 무효화로 폴백
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_FEEDBACK],
        });
        return;
      }

      // 해당 날짜의 DAILY_FEEDBACK 쿼리에 생성된 피드백 데이터 설정
      queryClient.setQueryData<DailyFeedbackRow | null>(
        [QUERY_KEYS.DAILY_FEEDBACK, variables.date],
        data || null
      );

      // 생성된 피드백의 ID로 쿼리도 업데이트 (있는 경우)
      if (data?.id) {
        queryClient.setQueryData<DailyFeedbackRow | null>(
          [QUERY_KEYS.DAILY_FEEDBACK, "id", data.id],
          data || null
        );
      }

      // useRecordsAndFeedbackDates의 aiFeedbackDates 업데이트 (is_ai_generated가 true인 경우만)
      if (data?.is_ai_generated) {
        queryClient.setQueryData<{
          recordDates: string[];
          aiFeedbackDates: string[];
        }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
          if (!oldData) {
            return {
              recordDates: [],
              aiFeedbackDates: [variables.date],
            };
          }

          const { recordDates, aiFeedbackDates } = oldData;
          // 날짜가 이미 있는지 확인
          if (!aiFeedbackDates.includes(variables.date)) {
            const updatedAiFeedbackDates = [
              ...aiFeedbackDates,
              variables.date,
            ].sort();
            return {
              recordDates,
              aiFeedbackDates: updatedAiFeedbackDates,
            };
          }
          return oldData;
        });
      }

      // 날짜별 쿼리 무효화 (월별 dates 쿼리는 별도로 관리되므로 무효화)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "dates"],
      });
    },
    onError: (error) => {
      console.error("일일 피드백 생성 실패:", error);
    },
  });
};
