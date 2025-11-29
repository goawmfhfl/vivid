import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useUpdateRecord, type Record } from "../../hooks/useRecords";

interface EditRecordDialogProps {
  record: Record | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecordDialog({
  record,
  open,
  onOpenChange,
}: EditRecordDialogProps) {
  const [editContent, setEditContent] = useState("");
  const updateRecordMutation = useUpdateRecord();

  // record가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (record) {
      setEditContent(record.content);
    }
  }, [record]);

  const handleSaveEdit = () => {
    if (record && editContent.trim()) {
      updateRecordMutation.mutate(
        {
          id: record.id,
          data: { content: editContent },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setEditContent("");
          },
          onError: (error) => {
            console.error("기록 수정 실패:", error.message);
          },
        }
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEditContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: "#FAFAF8" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#333333" }}>기록 수정하기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[150px] resize-none"
            style={{
              backgroundColor: "white",
              color: "#333333",
              lineHeight: "1.7",
            }}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            style={{
              color: "#4E4B46",
              borderColor: "#E5E7EB",
              backgroundColor: "white",
              fontWeight: "500",
            }}
            className="hover:bg-gray-50 focus:outline-none focus:ring-0"
          >
            취소
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={!editContent.trim() || updateRecordMutation.isPending}
            style={{
              backgroundColor: "#6B7A6F",
              color: "#FFFFFF",
              fontWeight: "600",
            }}
            className="hover:opacity-90 shadow-sm focus:outline-none focus:ring-0"
          >
            {updateRecordMutation.isPending ? "저장 중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
