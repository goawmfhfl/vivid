import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyVividRow } from "@/types/daily-vivid";

type DailyVividGenerationType = "vivid" | "review";

const createDailyVivid = async (
  date: string,
  generationType: DailyVividGenerationType = "vivid",
  isRegeneration = false
): Promise<DailyVividRow> => {
  const userId = await getCurrentUserId();
  const startTime = Date.now();

  const body: Record<string, unknown> = {
    userId,
    date,
    generation_type: generationType,
  };
  if (isRegeneration) {
    body.is_regeneration = true;
  }

  const res = await fetch("/api/daily-vivid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const endTime = Date.now();
  const durationSeconds = (endTime - startTime) / 1000;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create daily vivid");
  }
  const response = await res.json();
  const result = response.data as DailyVividRow;

  // 생성 시간을 포함하여 다시 요청 (업데이트)
  if (result?.id) {
    try {
      const durationBody: Record<string, unknown> = {
        userId,
        date,
        generation_duration_seconds: durationSeconds,
        generation_type: generationType,
      };
      if (isRegeneration) durationBody.is_regeneration = true;
      await fetch("/api/daily-vivid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(durationBody),
      });
    } catch (error) {
      console.warn("생성 시간 업데이트 실패:", error);
    }
  }

  return { ...result, generation_duration_seconds: durationSeconds };
};

export type CreateDailyVividVariables = {
  date: string;
  generation_type?: DailyVividGenerationType;
  is_regeneration?: boolean;
};

export const useCreateDailyVivid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      date,
      generation_type: generationType = "vivid",
      is_regeneration: isRegeneration = false,
    }: CreateDailyVividVariables) =>
      createDailyVivid(date, generationType, isRegeneration),
    onSuccess: (data, variables) => {
      if (!variables?.date) {
        // 날짜가 없으면 전체 무효화로 폴백
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_VIVID],
        });
        return;
      }

      const genType = variables.generation_type ?? "vivid";
      // 해당 날짜·타입의 DAILY_VIVID 쿼리에 생성된 피드백 데이터 설정
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, variables.date, genType],
        data || null
      );

      // 생성 직후 캐시 무효화로 최신 데이터 강제 동기화 (해당 날짜의 vivid/review 모두)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, variables.date],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, "today"],
      });

      // 생성된 피드백의 ID로 쿼리도 업데이트 (있는 경우)
      if (data?.id) {
        queryClient.setQueryData<DailyVividRow | null>(
          [QUERY_KEYS.DAILY_VIVID, "id", data.id],
          data || null
        );
      }

      // useRecordsAndFeedbackDates의 aiFeedbackDates 업데이트 (비비드 또는 회고 생성 시)
      const hasAiFeedback =
        data?.type === "vivid" ||
        data?.type === "review" ||
        data?.is_vivid_ai_generated === true ||
        data?.is_review_ai_generated === true;
      if (hasAiFeedback) {
      queryClient.setQueryData<{
        recordDates: string[];
        aiFeedbackDates: string[];
        vividFeedbackDates: string[];
        reviewFeedbackDates: string[];
      }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
          if (!oldData) {
            return oldData;
          }

        const recordDates = oldData.recordDates;
        const vividFeedbackDates = oldData.vividFeedbackDates ?? [];
        const reviewFeedbackDates = oldData.reviewFeedbackDates ?? [];
        let nextVividDates = vividFeedbackDates;
        let nextReviewDates = reviewFeedbackDates;

        if (
          (data?.type === "vivid" || data?.is_vivid_ai_generated === true) &&
          !vividFeedbackDates.includes(variables.date)
        ) {
          nextVividDates = [...vividFeedbackDates, variables.date].sort();
        }

        if (
          (data?.type === "review" || data?.is_review_ai_generated === true) &&
          !reviewFeedbackDates.includes(variables.date)
        ) {
          nextReviewDates = [...reviewFeedbackDates, variables.date].sort();
        }

        if (
          nextVividDates === vividFeedbackDates &&
          nextReviewDates === reviewFeedbackDates
        ) {
          return oldData;
        }

        return {
          recordDates,
          vividFeedbackDates: nextVividDates,
          reviewFeedbackDates: nextReviewDates,
          aiFeedbackDates: Array.from(
            new Set([...nextVividDates, ...nextReviewDates])
          ).sort(),
        };
        });
      }

      // 날짜별 쿼리 무효화 (월별 dates 쿼리는 별도로 관리되므로 무효화)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, "dates"],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RECORDS, "dates", "all"],
      });

    },
    onError: (error) => {
      console.error("일일 비비드 생성 실패:", error);
    },
  });
};
