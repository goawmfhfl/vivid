import { Eye, Sparkles } from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";

type LoadingStateProps = {
  state: "loading" | "error" | "empty";
  error?: string | null;
  onBack?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  icon?: React.ReactNode;
};

export function LoadingState({
  state,
  error = null,
  onBack,
  loadingMessage = "불러오는 중…",
  emptyMessage = "데이터가 없습니다",
  emptySubMessage,
  icon,
}: LoadingStateProps) {
  // Loading State
  if (state === "loading") {
    return (
      <div className="text-center py-16">
        <div className="animate-pulse">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#EFE9E3" }}
          >
            {icon ? (
              icon
            ) : (
              <Sparkles className="w-8 h-8" style={{ color: "#6B7A6F" }} />
            )}
          </div>
          <p style={{ color: "#4E4B46", fontSize: "0.95rem" }}>
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (state === "error") {
    return (
      <div className="py-8">
        <Alert
          className="mb-6"
          style={{
            backgroundColor: "#FEF2F2",
            borderColor: "#FCA5A5",
            color: "#991B1B",
          }}
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {onBack && (
          <div className="flex justify-center">
            <Button
              onClick={onBack}
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
              }}
            >
              돌아가기
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Empty State
  if (state === "empty") {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#EFE9E3" }}
        >
          <Eye className="w-8 h-8" style={{ color: "#A0A0A0" }} />
        </div>
        <p className="mb-2" style={{ color: "#4E4B46", fontSize: "0.95rem" }}>
          {emptyMessage}
        </p>
        {emptySubMessage && (
          <p
            className="mb-6"
            style={{ color: "#4E4B46", opacity: 0.6, fontSize: "0.85rem" }}
          >
            {emptySubMessage}
          </p>
        )}
        {onBack && (
          <Button
            onClick={onBack}
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            돌아가기
          </Button>
        )}
      </div>
    );
  }

  return null;
}
