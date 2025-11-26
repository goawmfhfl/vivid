import { useMemo, useState, useEffect } from "react";
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
  const closeLoadingModal = useModalStore((state) => state.closeLoadingModal);
  const loadingModalIsManual = useModalStore(
    (state) => state.loadingModal.isManual
  );
  const openErrorModal = useModalStore((state) => state.openErrorModal);

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

  // 로딩 상태 동기화 (자동 모달만 - 수동 모달은 건드리지 않음)
  useEffect(() => {
    if (isPending) {
      // 실제 피드백 생성 중일 때 (isManual: false)
      openLoadingModal("AI에게 피드백을 요청하고 있습니다...", false);
    } else {
      // 수동으로 열린 모달이 아닌 경우에만 닫기
      if (!loadingModalIsManual) {
        closeLoadingModal();
      }
    }
  }, [isPending, loadingModalIsManual, openLoadingModal, closeLoadingModal]);

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
      // 새 피드백 생성 후 id로 라우팅
      const createdFeedback = await createDailyFeedback({ date: todayIso });
      if (!createdFeedback?.id) {
        throw new Error("생성된 피드백에 ID가 없습니다.");
      }
      router.push(`/analysis/feedback/daily/${createdFeedback.id}`);
    } catch (e) {
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
            disabled={isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {hasTodayFeedback ? "오늘 피드백 보기" : "오늘 피드백 받기"}
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
    </div>
  );
}
