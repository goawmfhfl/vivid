import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import { toISODate } from "./calendar-utils";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";

interface DailyFeedbackButtonProps {
  selectedDate: Date;
}

export function DailyFeedbackButton({
  selectedDate,
}: DailyFeedbackButtonProps) {
  const router = useRouter();
  const dateStr = toISODate(selectedDate);
  const { data: feedback } = useGetDailyFeedback(dateStr);

  const handleClick = () => {
    if (feedback?.id) {
      router.push(`/analysis/feedback/daily/${feedback.id}`);
    } else {
      // 피드백이 없으면 생성 페이지로 이동하거나 에러 처리
      console.error("VIVID를 찾을 수 없습니다.");
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleClick}
        className="rounded-full px-6 py-3 flex items-center gap-2"
        style={{
          backgroundColor: "#A8BBA8",
          color: "white",
          fontSize: "0.9rem",
          fontWeight: "500",
        }}
      >
        <Sparkles className="w-4 h-4" />
        AI 리뷰 보기
      </Button>
    </div>
  );
}
