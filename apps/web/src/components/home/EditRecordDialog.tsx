import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useUpdateRecord, type Record } from "../../hooks/useRecords";
import { COLORS } from "@/lib/design-system";

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
      <DialogContent
        className="max-w-[calc(100vw-2rem)] sm:max-w-md"
        style={{
          maxWidth: "calc(100vw - 2rem)",
          width: "calc(100vw - 2rem)",
          left: "50%",
          right: "auto",
          marginLeft: 0,
          marginRight: 0,
          backgroundColor: COLORS.background.base,
          border: `1.5px solid ${COLORS.border.light}`,
          borderRadius: "16px",
          boxShadow: `
            0 4px 16px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `,
          // 종이 질감 배경 패턴
          backgroundImage: `
            /* 가로 줄무늬 */
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
      >
        <div className="relative overflow-hidden rounded-lg">
          {/* 종이 질감 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              background: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
              `,
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          />

          <div className="relative z-10">
            <DialogHeader className="pb-3 sm:pb-4">
              <DialogTitle
                className="text-base sm:text-lg"
                style={{
                  color: COLORS.text.primary,
                  fontWeight: "600",
                }}
              >
                기록 수정하기
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] resize-none"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: COLORS.text.primary,
                  lineHeight: "1.7",
                  border: `1px solid ${COLORS.border.light}`,
                  borderRadius: "0.5rem",
                }}
              />
            </div>

            <div
              className="mt-4 sm:mt-6"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.75rem",
                width: "100%",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                className="flex-1"
                style={{
                  minWidth: 0,
                  color: COLORS.text.secondary,
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.hover,
                  fontWeight: "500",
                  border: `1px solid ${COLORS.border.input}`,
                  height: "44px",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.625rem 1rem",
                  margin: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.hoverLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.hover;
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateRecordMutation.isPending}
                className="flex-1"
                style={{
                  minWidth: 0,
                  backgroundColor:
                    !editContent.trim() || updateRecordMutation.isPending
                      ? COLORS.border.light
                      : COLORS.brand.primary,
                  color: COLORS.text.white,
                  fontWeight: "600",
                  border: "none",
                  height: "44px",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  cursor:
                    !editContent.trim() || updateRecordMutation.isPending
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.625rem 1rem",
                  margin: 0,
                  opacity:
                    !editContent.trim() || updateRecordMutation.isPending
                      ? 0.5
                      : 1,
                }}
                onMouseEnter={(e) => {
                  if (
                    editContent.trim() &&
                    !updateRecordMutation.isPending
                  ) {
                    e.currentTarget.style.backgroundColor = COLORS.brand.dark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    editContent.trim() &&
                    !updateRecordMutation.isPending
                  ) {
                    e.currentTarget.style.backgroundColor = COLORS.brand.primary;
                  }
                }}
              >
                {updateRecordMutation.isPending ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
