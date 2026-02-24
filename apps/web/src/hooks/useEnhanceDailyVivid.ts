import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import { useToastStore } from "@/store/useToastStore";
import type { DailyVividRow, DailyVividInsight } from "@/types/daily-vivid";

async function enhanceDailyVivid(id: string, forceRegenerate = false): Promise<{
  insight: DailyVividInsight;
}> {
  const userId = await getCurrentUserId();
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`/api/daily-vivid/${id}/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, forceRegenerate }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(text || "Failed to generate insight") as Error & { status?: number };
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      if (!data.insight) {
        throw new Error("Invalid insight response");
      }
      return { insight: data.insight };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const status = (err as { status?: number })?.status;
      const isRetryable =
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        lastError!.message.includes("fetch") ||
        lastError!.message.includes("network") ||
        lastError!.message.includes("Failed to fetch");
      if (attempt < maxRetries && isRetryable) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      } else {
        throw lastError;
      }
    }
  }
  throw lastError ?? new Error("Failed to generate insight");
}

export function useEnhanceDailyVivid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, forceRegenerate }: { id: string; forceRegenerate?: boolean }) =>
      enhanceDailyVivid(id, forceRegenerate),
    onSuccess: async (data, variables) => {
      const keyById = [QUERY_KEYS.DAILY_VIVID, "id", variables.id] as const;
      const cached = queryClient.getQueryData<DailyVividRow | null>(keyById);

      // 1. 즉시 캐시 갱신 (id 기반 쿼리 - 상세 페이지에서 사용)
      if (cached && (cached as { id?: string }).id === variables.id) {
        queryClient.setQueryData<DailyVividRow | null>(keyById, {
          ...cached,
          insight: data.insight,
        });
      }

      // 2. report_date 기반 쿼리도 갱신 (해당 날짜로 진입한 경우)
      const reportDate = cached?.report_date;
      if (reportDate) {
        const keyByDate = [QUERY_KEYS.DAILY_VIVID, reportDate, "vivid"] as const;
        queryClient.setQueriesData<DailyVividRow | null>(
          { queryKey: keyByDate },
          (old) => {
            if (!old || (old as { id?: string }).id !== variables.id) return old;
            return { ...old, insight: data.insight };
          }
        );
      }

      // 3. 서버에서 refetch로 최종 동기화 (DB에 저장된 데이터 확보)
      await queryClient.refetchQueries({ queryKey: keyById });
    },
    onError: (error) => {
      console.warn("[useEnhanceDailyVivid] Insight generation failed:", error);
      useToastStore.getState().showToast(
        "인사이트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        4000
      );
    },
  });
}
