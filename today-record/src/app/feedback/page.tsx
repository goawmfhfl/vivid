"use client";

import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";
import { getKSTDateString } from "@/lib/date-utils";
import { withAuth } from "@/components/auth";

function FeedbackPage() {
  const router = useRouter();

  const today = getKSTDateString();

  const handleBack = () => {
    router.push("/");
  };

  return <DailyFeedbackView date={today} onBack={handleBack} />;
}

export default withAuth(FeedbackPage);
