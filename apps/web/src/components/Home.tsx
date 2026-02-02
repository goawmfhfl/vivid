import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useRecords, type Record } from "../hooks/useRecords";
import { type RecordType } from "./signup/RecordTypeCard";
import { RecordForm } from "./home/RecordForm";
import { RecordList } from "./home/RecordList";
import { EditRecordDialog } from "./home/EditRecordDialog";
import { DeleteRecordDialog } from "./home/DeleteRecordDialog";
import { useGetDailyVivid } from "@/hooks/useGetDailyVivid";
import { useCreateDailyVivid } from "@/hooks/useCreateDailyVivid";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    data: allRecords = [],
    isLoading,
    error,
    refetch: refetchRecords,
  } = useRecords();

  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [activeRecordType, setActiveRecordType] = useState<RecordType | null>(
    null
  );
  const searchParamsString = searchParams.toString();
  const initialRecordType = useMemo(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "emotion") {
      return "emotion";
    }
    if (typeParam === "vivid") {
      return "dream";
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (initialRecordType && activeRecordType === null) {
      setActiveRecordType(initialRecordType);
    }
  }, [initialRecordType, activeRecordType]);

  const handleTypeChange = useCallback(
    (type: RecordType | null) => {
      setActiveRecordType(type);
      const params = new URLSearchParams(searchParamsString);
      if (type) {
        params.set("type", type === "dream" ? "vivid" : type);
      } else {
        params.delete("type");
      }
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    },
    [router, pathname, searchParamsString]
  );

  const buildDatePath = useCallback(
    (date: string) => {
      const params = new URLSearchParams(searchParamsString);
      const query = params.toString();
      return query ? `/${date}?${query}` : `/${date}`;
    },
    [searchParamsString]
  );
  const createDailyVivid = useCreateDailyVivid();

  // KST 기준으로 오늘 날짜 계산
  const todayIso = getKSTDateString();
  const activeDate = selectedDate || todayIso;
  const isToday = activeDate === todayIso;

  // 기록 및 AI 피드백 날짜 조회
  const { data: datesData, isLoading: isLoadingDates } =
    useRecordsAndFeedbackDates();
  const [lastDatesData, setLastDatesData] = useState<{
    recordDates: string[];
    aiFeedbackDates: string[];
  } | null>(null);
  useEffect(() => {
    if (datesData) {
      setLastDatesData(datesData);
    }
  }, [datesData]);

  const effectiveDatesData = datesData ?? lastDatesData;
  const recordDates = effectiveDatesData?.recordDates || [];
  const aiFeedbackDates = effectiveDatesData?.aiFeedbackDates || [];

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
  const { data: dateFeedback } = useGetDailyVivid(activeDate);

  const hasDateFeedback = !!dateFeedback && dateFeedback.is_ai_generated;

  // 전역 모달 및 피드백 생성 상태 관리
  const openErrorModal = useModalStore((state) => state.openErrorModal);
  const dailyVividProgress = useModalStore(
    (state) => state.dailyVividProgress
  );
  const setDailyVividProgress = useModalStore(
    (state) => state.setDailyVividProgress
  );
  const clearDailyVividProgress = useModalStore(
    (state) => state.clearDailyVividProgress
  );

  // 타이머 기반 progress 상태
  const [timerProgress, setTimerProgress] = useState<number | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  // 진행 상황 확인
  const progress = dailyVividProgress[activeDate] || null;
  const isGeneratingFeedback = createDailyVivid.isPending || progress !== null || timerProgress !== null;
  
  // 타이머 기반 progress 계산 (0% → 99%, 18초 동안)
  useEffect(() => {
    if (timerStartTime === null) return;

    const DURATION_MS = 18000; // 18초
    const TARGET_PERCENTAGE = 99; // 최대 99%
    const UPDATE_INTERVAL = 100; // 100ms마다 업데이트

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartTime;
      
      // 15초가 넘어가면 99%에 고정
      if (elapsed >= DURATION_MS) {
        setTimerProgress(TARGET_PERCENTAGE);
        clearInterval(interval);
        return;
      }
      
      // 15초 이내일 때만 진행률 계산
      const calculatedProgress = (elapsed / DURATION_MS) * TARGET_PERCENTAGE;
      setTimerProgress(calculatedProgress);
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [timerStartTime]);

  // 컴포넌트 언마운트 시에만 타이머 정리 (activeDate 변경 시에는 유지)
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시에만 정리
    };
  }, []);

  // 타이머 progress와 실제 서버 progress 병합 (더 높은 값 사용)
  const serverProgressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;
  
  // 서버 응답이 완료되면 100%, 그렇지 않으면 타이머와 서버 중 더 높은 값 (최대 99%)
  const isComplete = progress && progress.current >= progress.total;
  const progressPercentage = isComplete
    ? 100
    : Math.min(
        Math.max(timerProgress ?? 0, serverProgressPercentage),
        99
      );


  const handleOpenDailyVivid = async () => {
    // TODO: 감정 타입 선택 시 emotion_records 기반 플로우로 분기 예정
    try {
      if (hasDateFeedback) {
        // 기존 피드백이 있으면 id로 라우팅
        if (!dateFeedback.id) {
          throw new Error("피드백 ID를 찾을 수 없습니다.");
        }
        router.push(`/analysis/feedback/daily/${dateFeedback.id}`);
        return;
      }

      // 타이머 시작
      setTimerStartTime(Date.now());
      setTimerProgress(0);

      // 진행 상황 초기화
      setDailyVividProgress(activeDate, {
        date: activeDate,
        current: 0,
        total: 1,
        currentStep: "VIVID 생성 중",
      });

      try {
        const feedbackData = await createDailyVivid.mutateAsync({
          date: activeDate,
        });

        // 타이머 정리
        setTimerStartTime(null);
        setTimerProgress(null);
        
        // 진행 상황 초기화
        clearDailyVividProgress(activeDate);

        // 성공 시 바로 라우팅 (모달 없이)
        if (feedbackData?.id) {
          // DB 동기화를 위한 짧은 딜레이 추가
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push(`/analysis/feedback/daily/${feedbackData.id}`);
        } else {
          throw new Error("생성된 VIVID에 ID가 없습니다.");
        }
      } catch (error) {
        console.error("피드백 생성 실패:", error);

        // 타이머 정리
        setTimerStartTime(null);
        setTimerProgress(null);
        
        // 진행 상황 초기화
        clearDailyVividProgress(activeDate);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "피드백 생성에 실패했습니다. 다시 시도해주세요.";

        openErrorModal(errorMessage);
      }
    } catch (e) {
      // 동기 에러 처리
      const base =
        e instanceof Error ? e.message : "피드백 생성 중 오류가 발생했습니다.";
      const message = `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`;
      openErrorModal(message);
      
      // 타이머 정리
      setTimerStartTime(null);
      setTimerProgress(null);
      
      clearDailyVividProgress(activeDate);
    }
  };

  const getPrimaryButtonLabel = () => {
    const isEmotion = activeRecordType === "emotion";
    const baseLabel = isEmotion ? "감정" : "VIVID";

    if (progress || timerProgress !== null) {
      return `${baseLabel} 생성 중...`;
    }

    if (hasDateFeedback) {
      if (isToday) {
        return `오늘의 ${baseLabel} 보기`;
      }
      return `${baseLabel} 보기`;
    }

    if (isToday) {
      return `오늘의 ${baseLabel} 생성하기`;
    }

    return `${baseLabel} 생성하기`;
  };

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24 hide-scrollbar`}
      style={{
        overflowX: "hidden",
      }}
    >
      <AppHeader
        title={isToday ? "오늘의 기록" : "기록"}
        showDatePicker={true}
        selectedDate={activeDate}
        onDateSelect={(date) => router.push(buildDatePath(date))}
        currentMonth={currentMonth}
        recordDates={recordDates}
        aiFeedbackDates={aiFeedbackDates}
      />

      <WeeklyDateView
        selectedDate={activeDate}
        onDateSelect={(date) => router.push(buildDatePath(date))}
        recordDates={recordDates}
        aiFeedbackDates={aiFeedbackDates}
        onMonthChange={handleMonthChange}
        isLoading={isLoadingDates}
      />

      <RecordForm
        selectedDate={activeDate}
        onTypeChange={handleTypeChange}
        initialType={initialRecordType}
      />
      <RecordList
        records={allRecords}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => refetchRecords()}
        selectedDate={activeDate}
        activeRecordType={activeRecordType}
      />

      {hasDateRecords && (
        <div 
          className="fixed bottom-20 left-0 right-0 flex justify-center px-3 sm:px-4 z-50"
        >
          <div
            className="relative transition-all duration-300 px-3 py-2.5 sm:px-4 sm:py-3.5"
            onClick={!isGeneratingFeedback ? handleOpenDailyVivid : undefined}
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
              cursor: isGeneratingFeedback ? "default" : "pointer",
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
              {(progress || timerProgress !== null) && (
                <CircularProgress
                  percentage={progressPercentage}
                  size={40}
                  strokeWidth={4}
                  showText={true}
                  textSize="sm"
                  className="flex-shrink-0"
                  animated={false}
                />
              )}
              <Sparkles
                className={`flex-shrink-0 ${
                  (progress || timerProgress !== null) ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"
                }`}
                style={{ color: COLORS.brand.primary }}
              />
              <div className="flex flex-col items-start gap-0.5">
                <span
                  className="text-sm sm:text-base"
                  style={{
                    color: COLORS.brand.primary,
                    fontSize: (progress || timerProgress !== null) ? "0.875rem" : "1rem",
                    fontWeight: "600",
                    lineHeight: "1.2",
                  }}
                >
                  {getPrimaryButtonLabel()}
                </span>
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
