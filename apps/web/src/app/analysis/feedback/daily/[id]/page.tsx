"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { DailyFeedbackView } from "@/components/dailyFeedback/DailyFeedbackView";

export default function DailyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleBack = () => {
    router.push("/analysis");
  };

  return <DailyFeedbackView id={resolvedParams.id} onBack={handleBack} />;
}
