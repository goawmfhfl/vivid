import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  useGetDailyVivid,
  useGetDailyVividById,
} from "@/hooks/useGetDailyVivid";
import { VisionSection } from "./Vision";
import { EmptyState } from "./States";
import { mapDailyVividRowToReport } from "./mappers";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import { COLORS, SPACING } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { VividFeedbackSection } from "../feedback/VividFeedbackSection";

type DailyVividViewProps = {
  date?: string;
  id?: string;
  onBack: () => void;
};

export function DailyVividView({
  date,
  id,
  onBack,
}: DailyVividViewProps) {
  const router = useRouter();

  // id 유효성 검사: undefined, "undefined", 빈 문자열 등 제외
  const isValidId =
    id &&
    id !== "undefined" &&
    id !== "null" &&
    id.trim() !== "" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const {
    data: dataByDate,
    isLoading: isLoadingByDate,
    error: errorByDate,
    refetch: refetchByDate,
  } = useGetDailyVivid(date || "");
  const {
    data: dataById,
    isLoading: isLoadingById,
    error: errorById,
    refetch: refetchById,
  } = useGetDailyVividById(isValidId ? id : null);

  // id가 유효하면 id로 조회, 없으면 date로 조회
  const data = isValidId ? dataById : dataByDate;
  const isLoading = isValidId ? isLoadingById : isLoadingByDate;
  const error = isValidId ? errorById : errorByDate;
  const refetch = isValidId ? refetchById : refetchByDate;

  const view = data ? mapDailyVividRowToReport(data) : null;
  const { isPro } = useSubscription();


  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f5f3ef", paddingBottom: "8rem" }}
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
            <LoadingSpinner
              message="데일리 VIVID를 불러오는 중..."
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#f5f3ef", paddingBottom: "8rem" }}
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
            <ErrorDisplay
              size="md"
              showMessage={true}
              onRetry={() => refetch()}
              message="데일리 VIVID를 불러오는 중 오류가 발생했습니다."
            />
          </div>
        </div>
      </div>
    );
  }

  if (!view) return <EmptyState onBack={onBack} />;

  // 섹션 노출 가드: 리포트 데이터가 null이면 렌더링 제외
  const hasDreamSection = !!(
    (view.current_summary && view.current_summary.trim()) ||
    (view.future_summary && view.future_summary.trim()) ||
    (view.alignment_score !== null && view.alignment_score !== undefined) ||
    (view.user_characteristics && view.user_characteristics.length > 0) ||
    (view.aspired_traits && view.aspired_traits.length > 0)
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f5f3ef", paddingBottom: "8rem" }}
    >
      <div
        className={`${SPACING.page.maxWidth} mx-auto ${SPACING.page.padding}`}
      >
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-2"
            style={{ color: COLORS.brand.primary }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div className="text-right">
            <div
              className="text-sm font-medium"
              style={{ color: COLORS.text.secondary }}
            >
              {view.dayOfWeek}
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: COLORS.text.primary }}
            >
              {view.date}
            </div>
          </div>
        </div>

        {/* 오늘의 VIVID 섹션 */}
        {hasDreamSection && (
          <ScrollAnimation>
            <div className="mb-16">
              <VisionSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {/* 피드백 섹션 */}
        <ScrollAnimation delay={200}>
          <VividFeedbackSection pageType="daily" />
        </ScrollAnimation>

        <div className="flex justify-center pt-4 pb-32">
          <Button
            onClick={() => router.push("/")}
            className="rounded-full px-8 py-6"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            새로운 기록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
