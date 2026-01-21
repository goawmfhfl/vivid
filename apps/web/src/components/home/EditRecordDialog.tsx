import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUpdateRecord, type Record } from "../../hooks/useRecords";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { RECORD_TYPES, type RecordType } from "../signup/RecordTypeCard";
import { cn } from "@/lib/utils";

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
  const [q1Content, setQ1Content] = useState("");
  const [q2Content, setQ2Content] = useState("");
  const [hasSeparated, setHasSeparated] = useState(false);
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const updateRecordMutation = useUpdateRecord();
  const { subscription } = useSubscription();

  // vivid 타입(dream)일 때 Q1, Q2 분리 파싱
  const parseVividContent = (content: string | null, recordType: RecordType | null) => {
    if (!content || recordType !== "dream") {
      return { q1: null, q2: null, hasSeparated: false };
    }

    // Q1과 Q2 패턴 찾기
    const q1Match = content.match(/Q1\.\s*오늘 하루를 어떻게 보낼까\?[\s\n]*([\s\S]*?)(?=\n\nQ2\.|$)/);
    const q2Match = content.match(/Q2\.\s*앞으로의 나는 어떤 모습일까\?[\s\n]*([\s\S]*?)$/);

    if (q1Match && q2Match) {
      return {
        q1: q1Match[1].trim(),
        q2: q2Match[1].trim(),
        hasSeparated: true,
      };
    }

    return { q1: null, q2: null, hasSeparated: false };
  };

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
      const recordType = record.type as RecordType | null;
      
      // Q1, Q2 분리 여부 확인
      const parsed = parseVividContent(record.content, recordType);
      
      if (parsed.hasSeparated) {
        setQ1Content(parsed.q1 || "");
        setQ2Content(parsed.q2 || "");
        setHasSeparated(true);
        setEditContent(""); // 분리된 경우 editContent는 사용하지 않음
      } else {
        setEditContent(record.content || "");
        setQ1Content("");
        setQ2Content("");
        setHasSeparated(false);
      }
      
      // record.type이 허용된 타입 목록에 있으면 선택, 없으면 기본값(dream)으로 설정
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

  const handleSaveEdit = () => {
    if (!record) return;

    // Q1, Q2가 분리된 경우 합쳐서 저장
    let contentToSave = "";
    if (hasSeparated && selectedType === "dream") {
      const q1Text = q1Content.trim();
      const q2Text = q2Content.trim();
      
      if (q1Text || q2Text) {
        contentToSave = `Q1. 오늘 하루를 어떻게 보낼까?\n\n${q1Text}\n\nQ2. 앞으로의 나는 어떤 모습일까?\n\n${q2Text}`;
      }
    } else {
      contentToSave = editContent.trim();
    }

    if (!contentToSave) return;

    const updateData: { content: string; type?: string } = {
      content: contentToSave,
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
          setQ1Content("");
          setQ2Content("");
          setHasSeparated(false);
          setSelectedType(null);
        },
        onError: (error) => {
          console.error("기록 수정 실패:", error.message);
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setEditContent("");
    setQ1Content("");
    setQ2Content("");
    setHasSeparated(false);
    setSelectedType(null);
  };

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
              {/* Q1, Q2가 분리된 경우 */}
              {hasSeparated && selectedType === "dream" ? (
                <div className="space-y-6">
                  {/* Q1 섹션 */}
                  <div className="space-y-3">
                    <div
                      className="flex items-baseline gap-3 pb-2 border-b"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <span
                        className={cn(
                          TYPOGRAPHY.h4.fontSize,
                          "font-bold tracking-tight"
                        )}
                        style={{
                          color: COLORS.text.primary,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Q1
                      </span>
                      <h3
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.fontWeight,
                          "flex-1"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        오늘 하루를 어떻게 보낼까?
                      </h3>
                    </div>
                    <Textarea
                      value={q1Content}
                      onChange={(e) => setQ1Content(e.target.value)}
                      className="min-h-[150px] resize-none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        color: COLORS.text.primary,
                        lineHeight: "1.7",
                        border: `1px solid ${COLORS.border.light}`,
                        borderRadius: "0.5rem",
                      }}
                      placeholder="오늘 하루를 어떻게 보낼지 작성해주세요"
                    />
                  </div>

                  {/* Q2 섹션 */}
                  <div className="space-y-3">
                    <div
                      className="flex items-baseline gap-3 pb-2 border-b"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <span
                        className={cn(
                          TYPOGRAPHY.h4.fontSize,
                          "font-bold tracking-tight"
                        )}
                        style={{
                          color: COLORS.text.primary,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Q2
                      </span>
                      <h3
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.fontWeight,
                          "flex-1"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        앞으로의 나는 어떤 모습일까?
                      </h3>
                    </div>
                    <Textarea
                      value={q2Content}
                      onChange={(e) => setQ2Content(e.target.value)}
                      className="min-h-[150px] resize-none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        color: COLORS.text.primary,
                        lineHeight: "1.7",
                        border: `1px solid ${COLORS.border.light}`,
                        borderRadius: "0.5rem",
                      }}
                      placeholder="앞으로의 나는 어떤 모습일지 작성해주세요"
                    />
                  </div>
                </div>
              ) : (
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
              )}
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
                disabled={
                  (hasSeparated && selectedType === "dream"
                    ? !q1Content.trim() && !q2Content.trim()
                    : !editContent.trim()) || updateRecordMutation.isPending
                }
                className="flex-1"
                style={{
                  minWidth: 0,
                  backgroundColor:
                    (hasSeparated && selectedType === "dream"
                      ? !q1Content.trim() && !q2Content.trim()
                      : !editContent.trim()) ||
                    updateRecordMutation.isPending
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
                    (hasSeparated && selectedType === "dream"
                      ? !q1Content.trim() && !q2Content.trim()
                      : !editContent.trim()) ||
                    updateRecordMutation.isPending
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.625rem 1rem",
                  margin: 0,
                  opacity:
                    (hasSeparated && selectedType === "dream"
                      ? !q1Content.trim() && !q2Content.trim()
                      : !editContent.trim()) ||
                    updateRecordMutation.isPending
                      ? 0.5
                      : 1,
                }}
                onMouseEnter={(e) => {
                  const hasContent = hasSeparated && selectedType === "dream"
                    ? q1Content.trim() || q2Content.trim()
                    : editContent.trim();
                  if (hasContent && !updateRecordMutation.isPending) {
                    e.currentTarget.style.backgroundColor = COLORS.brand.dark;
                  }
                }}
                onMouseLeave={(e) => {
                  const hasContent = hasSeparated && selectedType === "dream"
                    ? q1Content.trim() || q2Content.trim()
                    : editContent.trim();
                  if (hasContent && !updateRecordMutation.isPending) {
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
