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
      <AlertDialogContent style={{ backgroundColor: "#FAFAF8" }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: "#333333" }}>
            기록을 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "#4E4B46" }}>
            이 작업은 되돌릴 수 없습니다. 정말로 이 기록을 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel style={{ color: "#6B7A6F" }}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRecordMutation.isPending}
            style={{
              backgroundColor: "#B1736C",
              color: "white",
            }}
          >
            {deleteRecordMutation.isPending ? "삭제 중..." : "삭제하기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
