"use client";

import {
  DailyFeedbackView,
  DailyReportData,
} from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";
import { useDailyFeedback } from "@/hooks/useDailyFeedback";

export default function FeedbackPage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];
  const { data: feedback } = useDailyFeedback(today);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <DailyFeedbackView
      data={feedback as DailyReportData | undefined}
      onBack={handleBack}
    />
  );
}
