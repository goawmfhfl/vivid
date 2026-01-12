"use client";

import { MonthlyFeedbackView } from "@/components/monthlyFeedback/MonthlyFeedbackView";
import { useRouter, useParams } from "next/navigation";

export default function MonthlyViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleBack = () => {
    router.push("/reports/monthly");
  };

  return <MonthlyFeedbackView id={id} onBack={handleBack} />;
}
