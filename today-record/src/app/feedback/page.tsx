"use client";

import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";
import { getKSTDateString } from "@/lib/date-utils";

export default function FeedbackPage() {
  const router = useRouter();

  const today = getKSTDateString();

  const handleBack = () => {
    router.push("/");
  };

  return <DailyFeedbackView date={today} onBack={handleBack} />;
}
