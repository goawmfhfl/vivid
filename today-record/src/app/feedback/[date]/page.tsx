"use client";

import { useParams, useRouter } from "next/navigation";
import { DailyFeedbackView } from "@/components/DailyFeedbackView";

export default function DateFeedbackPage() {
  const params = useParams();
  const router = useRouter();

  const dateStr = params.date as string;

  const handleBack = () => {
    router.push("/logs");
  };

  return <DailyFeedbackView date={dateStr} onBack={handleBack} />;
}
