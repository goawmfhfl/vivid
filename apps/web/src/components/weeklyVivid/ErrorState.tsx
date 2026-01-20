import { Button } from "../ui/button";

type WeeklyVividErrorStateProps = {
  error: string;
  onRetry?: () => void;
  onBack?: () => void;
};

export function WeeklyVividErrorState({
  error,
  onRetry,
  onBack,
}: WeeklyVividErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#FEF2F2" }}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: "#FCA5A5" }}
          />
        </div>
        <p
          style={{
            color: "#991B1B",
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
        <div className="flex gap-2 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
              }}
            >
              다시 시도
            </Button>
          )}
          {onBack && (
            <Button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm"
              variant="outline"
              style={{
                borderColor: "#6B7A6F",
                color: "#6B7A6F",
              }}
            >
              돌아가기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
