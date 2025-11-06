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
import { RECORD_TYPES } from "../../constants";

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
  const [editType, setEditType] = useState<Record["type"]>(
    RECORD_TYPES.INSIGHT
  );
  const updateRecordMutation = useUpdateRecord();

  const getTypeLabel = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "인사이트";
      case RECORD_TYPES.FEEDBACK:
        return "피드백";
      case RECORD_TYPES.VISUALIZING:
        return "시각화";
    }
  };

  const getTypeColor = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "#A8BBA8";
      case RECORD_TYPES.FEEDBACK:
        return "#A3BFD9";
      case RECORD_TYPES.VISUALIZING:
        return "#8FA894";
    }
  };

  // record가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (record) {
      setEditContent(record.content);
      setEditType(record.type);
    }
  }, [record]);

  const handleSaveEdit = () => {
    if (record && editContent.trim()) {
      updateRecordMutation.mutate(
        {
          id: record.id,
          data: { content: editContent, type: editType },
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
          <div className="flex gap-3">
            {(
              [
                RECORD_TYPES.INSIGHT,
                RECORD_TYPES.FEEDBACK,
                RECORD_TYPES.VISUALIZING,
              ] as const
            ).map((type) => (
              <button
                key={type}
                onClick={() => setEditType(type)}
                className="px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    editType === type ? getTypeColor(type) : "transparent",
                  color: editType === type ? "white" : "#4E4B46",
                  border: editType === type ? "none" : "1px solid #E5E7EB",
                }}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>

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

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            style={{ color: "#6B7A6F" }}
          >
            취소
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={!editContent.trim() || updateRecordMutation.isPending}
            style={{
              backgroundColor: getTypeColor(editType),
              color: "white",
            }}
          >
            {updateRecordMutation.isPending ? "저장 중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
