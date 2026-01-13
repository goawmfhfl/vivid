import { Button } from "../ui/button";

type WeeklyFeedbackEmptyStateProps = {
  onBack: () => void;
};

export function WeeklyFeedbackEmptyState({
  onBack,
}: WeeklyFeedbackEmptyStateProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <div className="text-center py-16">
        <p
          style={{
            color: "#4E4B46",
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}
        >
          주간 VIVID 데이터를 찾을 수 없습니다.
        </p>
        <Button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "#6B7A6F",
            color: "white",
          }}
        >
          돌아가기
        </Button>
      </div>
    </div>
  );
}
