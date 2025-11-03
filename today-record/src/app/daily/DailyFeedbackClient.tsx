"use client";

import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { useRouter } from "next/navigation";
import { dummyData } from "@/components/DailyFeedbackView";

export function DailyFeedbackClient({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  // useDailyFeedback 훅으로 데이터 조회
  // const { data: feedback } = useDailyFeedback(initialDate);

  // 에러 메시지 변환
  const handleBack = () => {
    router.push("/");
  };

  return <DailyFeedbackView data={dummyData} onBack={handleBack} />;
}
