"use client";

import { use, useCallback } from "react";
import { MonthlyVividView } from "@/components/monthlyVivid/MonthlyVividView";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";

export default function MonthlyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const handleBack = useCallback(() => {
    // 월간 흐름 및 월간 후보 데이터를 무효화하여 최신 데이터를 가져오도록 함
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.MONTHLY_VIVID, "recent-trends"],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
    });
    
    router.push("/reports/monthly");
  }, [queryClient, router]);

  return <MonthlyVividView id={id} onBack={handleBack} />;
}
