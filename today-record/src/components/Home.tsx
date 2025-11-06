import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useRecords, type Record } from "../hooks/useRecords";
import { RecordForm } from "./Home/RecordForm";
import { RecordList } from "./Home/RecordList";
import { EditRecordDialog } from "./Home/EditRecordDialog";
import { DeleteRecordDialog } from "./Home/DeleteRecordDialog";
import { useCreateDailyFeedback } from "@/hooks/useCreateDailyFeedback";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";
import { HomeHeader } from "./Home/HomeHeader";

export function Home() {
  const router = useRouter();

  const { data: records = [], isLoading, error } = useRecords();

  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const todayIso = new Date().toISOString().split("T")[0];

  const hasTodayRecords = useMemo(() => {
    const todayKey = new Date().toDateString();
    return records.some((record) => {
      const recordDate = new Date(record.kst_date).toDateString();
      return recordDate === todayKey;
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
  const { data: todayFeedback, isLoading: feedbackLoading } =
    useGetDailyFeedback(todayIso);

  const hasTodayFeedback = !!todayFeedback && todayFeedback.is_ai_generated;

  const handleOpenDailyFeedback = async () => {
    try {
      if (hasTodayFeedback) {
        router.push(`/daily?date=${todayIso}`);
        return;
      }
      await createDailyFeedback({ date: todayIso });
      router.push(`/daily?date=${todayIso}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <HomeHeader />
      <RecordForm />
      <RecordList
        records={records}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {hasTodayRecords && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4">
          <Button
            onClick={handleOpenDailyFeedback}
            className="rounded-full shadow-lg"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
              padding: "0.875rem 2rem",
              fontSize: "0.9rem",
            }}
            disabled={isPending || feedbackLoading}
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
