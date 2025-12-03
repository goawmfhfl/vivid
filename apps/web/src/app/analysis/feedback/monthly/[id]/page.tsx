"use client";

import { MonthlyFeedbackView } from "@/components/monthlyFeedback/MonthlyFeedbackView";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function MonthlyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleBack = () => {
    router.push("/analysis");
  };

  return <MonthlyFeedbackView id={resolvedParams.id} onBack={handleBack} />;
}
