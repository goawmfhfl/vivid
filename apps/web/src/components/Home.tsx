import { useMemo, useState, useRef } from "react";
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

export function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: records = [],
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

  const hasTodayRecords = useMemo(() => {
    // KST 기준 오늘 날짜 문자열
    const todayKST = getKSTDateString();
    return records.some((record) => {
      // record.kst_date는 이미 "YYYY-MM-DD" 형식이므로 직접 비교
      return record.kst_date === todayKST;
    });
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

  // 오늘 자 피드백 존재 여부 조회
  const { data: todayFeedback } = useGetDailyFeedback(todayIso);

  const hasTodayFeedback = !!todayFeedback && todayFeedback.is_ai_generated;

  // 전역 모달 및 피드백 생성 상태 관리
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const openErrorModal = useModalStore((state) => state.openErrorModal);
  const {
    dailyFeedbackProgress,
    setDailyFeedbackProgress,
    clearDailyFeedbackProgress,
  } = useModalStore();

  // 진행 상황 확인
  const progress = dailyFeedbackProgress[todayIso] || null;
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
      if (hasTodayFeedback) {
        // 기존 피드백이 있으면 id로 라우팅
        if (!todayFeedback.id) {
          throw new Error("피드백 ID를 찾을 수 없습니다.");
        }
        router.push(`/analysis/feedback/daily/${todayFeedback.id}`);
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
      setDailyFeedbackProgress(todayIso, {
        date: todayIso,
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
            date: todayIso,
            timezone: "Asia/Seoul",
          });

          const es = new EventSource(
            `/api/daily-feedback/generate-stream?${params.toString()}`
          );
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
                setDailyFeedbackProgress(todayIso, {
                  date: todayIso,
                  current: data.current,
                  total: data.total,
                  currentStep: getSectionNameKR(data.sectionName),
                });
              } else if (data.type === "complete") {
                // 완료 처리
                cleanup();

                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.DAILY_FEEDBACK],
                });
                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.RECORDS],
                });

                // 진행 상황 초기화
                clearDailyFeedbackProgress(todayIso);

                // 성공 시 전역 모달로 알림
                if (data.data?.id) {
                  openSuccessModal(
                    "오늘의 피드백이 생성되었습니다!\n확인 버튼을 누르면 피드백을 확인할 수 있습니다.",
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

                clearDailyFeedbackProgress(todayIso);
                openErrorModal(
                  `피드백 생성 중 오류가 발생했습니다: ${data.error}`
                );

                reject(new Error(data.error));
              }
            } catch (error) {
              console.error("SSE 메시지 파싱 오류:", error);
              cleanup();
              clearDailyFeedbackProgress(todayIso);

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

          es.onerror = (_event) => {
            cleanup();
            clearDailyFeedbackProgress(todayIso);

            // EventSource의 readyState를 확인하여 에러 타입 판단
            let errorMessage = "피드백 생성 중 연결 오류가 발생했습니다.";

            if (es.readyState === EventSource.CLOSED) {
              // 연결이 닫혔을 때 - 서버 에러 가능성
              errorMessage =
                "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
            } else if (es.readyState === EventSource.CONNECTING) {
              // 연결 중일 때
              errorMessage =
                "서버에 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
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
        title="오늘의 기록"
        subtitle={new Date().toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      />

      <RecordForm />
      <RecordList
        records={records}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => refetchRecords()}
      />

      {hasTodayRecords && (
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
                    : hasTodayFeedback
                    ? "오늘 피드백 보기"
                    : "오늘 피드백 생성하기"}
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
