"use client";
import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";

export function DailyFeedbackClient({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <DailyFeedbackView date={initialDate} onBack={handleBack} />;
}
