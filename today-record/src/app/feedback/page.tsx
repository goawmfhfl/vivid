"use client";

import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const handleBack = () => {
    router.push("/");
  };

  return <DailyFeedbackView date={today} onBack={handleBack} />;
}
