"use client";

import { useParams, useRouter } from "next/navigation";
import { DailyVividView } from "@/components/dailyVivid/DailyVividView";
import { withAuth } from "@/components/auth";

function DateFeedbackPage() {
  const params = useParams();
  const router = useRouter();

  const dateStr = (params?.date ?? "") as string;

  const handleBack = () => {
    router.push("/logs");
  };

  return <DailyVividView date={dateStr} onBack={handleBack} />;
}

export default withAuth(DateFeedbackPage);
