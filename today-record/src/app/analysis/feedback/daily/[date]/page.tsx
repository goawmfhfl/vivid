"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { DailyFeedbackView } from "@/components/DailyFeedbackView";

export default function DailyViewPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleBack = () => {
    router.push("/analysis");
  };

  return <DailyFeedbackView date={resolvedParams.date} onBack={handleBack} />;
}
