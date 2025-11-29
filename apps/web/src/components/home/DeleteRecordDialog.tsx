import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useDeleteRecord } from "../../hooks/useRecords";

interface DeleteRecordDialogProps {
  recordId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRecordDialog({
  recordId,
  open,
  onOpenChange,
}: DeleteRecordDialogProps) {
  const deleteRecordMutation = useDeleteRecord();

  const handleDelete = () => {
    if (recordId) {
      deleteRecordMutation.mutate(recordId, {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("기록 삭제 실패:", error.message);
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{
          backgroundColor: "#FAFAF8",
          border: "1px solid #EFE9E3",
          borderRadius: "0.75rem",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              color: "#333333",
              fontSize: "1.125rem",
              fontWeight: "600",
            }}
          >
            기록을 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription
            style={{
              color: "#4E4B46",
              fontSize: "0.875rem",
              lineHeight: "1.5",
              marginTop: "0.5rem",
            }}
          >
            이 작업은 되돌릴 수 없습니다. 정말로 이 기록을 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            style={{
              color: "#4E4B46",
              borderColor: "#E5E7EB",
              backgroundColor: "white",
              fontWeight: "500",
              borderRadius: "0.5rem",
              padding: "0.625rem 1.5rem",
            }}
            className="hover:bg-gray-50 focus:outline-none focus:ring-0"
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRecordMutation.isPending}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
              fontWeight: "600",
              borderRadius: "0.5rem",
              padding: "0.625rem 1.5rem",
              transition: "all 0.2s ease-in-out",
              boxShadow: deleteRecordMutation.isPending
                ? "none"
                : "0 2px 4px rgba(220, 38, 38, 0.2)",
            }}
            className="hover:bg-[#B91C1C] hover:shadow-md focus:outline-none focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleteRecordMutation.isPending ? "삭제 중..." : "삭제하기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
