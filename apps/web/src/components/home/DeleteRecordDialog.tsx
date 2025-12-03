import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useDeleteRecord } from "../../hooks/useRecords";
import { COLORS } from "@/lib/design-system";

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
            <AlertDialogHeader className="pb-3 sm:pb-4">
              <AlertDialogTitle
                className="text-base sm:text-lg"
                style={{
                  color: COLORS.text.primary,
                  fontWeight: "600",
                }}
              >
                기록을 삭제하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-sm sm:text-base mt-2 sm:mt-3"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                이 작업은 되돌릴 수 없습니다.
                <br />
                정말로 이 기록을 삭제하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div
              className="mt-4 sm:mt-6"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                gap: "0.75rem",
                width: "100%",
              }}
            >
              <AlertDialogCancel
                className="!mt-0 !h-auto"
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  color: COLORS.text.secondary,
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.hover,
                  fontWeight: "500",
                  border: `1px solid ${COLORS.border.input}`,
                  height: "44px",
                  minHeight: "44px",
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
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteRecordMutation.isPending}
                className="!h-auto"
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  backgroundColor: deleteRecordMutation.isPending
                    ? COLORS.border.light
                    : COLORS.status.error,
                  color: COLORS.text.white,
                  fontWeight: "600",
                  border: "none",
                  height: "44px",
                  minHeight: "44px",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  cursor: deleteRecordMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.625rem 1rem",
                  margin: 0,
                  boxShadow: deleteRecordMutation.isPending
                    ? "none"
                    : `0 2px 4px ${COLORS.status.error}30`,
                }}
                onMouseEnter={(e) => {
                  if (!deleteRecordMutation.isPending) {
                    e.currentTarget.style.backgroundColor = "#B91C1C";
                    e.currentTarget.style.boxShadow = `0 4px 8px ${COLORS.status.error}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleteRecordMutation.isPending) {
                    e.currentTarget.style.backgroundColor = COLORS.status.error;
                    e.currentTarget.style.boxShadow = `0 2px 4px ${COLORS.status.error}30`;
                  }
                }}
              >
                {deleteRecordMutation.isPending ? "삭제 중..." : "삭제하기"}
              </AlertDialogAction>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
