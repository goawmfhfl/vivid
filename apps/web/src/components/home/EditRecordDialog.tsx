import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUpdateRecord, type Record } from "../../hooks/useRecords";
import { COLORS } from "@/lib/design-system";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { RECORD_TYPES, type RecordType } from "../signup/RecordTypeCard";
import { ChevronDown } from "lucide-react";

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
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const updateRecordMutation = useUpdateRecord();
  const { subscription } = useSubscription();

  // 플랜별 사용 가능한 기록 타입 가져오기
  const getAllowedRecordTypes = (): RecordType[] => {
    const plan = subscription?.plan || "free";
    
    // 프리 플랜, 첼린저 플랜: VIVID 기록(dream)만 가능
    if (plan === "free") {
      return ["dream"];
    }
    
    // 프로 플랜: VIVID 기록(dream) + 감정 기록(emotion) 가능
    if (plan === "pro") {
      return ["dream", "emotion"];
    }
    
    // 기본값: VIVID 기록만
    return ["dream"];
  };

  // 플랜별로 허용된 타입만 사용
  const allowedTypes = getAllowedRecordTypes();

  // record가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (record) {
      setEditContent(record.content);
      // record.type이 허용된 타입 목록에 있으면 선택, 없으면 기본값(dream)으로 설정
      const recordType = record.type as RecordType | null;
      if (recordType && allowedTypes.includes(recordType)) {
        setSelectedType(recordType);
      } else {
        // 허용된 타입이 있으면 첫 번째 타입(보통 dream)을 기본값으로 설정
        setSelectedType(
          allowedTypes.length > 0 ? allowedTypes[0] : "dream"
        );
      }
    }
  }, [record, allowedTypes]);

  useEffect(() => {
    if (!showTypeSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const typeSelector = target.closest("[data-type-selector]");
      const typeButton = target.closest("[data-type-selector-button]");

      if (!typeSelector && !typeButton) {
        setShowTypeSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTypeSelector]);

  const handleSaveEdit = () => {
    if (record && editContent.trim()) {
      const updateData: { content: string; type?: string } = {
        content: editContent,
      };
      if (selectedType) {
        updateData.type = selectedType;
      }

      updateRecordMutation.mutate(
        {
          id: record.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setEditContent("");
            setSelectedType(null);
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
    setSelectedType(null);
    setShowTypeSelector(false);
  };

  // 선택된 타입 정보 가져오기
  const selectedTypeInfo = selectedType
    ? RECORD_TYPES.find((t) => t.id === selectedType)
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md [&>button]:z-[110]"
        style={{
          maxWidth: "672px",
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
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div
          className="relative overflow-hidden rounded-lg"
          style={{ zIndex: 1 }}
        >
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
              zIndex: 0,
            }}
          />

          <div className="relative" style={{ zIndex: 1 }}>
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
              {/* 타입 선택 */}
              {allowedTypes && allowedTypes.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    data-type-selector-button
                    onClick={() => setShowTypeSelector(!showTypeSelector)}
                    className="w-full text-left p-3 rounded-lg border transition-all"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: COLORS.border.light,
                      color: COLORS.text.primary,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedTypeInfo ? (
                          <>
                            <span className="text-lg">
                              {selectedTypeInfo.icon}
                            </span>
                            <span className="text-sm font-medium">
                              {selectedTypeInfo.title}
                            </span>
                          </>
                        ) : (
                          <span
                            className="text-sm"
                            style={{ color: COLORS.text.secondary }}
                          >
                            타입 선택
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          color: COLORS.text.secondary,
                          transform: showTypeSelector
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </div>
                  </button>

                  {/* 타입 선택 드롭다운 */}
                  {showTypeSelector && (
                    <div
                      data-type-selector
                      className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: COLORS.background.base,
                        borderColor: COLORS.border.light,
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {allowedTypes.map((typeId) => {
                        const typeInfo = RECORD_TYPES.find(
                          (t) => t.id === typeId
                        );
                        if (!typeInfo) return null;

                        const isSelected = selectedType === typeId;

                        return (
                          <button
                            key={typeId}
                            type="button"
                            onClick={() => {
                              setSelectedType(typeId);
                              setShowTypeSelector(false);
                            }}
                            className="w-full text-left p-3 hover:bg-opacity-50 transition-colors"
                            style={{
                              backgroundColor: isSelected
                                ? COLORS.background.hover
                                : "transparent",
                              color: COLORS.text.primary,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{typeInfo.icon}</span>
                              <span
                                className="text-sm font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {typeInfo.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                  if (editContent.trim() && !updateRecordMutation.isPending) {
                    e.currentTarget.style.backgroundColor = COLORS.brand.dark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (editContent.trim() && !updateRecordMutation.isPending) {
                    e.currentTarget.style.backgroundColor =
                      COLORS.brand.primary;
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
