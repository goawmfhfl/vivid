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
    onSuccess: (data, variables) => {
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, "id", variables.id],
        (old) => (old ? { ...old, insight: data.insight } : old)
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID],
      });
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
