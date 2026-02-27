"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DailyVividView } from "@/components/dailyVivid/DailyVividView";
import { withAuth } from "@/components/auth";

function DateFeedbackPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const router = useRouter();
  const { date: dateStr } = use(params);

  const handleBack = () => {
    router.push("/logs");
  };

  return <DailyVividView date={dateStr} onBack={handleBack} />;
}

export default withAuth(DateFeedbackPage);
