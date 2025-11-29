import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useRecords, type Record } from "../hooks/useRecords";
import { RecordForm } from "./home/RecordForm";
import { RecordList } from "./home/RecordList";
import { EditRecordDialog } from "./home/EditRecordDialog";
import { DeleteRecordDialog } from "./home/DeleteRecordDialog";
import { useCreateDailyFeedback } from "@/hooks/useCreateDailyFeedback";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";
import { HomeHeader } from "./home/HomeHeader";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useModalStore } from "@/store/useModalStore";
import { getKSTDateString } from "@/lib/date-utils";
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from "@/lib/design-system";
import { ProfileUpdateModal } from "./ProfileUpdateModal";

export function Home() {
  const router = useRouter();
  const { isTest } = useEnvironment();

  const {
    data: records = [],
    isLoading,
    error,
    refetch: refetchRecords,
  } = useRecords();

  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  // KST 기준으로 오늘 날짜 계산
  const todayIso = getKSTDateString();

  // 전역 모달 상태 관리
  const openLoadingModal = useModalStore((state) => state.openLoadingModal);

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
  };

  const handleDelete = (id: number) => {
    setDeletingRecordId(id);
  };

  const { mutateAsync: createDailyFeedback, isPending } =
    useCreateDailyFeedback();

  // 오늘 자 피드백 존재 여부 조회
  const { data: todayFeedback } = useGetDailyFeedback(todayIso);

  const hasTodayFeedback = !!todayFeedback && todayFeedback.is_ai_generated;

  // 전역 모달 및 피드백 생성 상태 관리
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const openErrorModal = useModalStore((state) => state.openErrorModal);
  const feedbackGeneration = useModalStore((state) => state.feedbackGeneration);
  const generatingDates = useModalStore(
    (state) => state.feedbackGeneration.generatingDates
  );

  // 전역 상태와 로컬 상태를 결합하여 피드백 생성 중인지 확인
  const isGeneratingFeedback = isPending || generatingDates.includes(todayIso);

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

      // 전역 상태에 생성 시작 표시
      feedbackGeneration.startGenerating(todayIso);

      // 백그라운드에서 피드백 생성 시작 (로딩 모달 없이)
      // mutateAsync를 사용하되, await하지 않고 then/catch로 처리
      createDailyFeedback({ date: todayIso })
        .then((createdFeedback) => {
          // 전역 상태에서 생성 완료 표시
          feedbackGeneration.finishGenerating(todayIso);

          // 성공 시 전역 모달로 알림
          if (createdFeedback?.id) {
            openSuccessModal(
              "오늘의 피드백이 생성되었습니다!\n확인 버튼을 누르면 피드백을 확인할 수 있습니다.",
              () => {
                router.push(`/analysis/feedback/daily/${createdFeedback.id}`);
              }
            );
          } else {
            throw new Error("생성된 피드백에 ID가 없습니다.");
          }
        })
        .catch((e) => {
          // 전역 상태에서 생성 완료 표시 (에러도 완료로 처리)
          feedbackGeneration.finishGenerating(todayIso);

          // 에러 시 전역 모달로 알림
          const base =
            e instanceof Error
              ? e.message
              : "피드백 생성 중 오류가 발생했습니다.";
          const message = `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`;
          openErrorModal(message, handleRetry);
        });
    } catch (e) {
      // 동기 에러 처리
      const base =
        e instanceof Error ? e.message : "피드백 생성 중 오류가 발생했습니다.";
      const message = `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`;
      openErrorModal(message, handleRetry);
    }
  };

  const handleRetry = () => {
    handleOpenDailyFeedback();
  };

  // 테스트용 핸들러
  const handleTestLoading = () => {
    // 수동으로 열리는 경우 (isManual: true) - 자동 닫기 방지
    openLoadingModal("테스트 로딩 중입니다...", true);
  };

  const handleTestError = () => {
    openErrorModal("테스트 에러 메시지입니다. 이 메시지는 테스트용입니다.");
  };

  const handleTestErrorWithRetry = () => {
    openErrorModal(
      "재시도 가능한 테스트 에러입니다.\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.",
      () => {
        console.log("재시도 버튼 클릭됨");
      }
    );
  };

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <HomeHeader />

      {/* 테스트용 버튼 (개발 환경에서만 표시) */}
      {isTest && (
        <div
          className={`mb-4 ${SPACING.card.paddingSmall} rounded-lg border-2 border-dashed`}
          style={{ backgroundColor: "#FFF8E7", borderColor: "#E5B96B" }}
        >
          <p
            className={`${TYPOGRAPHY.body.fontSize} font-semibold mb-2`}
            style={{ color: "#B8860B" }}
          >
            🧪 모달 테스트 (개발 환경)
          </p>
          <div className="flex flex-wrap gap-2">
            ;
            <Button
              onClick={handleTestLoading}
              size="sm"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
                fontSize: TYPOGRAPHY.bodySmall.fontSize.replace("text-", ""),
                padding: "0.5rem 1rem",
              }}
            >
              로딩 모달 테스트
            </Button>
            <Button
              onClick={handleTestError}
              size="sm"
              variant="outline"
              style={{
                borderColor: COLORS.status.error,
                color: COLORS.status.error,
                fontSize: TYPOGRAPHY.bodySmall.fontSize.replace("text-", ""),
                padding: "0.5rem 1rem",
              }}
            >
              에러 모달 테스트
            </Button>
            <Button
              onClick={handleTestErrorWithRetry}
              size="sm"
              variant="outline"
              style={{
                borderColor: COLORS.status.error,
                color: COLORS.status.error,
                fontSize: TYPOGRAPHY.bodySmall.fontSize.replace("text-", ""),
                padding: "0.5rem 1rem",
              }}
            >
              에러 모달 (재시도 포함)
            </Button>
          </div>
        </div>
      )}

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
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4">
          <Button
            onClick={handleOpenDailyFeedback}
            className="rounded-full"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              padding: "0.875rem 2rem",
              fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
              boxShadow: SHADOWS.lg,
            }}
            disabled={isGeneratingFeedback}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingFeedback
              ? "피드백 생성 중..."
              : hasTodayFeedback
              ? "오늘 피드백 보기"
              : "오늘 피드백 받기"}
          </Button>
        </div>
      )}

      <EditRecordDialog
        record={editingRecord}
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
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
