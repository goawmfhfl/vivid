import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toISODate } from "./calendar-utils";
import { useCreateDailyFeedback } from "@/hooks/useCreateDailyFeedback";

interface CreateDailyFeedbackButtonProps {
  selectedDate: Date;
}

export function CreateDailyFeedbackButton({
  selectedDate,
}: CreateDailyFeedbackButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const createDailyFeedback = useCreateDailyFeedback();

  const handleClick = async () => {
    const dateStr = toISODate(selectedDate);
    setIsGenerating(true);

    try {
      const createdFeedback = await createDailyFeedback.mutateAsync({
        date: dateStr,
      });

      // 생성된 피드백 ID 확인
      if (!createdFeedback?.id) {
        throw new Error("생성된 피드백에 ID가 없습니다.");
      }

      // DB 동기화를 위한 짧은 딜레이 추가
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 생성 성공 후 피드백 페이지로 이동 (id 사용)
      router.push(`/analysis/feedback/daily/${createdFeedback.id}`);
    } catch (error) {
      console.error("AI 리뷰 생성 실패:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`AI 리뷰 생성에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleClick}
        disabled={isGenerating}
        className="rounded-full px-6 py-3 flex items-center gap-2"
        style={{
          backgroundColor: "#A8BBA8",
          color: "white",
          fontSize: "0.9rem",
          fontWeight: "500",
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 리뷰 생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI 리뷰 생성하기
          </>
        )}
      </Button>
    </div>
  );
}
