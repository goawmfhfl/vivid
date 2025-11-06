import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useRecords, type Record } from "../hooks/useRecords";
import { RecordForm } from "./Home/RecordForm";
import { RecordList } from "./Home/RecordList";
import { EditRecordDialog } from "./Home/EditRecordDialog";
import { DeleteRecordDialog } from "./Home/DeleteRecordDialog";
import { useCreateDailyFeedback } from "@/hooks/useCreateDailyFeedback";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";

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
      <header className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1
              className="mb-1"
              style={{ color: "#333333", fontSize: "1.5rem" }}
            >
              오늘의 기록
            </h1>
            <p
              style={{
                color: "#4E4B46",
                opacity: 0.7,
                fontSize: "0.9rem",
              }}
            >
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "#F3F4F6",
                border: "1px solid #EFE9E3",
              }}
            >
              <User className="w-3.5 h-3.5" style={{ color: "#6B7A6F" }} />
              <span
                style={{
                  color: "#4E4B46",
                  fontSize: "0.8rem",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {"goawmfhfl1@naver.com"}
              </span>
            </div>
            <button
              className="p-2 rounded-full transition-all hover:bg-gray-100"
              style={{ color: "#6B7A6F" }}
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

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
