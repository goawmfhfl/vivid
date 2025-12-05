import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import {
  useGetMonthlyFeedback,
  useGetMonthlyFeedbackById,
} from "@/hooks/useGetMonthlyFeedback";
import { MonthlyFeedbackReport } from "./MonthlyFeedbackReport";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";

type MonthlyFeedbackViewProps = {
  month?: string;
  id?: string;
  onBack: () => void;
};

export function MonthlyFeedbackView({
  month,
  id,
  onBack,
}: MonthlyFeedbackViewProps) {
  // id 유효성 검사
  const isValidId =
    id && id !== "undefined" && id !== "null" && id.trim() !== "";

  const {
    data: dataByMonth,
    isLoading: isLoadingByMonth,
    error: errorByMonth,
    refetch: refetchByMonth,
  } = useGetMonthlyFeedback(month || null);
  const {
    data: dataById,
    isLoading: isLoadingById,
    error: errorById,
    refetch: refetchById,
  } = useGetMonthlyFeedbackById(isValidId ? id : null);

  // id가 유효하면 id로 조회, 없으면 month로 조회
  const data = isValidId ? dataById : dataByMonth;
  const isLoading = isValidId ? isLoadingById : isLoadingByMonth;
  const error = isValidId ? errorById : errorByMonth;
  const refetch = isValidId ? refetchById : refetchByMonth;

  if (isLoading) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
            style={{ color: "#6B7A6F" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <div className="py-16">
            <LoadingSpinner message="월간 피드백을 불러오는 중..." size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
            style={{ color: "#6B7A6F" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <ErrorDisplay
            message={error instanceof Error ? error.message : String(error)}
            onRetry={() => refetch()}
            showMessage={true}
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
            style={{ color: "#6B7A6F" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <div className="py-16 text-center">
            <p className="text-lg mb-2" style={{ color: "#6B7A6F" }}>
              월간 피드백을 찾을 수 없습니다
            </p>
            <p className="text-sm" style={{ color: "#6B7A6F" }}>
              {month
                ? `${month}의 월간 피드백이 아직 생성되지 않았습니다.`
                : "해당 월간 피드백이 존재하지 않습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <MonthlyFeedbackReport data={data} onBack={onBack} />;
}
