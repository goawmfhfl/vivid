import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  useGetDailyVivid,
  useGetDailyVividById,
} from "@/hooks/useGetDailyVivid";
import { useCreateDailyVivid } from "@/hooks/useCreateDailyVivid";
import { useEnhanceDailyVivid } from "@/hooks/useEnhanceDailyVivid";
import { VisionSection } from "./Vision";
import { ReviewReportSection } from "./review";
import { getDailyVividType } from "@/types/daily-vivid";
import { EmptyState } from "./States";
import { mapDailyVividRowToReport } from "./mappers";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import { CircularProgress } from "../ui/CircularProgress";
import { COLORS, SPACING } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { VividFeedbackSection } from "../feedback/VividFeedbackSection";
import { useModalStore } from "@/store/useModalStore";
import { QUERY_KEYS } from "@/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

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
  const queryClient = useQueryClient();

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
  const createDailyVivid = useCreateDailyVivid();
  const enhanceMutation = useEnhanceDailyVivid();
  const insightTriggeredRef = useRef(false);
  const openErrorModal = useModalStore((s) => s.openErrorModal);
  const setDailyVividProgress = useModalStore((s) => s.setDailyVividProgress);
  const clearDailyVividProgress = useModalStore((s) => s.clearDailyVividProgress);

  const [timerProgress, setTimerProgress] = useState<number | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);

  const rowType = data ? getDailyVividType(data) : "vivid";

  // Pro 전용: 상세 페이지 마운트 시 인사이트 생성 요청 (type=vivid일 때만)
  useEffect(() => {
    if (
      !isPro ||
      !data?.id ||
      rowType !== "vivid" ||
      data.insight ||
      data.insight_message ||
      insightTriggeredRef.current ||
      enhanceMutation.isPending
    ) {
      return;
    }
    insightTriggeredRef.current = true;
    enhanceMutation.mutate({ id: data.id });
  }, [
    isPro,
    data?.id,
    rowType,
    data?.insight,
    data?.insight_message,
    enhanceMutation,
  ]);

  const isRegenerating =
    createDailyVivid.isPending || timerProgress !== null;

  const generationType = rowType;
  const canRegenerate =
    !!data &&
    !data.is_regenerated &&
    !!data.report_date &&
    !!data.id;

  // 타이머 기반 progress (재생성 중)
  useEffect(() => {
    if (timerStartTime === null) return;
    const DURATION_MS = 20000;
    const TARGET = 99;
    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartTime;
      if (elapsed >= DURATION_MS) {
        setTimerProgress(TARGET);
        clearInterval(interval);
        return;
      }
      setTimerProgress((elapsed / DURATION_MS) * TARGET);
    }, 100);
    return () => clearInterval(interval);
  }, [timerStartTime]);

  const progressPercentage = Math.min(timerProgress ?? 0, 99);

  const handleRegenerate = async () => {
    if (!canRegenerate || !data?.report_date || isRegenerating) return;
    try {
      setTimerStartTime(Date.now());
      setTimerProgress(0);
      setDailyVividProgress(data.report_date, {
        date: data.report_date,
        current: 0,
        total: 1,
        currentStep: "재생성 중",
      });

      const feedbackData = await createDailyVivid.mutateAsync({
        date: data.report_date,
        generation_type: generationType,
        is_regeneration: true,
      });

      setTimerStartTime(null);
      setTimerProgress(null);
      clearDailyVividProgress(data.report_date);

      if (feedbackData?.id) {
        setIsRegenerateDialogOpen(false);
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DAILY_VIVID, "id", feedbackData.id],
        });
        await queryClient.refetchQueries({
          queryKey: [QUERY_KEYS.DAILY_VIVID, "id", feedbackData.id],
        });
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      setTimerStartTime(null);
      setTimerProgress(null);
      clearDailyVividProgress(data.report_date);
      let msg = "재생성에 실패했습니다.";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as { error?: string };
          msg = parsed?.error ?? error.message;
        } catch {
          msg = error.message;
        }
      }
      setIsRegenerateDialogOpen(false);
      openErrorModal(msg);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: COLORS.background.card,
          paddingBottom: "8rem",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
            style={{ color: COLORS.brand.primary }}
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
        style={{
          backgroundColor: COLORS.background.card,
          paddingBottom: "8rem",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 -ml-2"
            style={{ color: COLORS.brand.primary }}
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

  const hasDreamSection = !!(
    (view.current_summary && view.current_summary.trim()) ||
    (view.future_summary && view.future_summary.trim()) ||
    (view.alignment_score !== null && view.alignment_score !== undefined) ||
    (view.user_characteristics && view.user_characteristics.length > 0) ||
    (view.aspired_traits && view.aspired_traits.length > 0)
  );

  const hasReviewSection = !!(
    view.completed_todos?.length ||
    view.uncompleted_todos?.length ||
    view.todo_feedback?.length ||
    (view.daily_summary && view.daily_summary.trim())
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: COLORS.background.card,
        paddingBottom: "8rem",
      }}
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

        {/* 오늘의 VIVID 섹션 (type=vivid) */}
        {rowType === "vivid" && hasDreamSection && (
          <ScrollAnimation>
            <div className="mb-16">
              <VisionSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {/* 회고 섹션 (type=review) */}
        {rowType === "review" && (hasReviewSection || hasDreamSection) && (
          <ScrollAnimation>
            <div className="mb-16">
              <ReviewReportSection
                view={view}
                todoLists={data?.todoLists ?? []}
                date={view.date}
              />
            </div>
          </ScrollAnimation>
        )}

        {/* 피드백 섹션 */}
        <ScrollAnimation delay={200}>
          <VividFeedbackSection pageType="daily" vividType={rowType} />
        </ScrollAnimation>

        <div className="grid grid-cols-2 gap-3 pt-4 pb-32">
          {canRegenerate && (
            <Button
              variant="outline"
              onClick={() => setIsRegenerateDialogOpen(true)}
              disabled={isRegenerating}
              className="rounded-full px-4 py-6 sm:px-6 sm:py-5 flex flex-col items-center justify-center gap-1 min-w-0"
              style={{
                borderColor: COLORS.brand.primary,
                color: COLORS.brand.primary,
                opacity: isRegenerating ? 0.7 : 1,
              }}
            >
              {isRegenerating ? (
                <div className="flex items-center gap-2">
                  <CircularProgress
                    percentage={progressPercentage}
                    size={24}
                    strokeWidth={3}
                    showText={false}
                    animated={false}
                  />
                  <span>재생성 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">다시 생성하기</span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: COLORS.text.secondary, opacity: 0.9 }}
                  >
                    1번 재생성 가능합니다
                  </span>
                </div>
              )}
            </Button>
          )}
          <Button
            onClick={onBack}
            className={`rounded-full px-4 py-6 sm:px-6 sm:py-5 min-w-0 ${!canRegenerate ? "col-span-2" : ""}`}
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
            }}
          >
            돌아가기
          </Button>
        </div>

        {/* 다시 생성 모드 선택 다이얼로그 */}
        <Dialog
          open={isRegenerateDialogOpen}
          onOpenChange={(open) => {
            if (!open && isRegenerating) return;
            setIsRegenerateDialogOpen(open);
          }}
        >
          <DialogContent
            className="sm:max-w-md"
            style={{
              backgroundColor: COLORS.background.card,
              borderColor: COLORS.border.light,
            }}
          >
            <DialogHeader>
              <DialogTitle
                style={{ color: COLORS.text.primary, fontWeight: 600, }}
              >
                다시 생성하기
              </DialogTitle>
              <DialogDescription
                style={{ color: COLORS.text.secondary }}
              >
                이 비비드를 다시 생성할까요?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => !isRegenerating && setIsRegenerateDialogOpen(false)}
                disabled={isRegenerating}
                style={{
                  borderColor: COLORS.border.light,
                  color: COLORS.text.secondary,
                  opacity: isRegenerating ? 0.6 : 1,
                }}
              >
                취소
              </Button>
              <Button
                onClick={() => handleRegenerate()}
                disabled={isRegenerating}
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: COLORS.text.white,
                  opacity: isRegenerating ? 0.9 : 1,
                }}
              >
                {isRegenerating ? (
                  <div className="flex items-center gap-2">
                    <CircularProgress
                      percentage={progressPercentage}
                      size={18}
                      strokeWidth={3}
                      showText={false}
                      animated={false}
                    />
                    <span>재생성 중...</span>
                  </div>
                ) : (
                  "재생성하기"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
