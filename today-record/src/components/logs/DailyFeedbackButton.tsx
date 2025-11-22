import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import { toISODate } from "./calendar-utils";

interface DailyFeedbackButtonProps {
  selectedDate: Date;
}

export function DailyFeedbackButton({
  selectedDate,
}: DailyFeedbackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const dateStr = toISODate(selectedDate);
    router.push(`/analysis/feedback/daily/${dateStr}`);
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
