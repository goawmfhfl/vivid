import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useRecords, type Record } from "../hooks/useRecords";
import { RecordForm } from "./home/RecordForm";
import { RecordList } from "./home/RecordList";
import { EditRecordDialog } from "./home/EditRecordDialog";
import { DeleteRecordDialog } from "./home/DeleteRecordDialog";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";
import { AppHeader } from "./common/AppHeader";
import { useModalStore } from "@/store/useModalStore";
import { getKSTDateString } from "@/lib/date-utils";
import { COLORS, SPACING } from "@/lib/design-system";
import { ProfileUpdateModal } from "./ProfileUpdateModal";
import { CircularProgress } from "./ui/CircularProgress";
import { getCurrentUserId } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { WeeklyDateView } from "./home/WeeklyDateView";
import { getKSTDate } from "@/lib/date-utils";
import { useRecordsAndFeedbackDates } from "@/hooks/useRecordsAndFeedbackDates";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

interface HomeProps {
  selectedDate?: string; // YYYY-MM-DD
}

export function Home({ selectedDate }: HomeProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: allRecords = [],
    isLoading,
    error,
    refetch: refetchRecords,
  } = useRecords();

  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentEsRef = useRef<EventSource | null>(null);

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

  // 진행 상황 확인
  const progress = dailyFeedbackProgress[activeDate] || null;
  const isGeneratingFeedback = isGenerating || progress !== null;
  const progressPercentage = progress
    ? Math.min(Math.round((progress.current / progress.total) * 100), 99)
    : 0;

  // 섹션 이름을 한글로 변환
  const getSectionNameKR = (sectionName: string) => {
    const names: { [key: string]: string } = {
      SummaryReport: "전체 요약",
      DailyReport: "일상 분석",
      EmotionReport: "감정 분석",
      DreamReport: "꿈/목표 분석",
      InsightReport: "인사이트",
      FeedbackReport: "피드백",
      FinalReport: "최종 정리중",
    };
    return names[sectionName] || sectionName;
  };

  const handleOpenDailyFeedback = async () => {
    try {
      if (hasDateFeedback) {
        // 기존 피드백이 있으면 id로 라우팅
        if (!dateFeedback.id) {
          throw new Error("피드백 ID를 찾을 수 없습니다.");
        }
        router.push(`/analysis/feedback/daily/${dateFeedback.id}`);
        return;
      }

      setIsGenerating(true);

      const sectionNames = [
        "SummaryReport",
        "DailyReport",
        "EmotionReport",
        "DreamReport",
        "InsightReport",
        "FeedbackReport",
        "FinalReport",
      ];

      // 진행 상황 즉시 초기화 (버튼 클릭 시 바로 프로그래스바 표시)
      setDailyFeedbackProgress(activeDate, {
        date: activeDate,
        current: 0,
        total: sectionNames.length,
        currentStep: getSectionNameKR(sectionNames[0]),
      });

      try {
        const userId = await getCurrentUserId();

        // SSE를 사용하여 진행 상황 수신
        await new Promise<void>((resolve, reject) => {
          const params = new URLSearchParams({
            userId,
            date: activeDate,
            timezone: "Asia/Seoul",
          });

          // 배포 환경에서 절대 URL 사용 (상대 경로는 일부 환경에서 문제 발생 가능)
          const eventSourceUrl = `/api/daily-feedback/generate-stream?${params.toString()}`;
          const absoluteUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}${eventSourceUrl}`
              : eventSourceUrl;

          const es = new EventSource(absoluteUrl);
          currentEsRef.current = es;

          // Promise 완료/실패 시 EventSource 정리
          const cleanup = () => {
            try {
              if (es && es.readyState !== EventSource.CLOSED) {
                es.close();
              }
            } catch {
              // 무시
            }
            currentEsRef.current = null;
          };

          es.onmessage = (event) => {
            try {
              // HTML 응답인지 확인 (502 Bad Gateway 등)
              if (
                typeof event.data === "string" &&
                (event.data.includes("<html>") ||
                  event.data.includes("502") ||
                  event.data.includes("Bad Gateway"))
              ) {
                throw new Error(event.data);
              }

              const data = JSON.parse(event.data);

              if (data.type === "progress") {
                // 진행 상황 업데이트 (서버에서 실제 섹션 생성 시점에 전송됨) - 전역 상태
                setDailyFeedbackProgress(activeDate, {
                  date: activeDate,
                  current: data.current,
                  total: data.total,
                  currentStep: getSectionNameKR(data.sectionName),
                });
              } else if (data.type === "complete") {
                // 완료 처리
                cleanup();

                // EventSource로 받은 데이터를 기반으로 캐시 직접 업데이트
                if (data.data) {
                  const feedbackData = data.data as DailyFeedbackRow;

                  // 해당 날짜의 DAILY_FEEDBACK 쿼리에 생성된 피드백 데이터 설정
                  queryClient.setQueryData<DailyFeedbackRow | null>(
                    [QUERY_KEYS.DAILY_FEEDBACK, activeDate],
                    feedbackData || null
                  );

                  // 생성된 피드백의 ID로 쿼리도 업데이트 (있는 경우)
                  if (feedbackData?.id) {
                    queryClient.setQueryData<DailyFeedbackRow | null>(
                      [QUERY_KEYS.DAILY_FEEDBACK, "id", feedbackData.id],
                      feedbackData || null
                    );
                  }

                  // useRecordsAndFeedbackDates의 aiFeedbackDates 업데이트 (is_ai_generated가 true인 경우만)
                  if (feedbackData?.is_ai_generated) {
                    queryClient.setQueryData<{
                      recordDates: string[];
                      aiFeedbackDates: string[];
                    }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
                      if (!oldData) {
                        return {
                          recordDates: [],
                          aiFeedbackDates: [activeDate],
                        };
                      }

                      const { recordDates, aiFeedbackDates } = oldData;
                      // 날짜가 이미 있는지 확인
                      if (!aiFeedbackDates.includes(activeDate)) {
                        const updatedAiFeedbackDates = [
                          ...aiFeedbackDates,
                          activeDate,
                        ].sort();
                        return {
                          recordDates,
                          aiFeedbackDates: updatedAiFeedbackDates,
                        };
                      }
                      return oldData;
                    });
                  }
                } else {
                  // 데이터가 없는 경우 무효화로 폴백
                  queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.DAILY_FEEDBACK],
                  });
                }

                // 진행 상황 초기화
                clearDailyFeedbackProgress(activeDate);

                // 성공 시 전역 모달로 알림
                if (data.data?.id) {
                  const dateLabel = isToday
                    ? "오늘의"
                    : getKSTDate(new Date(activeDate)).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      );
                  openSuccessModal(
                    `${dateLabel} 피드백이 생성되었습니다!\n확인 버튼을 누르면 피드백을 확인할 수 있습니다.`,
                    () => {
                      router.push(`/analysis/feedback/daily/${data.data.id}`);
                    }
                  );
                } else {
                  throw new Error("생성된 피드백에 ID가 없습니다.");
                }

                resolve();
              } else if (data.type === "error") {
                // 에러 처리
                cleanup();

                clearDailyFeedbackProgress(activeDate);
                openErrorModal(
                  `피드백 생성 중 오류가 발생했습니다: ${data.error}`
                );

                reject(new Error(data.error));
              }
            } catch (error) {
              console.error("SSE 메시지 파싱 오류:", error);
              cleanup();
              clearDailyFeedbackProgress(activeDate);

              // HTML 응답인지 확인 (502 Bad Gateway 등)
              let errorMessage =
                "피드백 생성 중 알 수 없는 오류가 발생했습니다.";

              if (error instanceof Error && error.message) {
                const errorText = error.message;
                // HTML 태그가 포함되어 있으면 서버 에러로 판단
                if (
                  errorText.includes("<html>") ||
                  errorText.includes("502") ||
                  errorText.includes("Bad Gateway")
                ) {
                  errorMessage =
                    "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
                } else {
                  errorMessage = `피드백 생성 중 오류가 발생했습니다: ${errorText}`;
                }
              }

              openErrorModal(errorMessage);
              reject(new Error(errorMessage));
            }
          };

          es.onerror = (event) => {
            cleanup();
            clearDailyFeedbackProgress(activeDate);

            // EventSource의 readyState를 확인하여 에러 타입 판단
            let errorMessage = "피드백 생성 중 연결 오류가 발생했습니다.";

            // 에러 상세 정보 로깅 (개발 환경)
            if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
              console.error("EventSource error:", {
                readyState: es.readyState,
                url: es.url,
                event,
              });
            }

            if (es.readyState === EventSource.CLOSED) {
              // 연결이 닫혔을 때 - 서버 에러 가능성
              errorMessage =
                "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
            } else if (es.readyState === EventSource.CONNECTING) {
              // 연결 중일 때 - 네트워크 문제 또는 타임아웃
              errorMessage =
                "서버에 연결하는 중 문제가 발생했습니다. 네트워크 연결을 확인하고 잠시 후 다시 시도해주세요.";
            }

            openErrorModal(errorMessage);
            reject(new Error(errorMessage));
          };
        });
      } catch (error) {
        console.error("피드백 생성 실패:", error);

        // EventSource 정리
        try {
          if (
            currentEsRef.current &&
            currentEsRef.current.readyState !== EventSource.CLOSED
          ) {
            currentEsRef.current.close();
          }
        } catch {
          // 무시
        }
        currentEsRef.current = null;

        // 진행 상황 초기화
        clearDailyFeedbackProgress(todayIso);

        openErrorModal(
          `피드백 생성에 실패했습니다. 다시 시도해주세요. ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsGenerating(false);
      }
    } catch (e) {
      // 동기 에러 처리
      const base =
        e instanceof Error ? e.message : "피드백 생성 중 오류가 발생했습니다.";
      const message = `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`;
      openErrorModal(message);
      setIsGenerating(false);
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
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-3 sm:px-4">
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
                    ? "피드백 생성 중..."
                    : hasDateFeedback
                    ? isToday
                      ? "오늘 피드백 보기"
                      : "피드백 보기"
                    : isToday
                    ? "오늘 피드백 생성하기"
                    : "피드백 생성하기"}
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
                    {progress.currentStep}
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
