import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useRecords, type Record } from "../hooks/useRecords";
import { RecordForm } from "./home/RecordForm";
import { RecordList } from "./home/RecordList";
import { EditRecordDialog } from "./home/EditRecordDialog";
import { DeleteRecordDialog } from "./home/DeleteRecordDialog";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";
import { useCreateDailyFeedback } from "@/hooks/useCreateDailyFeedback";
import { AppHeader } from "./common/AppHeader";
import { useModalStore } from "@/store/useModalStore";
import { getKSTDateString } from "@/lib/date-utils";
import { COLORS, SPACING } from "@/lib/design-system";
import { ProfileUpdateModal } from "./ProfileUpdateModal";
import { CircularProgress } from "./ui/CircularProgress";
import { WeeklyDateView } from "./home/WeeklyDateView";
import { getKSTDate } from "@/lib/date-utils";
import { useRecordsAndFeedbackDates } from "@/hooks/useRecordsAndFeedbackDates";

interface HomeProps {
  selectedDate?: string; // YYYY-MM-DD
}

export function Home({ selectedDate }: HomeProps = {}) {
  const router = useRouter();

  const {
    data: allRecords = [],
    isLoading,
    error,
    refetch: refetchRecords,
  } = useRecords();

  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const createDailyFeedback = useCreateDailyFeedback();

  // KST 기준으로 오늘 날짜 계산
  const todayIso = getKSTDateString();
  const activeDate = selectedDate || todayIso;
  const isToday = activeDate === todayIso;

  // 기록 및 AI 피드백 날짜 조회
  const { data: datesData, isLoading: isLoadingDates } =
    useRecordsAndFeedbackDates();

  const recordDates = datesData?.recordDates || [];
  const aiFeedbackDates = datesData?.aiFeedbackDates || [];

  // 현재 표시 중인 월 상태 (WeeklyDateView와 동기화)
  const [currentMonth, setCurrentMonth] = useState<{
    year: number;
    month: number;
  }>(() => {
    const date = getKSTDate(new Date(activeDate));
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  });

  // activeDate가 변경되면 currentMonth도 업데이트
  useEffect(() => {
    const date = getKSTDate(new Date(activeDate));
    setCurrentMonth({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }, [activeDate]);

  // 월 변경 핸들러 메모이제이션 (무한 루프 방지)
  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month });
  }, []);

  // 선택한 날짜의 레코드만 필터링
  const records = useMemo(() => {
    return allRecords.filter((record) => record.kst_date === activeDate);
  }, [allRecords, activeDate]);

  const hasDateRecords = useMemo(() => {
    return records.length > 0;
  }, [records]);

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = (open: boolean) => {
    if (!open) {
      setIsEditDialogOpen(false);
      setEditingRecord(null);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingRecordId(id);
  };

  // 선택한 날짜의 피드백 존재 여부 조회
  const { data: dateFeedback } = useGetDailyFeedback(activeDate);

  const hasDateFeedback = !!dateFeedback && dateFeedback.is_ai_generated;

  // 전역 모달 및 피드백 생성 상태 관리
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const openErrorModal = useModalStore((state) => state.openErrorModal);
  const dailyFeedbackProgress = useModalStore(
    (state) => state.dailyFeedbackProgress
  );
  const setDailyFeedbackProgress = useModalStore(
    (state) => state.setDailyFeedbackProgress
  );
  const clearDailyFeedbackProgress = useModalStore(
    (state) => state.clearDailyFeedbackProgress
  );

  // 스크롤 방향 감지 (버튼 숨김/표시용)
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  // 진행 상황 확인
  const progress = dailyFeedbackProgress[activeDate] || null;
  const isGeneratingFeedback = createDailyFeedback.isPending || progress !== null;

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10; // 최상단 판단 임계값
      const scrollDelta = 5; // 스크롤 방향 감지를 위한 최소 변화량

      // 최상단 여부 확인
      setIsAtTop(currentScrollY < scrollThreshold);

      // 스크롤 방향 확인 (최소 변화량 이상일 때만)
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      if (scrollDifference > scrollDelta && currentScrollY > scrollThreshold) {
        // 아래로 스크롤 중 (임계값 이상)
        setIsScrolledDown(true);
      } else if (scrollDifference < -scrollDelta) {
        // 위로 스크롤 중
        setIsScrolledDown(false);
      }

      lastScrollY.current = currentScrollY;
    };

    // 초기 스크롤 위치 설정
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 10);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 서버 progress 계산
  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;


  const handleOpenDailyFeedback = async () => {
    try {
      if (hasDateFeedback) {
        // 기존 VIVID가 있으면 id로 라우팅
        if (!dateFeedback.id) {
          throw new Error("VIVID ID를 찾을 수 없습니다.");
        }
        router.push(`/analysis/feedback/daily/${dateFeedback.id}`);
        return;
      }

      // 진행 상황 초기화
      setDailyFeedbackProgress(activeDate, {
        date: activeDate,
        current: 0,
        total: 1,
        currentStep: "VIVID 생성 중",
      });

      try {
        const feedbackData = await createDailyFeedback.mutateAsync({
          date: activeDate,
        });

        // 진행 상황 초기화
        clearDailyFeedbackProgress(activeDate);

        // 성공 시 전역 모달로 알림
        if (feedbackData?.id) {
          const dateLabel = isToday
            ? "오늘의"
            : getKSTDate(new Date(activeDate)).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
          openSuccessModal(
            `${dateLabel} VIVID가 생성되었습니다!\n확인 버튼을 누르면 VIVID를 확인할 수 있습니다.`,
            () => {
              router.push(`/analysis/feedback/daily/${feedbackData.id}`);
            }
          );
        } else {
          throw new Error("생성된 VIVID에 ID가 없습니다.");
        }
      } catch (error) {
        console.error("VIVID 생성 실패:", error);

        // 진행 상황 초기화
        clearDailyFeedbackProgress(activeDate);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "VIVID 생성에 실패했습니다. 다시 시도해주세요.";

        openErrorModal(errorMessage);
      }
    } catch (e) {
      // 동기 에러 처리
      const base =
        e instanceof Error ? e.message : "VIVID 생성 중 오류가 발생했습니다.";
      const message = `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`;
      openErrorModal(message);
      
      clearDailyFeedbackProgress(activeDate);
    }
  };

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader
        title={isToday ? "오늘의 기록" : "기록"}
        showDatePicker={true}
        selectedDate={activeDate}
        onDateSelect={(date) => router.push(`/${date}`)}
        currentMonth={currentMonth}
        recordDates={recordDates}
        aiFeedbackDates={aiFeedbackDates}
      />

      <WeeklyDateView
        selectedDate={activeDate}
        onDateSelect={(date) => router.push(`/${date}`)}
        recordDates={recordDates}
        aiFeedbackDates={aiFeedbackDates}
        onMonthChange={handleMonthChange}
        isLoading={isLoadingDates}
      />

      <RecordForm selectedDate={activeDate} />
      <RecordList
        records={allRecords}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => refetchRecords()}
        selectedDate={activeDate}
      />

      {hasDateRecords && (
        <div 
          className="fixed bottom-20 left-0 right-0 flex justify-center px-3 sm:px-4"
          style={{
            transform: isScrolledDown && !isAtTop ? "translateY(100%)" : "translateY(0)",
            opacity: isScrolledDown && !isAtTop ? 0 : 1,
            pointerEvents: isScrolledDown && !isAtTop ? "none" : "auto",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform, opacity",
          }}
        >
          <div
            className="relative cursor-pointer transition-all duration-300 px-3 py-2.5 sm:px-4 sm:py-3.5"
            onClick={
              !isGeneratingFeedback ? handleOpenDailyFeedback : undefined
            }
            style={{
              backgroundColor: "#FAFAF8",
              border: `1.5px solid ${COLORS.border.light}`,
              borderRadius: "12px",
              boxShadow: `
                0 2px 8px rgba(0,0,0,0.04),
                0 1px 3px rgba(0,0,0,0.02),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              position: "relative",
              overflow: "hidden",
              opacity: isGeneratingFeedback ? 0.9 : 1,
              pointerEvents: isGeneratingFeedback ? "none" : "auto",
              // 종이 질감 배경 패턴
              backgroundImage: `
                /* 가로 줄무늬 (프로젝트 그린 톤) */
                repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 27px,
                  rgba(107, 122, 111, 0.08) 27px,
                  rgba(107, 122, 111, 0.08) 28px
                ),
                /* 종이 텍스처 노이즈 */
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(107, 122, 111, 0.01) 2px,
                  rgba(107, 122, 111, 0.01) 4px
                )
              `,
              backgroundSize: "100% 28px, 8px 8px",
              backgroundPosition: "0 2px, 0 0",
              filter: "contrast(1.02) brightness(1.01)",
            }}
            onMouseEnter={(e) => {
              if (!isGeneratingFeedback) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `
                  0 4px 16px rgba(107, 122, 111, 0.08),
                  0 2px 6px rgba(0,0,0,0.04),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `;
              }
            }}
            onMouseLeave={(e) => {
              if (!isGeneratingFeedback) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `
                  0 2px 8px rgba(0,0,0,0.04),
                  0 1px 3px rgba(0,0,0,0.02),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `;
              }
            }}
          >
            {/* 종이 질감 오버레이 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                  radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
                `,
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            />

            {/* 버튼 내용 */}
            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              {/* 원형 프로그래스 바 (생성 중일 때만 표시) */}
              {progress && (
                <CircularProgress
                  percentage={progressPercentage}
                  size={40}
                  strokeWidth={4}
                  showText={true}
                  textSize="sm"
                  className="flex-shrink-0"
                />
              )}
              <Sparkles
                className={`flex-shrink-0 ${
                  progress ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"
                }`}
                style={{ color: COLORS.brand.primary }}
              />
              <div className="flex flex-col items-start gap-0.5">
                <span
                  className="text-sm sm:text-base"
                  style={{
                    color: COLORS.brand.primary,
                    fontSize: progress ? "0.875rem" : "1rem",
                    fontWeight: "600",
                    lineHeight: "1.2",
                  }}
                >
                  {progress
                    ? "VIVID 생성 중..."
                    : hasDateFeedback
                    ? isToday
                      ? "오늘의 VIVID 보기"
                      : "VIVID 보기"
                    : isToday
                    ? "오늘의 VIVID 생성하기"
                    : "VIVID 생성하기"}
                </span>
                {progress && (
                  <span
                    className="text-xs sm:text-sm"
                    style={{
                      color: "#6B7A6F",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                    }}
                  >
                    {progress.currentStep || "VIVID 생성 중"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <EditRecordDialog
        record={editingRecord}
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
      />

      <DeleteRecordDialog
        recordId={deletingRecordId}
        open={!!deletingRecordId}
        onOpenChange={(open) => !open && setDeletingRecordId(null)}
      />

      {/* 프로필 업데이트 모달 */}
      <ProfileUpdateModal />
    </div>
  );
}
