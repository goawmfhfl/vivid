"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUpdateRecord, type Record } from "../../hooks/useRecords";
import { COLORS, TYPOGRAPHY, SPACING, TRANSITIONS } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { type RecordType } from "../signup/RecordTypeCard";
import { cn } from "@/lib/utils";
import {
  getEmotionIntensityLabel,
  type EmotionIntensity,
} from "@/lib/emotion-data";
import { EmotionIntensityPicker } from "@/components/emotion/EmotionIntensityPicker";
import { EmotionKeywordPicker } from "@/components/emotion/EmotionKeywordPicker";
import { EmotionFactorPicker } from "@/components/emotion/EmotionFactorPicker";
import { EmotionReasonInput } from "@/components/emotion/EmotionReasonInput";

interface EditRecordDialogProps {
  record: Record | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditState {
  editContent: string;
  q1Content: string;
  q2Content: string;
  hasSeparated: boolean;
  selectedType: RecordType | null;
  // 감정 관련 상태
  emotionIntensity?: EmotionIntensity;
  emotionKeywords: string[];
  emotionFactors: string[];
  emotionReason: string;
}

export function EditRecordDialog({
  record,
  open,
  onOpenChange,
}: EditRecordDialogProps) {
  // 초기 상태 (record에서 받아온 원본 데이터)
  const [initialState, setInitialState] = useState<EditState | null>(null);
  
  // 수정 중 상태 (사용자가 입력하는 데이터)
  const [editState, setEditState] = useState<EditState>({
    editContent: "",
    q1Content: "",
    q2Content: "",
    hasSeparated: false,
    selectedType: null,
    emotionIntensity: undefined,
    emotionKeywords: [],
    emotionFactors: [],
    emotionReason: "",
  });

  const updateRecordMutation = useUpdateRecord();
  const { subscription } = useSubscription();
  const isInitializedRef = useRef(false);

  // vivid 타입(dream)일 때 Q1, Q2 분리 파싱
  const parseVividContent = (content: string | null, recordType: RecordType | null) => {
    if (!content || recordType !== "dream") {
      return { q1: null, q2: null, hasSeparated: false };
    }

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
    
    if (plan === "free") {
      return ["dream"];
    }
    
    if (plan === "pro") {
      return ["dream", "emotion"];
    }
    
    return ["dream"];
  };

  const allowedTypes = getAllowedRecordTypes();

  // record가 변경되고 다이얼로그가 열릴 때 초기 상태 설정
  useEffect(() => {
    if (record && open && !isInitializedRef.current) {
      const recordType = record.type as RecordType | null;
      const parsed = parseVividContent(record.content, recordType);
      
      // 감정 데이터 초기화
      const emotionData = record.emotion;
      const emotionIntensity = emotionData?.intensity as EmotionIntensity | undefined;
      const emotionKeywords = emotionData?.keywords || [];
      const emotionFactors = emotionData?.factors || [];
      const emotionReason = emotionData?.reasonText || "";
      
      const newInitialState: EditState = parsed.hasSeparated
        ? {
            editContent: "",
            q1Content: parsed.q1 || "",
            q2Content: parsed.q2 || "",
            hasSeparated: true,
            selectedType: recordType && allowedTypes.includes(recordType)
              ? recordType
              : allowedTypes.length > 0
              ? allowedTypes[0]
              : "dream",
            emotionIntensity,
            emotionKeywords,
            emotionFactors,
            emotionReason,
          }
        : {
            editContent: record.content || "",
            q1Content: "",
            q2Content: "",
            hasSeparated: false,
            selectedType: recordType && allowedTypes.includes(recordType)
              ? recordType
              : allowedTypes.length > 0
              ? allowedTypes[0]
              : "dream",
            emotionIntensity,
            emotionKeywords,
            emotionFactors,
            emotionReason,
          };

      setInitialState(newInitialState);
      setEditState(newInitialState);
      isInitializedRef.current = true;
    }
  }, [record, open, allowedTypes]);

  // 다이얼로그가 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      setInitialState(null);
      setEditState({
        editContent: "",
        q1Content: "",
        q2Content: "",
        hasSeparated: false,
        selectedType: null,
        emotionIntensity: undefined,
        emotionKeywords: [],
        emotionFactors: [],
        emotionReason: "",
      });
      isInitializedRef.current = false;
    }
  }, [open]);

  const handleSaveEdit = () => {
    if (!record || !editState) return;

    // 감정 타입인 경우
    if (editState.selectedType === "emotion") {
      if (!editState.emotionIntensity || 
          editState.emotionKeywords.length === 0 || 
          editState.emotionFactors.length === 0) {
        return;
      }

      const updateData: { 
        content: string; 
        type?: string;
        emotion?: {
          intensity: number;
          keywords: string[];
          factors: string[];
          reasonText: string | null;
        };
      } = {
        content: record.content || "", // 감정 타입은 content가 필요 없지만 API 요구사항
        type: "emotion",
        emotion: {
          intensity: editState.emotionIntensity,
          keywords: editState.emotionKeywords,
          factors: editState.emotionFactors,
          reasonText: editState.emotionReason.trim() || null,
        },
      };

      updateRecordMutation.mutate(
        {
          id: record.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
          onError: (error) => {
            console.error("기록 수정 실패:", error.message);
          },
        }
      );
      return;
    }

    // 일반 타입인 경우
    let contentToSave = "";
    if (editState.hasSeparated && editState.selectedType === "dream") {
      const q1Text = editState.q1Content.trim();
      const q2Text = editState.q2Content.trim();
      
      if (q1Text || q2Text) {
        contentToSave = `Q1. 오늘 하루를 어떻게 보낼까?\n\n${q1Text}\n\nQ2. 앞으로의 나는 어떤 모습일까?\n\n${q2Text}`;
      }
    } else {
      contentToSave = editState.editContent.trim();
    }

    if (!contentToSave) return;

    const updateData: { content: string; type?: string } = {
      content: contentToSave,
    };
    if (editState.selectedType) {
      updateData.type = editState.selectedType;
    }

    updateRecordMutation.mutate(
      {
        id: record.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("기록 수정 실패:", error.message);
        },
      }
    );
  };

  // 감정 관련 핸들러
  const handleIntensityChange = (intensity: EmotionIntensity) => {
    setEditState((prev) => ({
      ...prev,
      emotionIntensity: intensity,
      // intensity가 변경되면 키워드 초기화 (새로운 intensity에 맞는 키워드 선택 필요)
      emotionKeywords: [],
    }));
  };

  const handleToggleKeyword = (keyword: string) => {
    setEditState((prev) => ({
      ...prev,
      emotionKeywords: prev.emotionKeywords.includes(keyword)
        ? prev.emotionKeywords.filter((k) => k !== keyword)
        : [...prev.emotionKeywords, keyword],
    }));
  };

  const handleToggleFactor = (factor: string) => {
    setEditState((prev) => ({
      ...prev,
      emotionFactors: prev.emotionFactors.includes(factor)
        ? prev.emotionFactors.filter((f) => f !== factor)
        : [...prev.emotionFactors, factor],
    }));
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!record || !editState) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md hide-scrollbar edit-record-dialog"
        style={{
          maxWidth: editState.selectedType === "emotion" ? "672px" : "672px",
          width: "calc(100vw - 2rem)",
          maxHeight: "90vh",
          backgroundColor: COLORS.background.base,
          border: `1.5px solid ${COLORS.border.light}`,
          borderRadius: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        <DialogHeader 
          className="px-6 pt-6 pb-4"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: `linear-gradient(to bottom, ${COLORS.background.base} 0%, ${COLORS.background.base} 80%, transparent 100%)`,
            paddingBottom: "1rem",
          }}
        >
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-base sm:text-lg"
              style={{
                color: COLORS.text.primary,
                fontWeight: "600",
              }}
            >
              기록 수정하기
            </DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              style={{
                color: COLORS.text.secondary,
                border: "none",
                backgroundColor: "transparent",
                height: "32px",
                width: "32px",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: TRANSITIONS.default,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div 
          className="space-y-4 px-6 py-4 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
          style={{
            overflowX: "hidden",
          }}
        >
          {editState.selectedType === "emotion" ? (
            <div
              className={cn(
                "flex flex-col gap-8",
                SPACING.element.marginBottomLarge
              )}
            >
              <div className={`flex flex-col ${SPACING.element.gapSmall}`}>
                <p
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "text-center")}
                  style={{ color: COLORS.text.muted }}
                >
                  생각하지 않아도 고를 수 있는 지금의 감정
                </p>
                <EmotionIntensityPicker
                  value={editState.emotionIntensity}
                  onChange={handleIntensityChange}
                />
              </div>
              <div
                className="h-px w-full"
                style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
              />
              <EmotionKeywordPicker
                intensity={editState.emotionIntensity}
                selectedKeywords={editState.emotionKeywords}
                onToggle={handleToggleKeyword}
              />
              <div
                className="h-px w-full"
                style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
              />
              <EmotionFactorPicker
                intensity={editState.emotionIntensity}
                selectedFactors={editState.emotionFactors}
                onToggle={handleToggleFactor}
              />
              <div
                className="h-px w-full"
                style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
              />
              <EmotionReasonInput
                value={editState.emotionReason}
                onChange={(value) => {
                  setEditState((prev) => ({
                    ...prev,
                    emotionReason: value,
                  }));
                }}
                onHelpOpen={() => {}}
                accentColor={
                  editState.emotionIntensity
                    ? COLORS.emotion.intensity[editState.emotionIntensity]
                    : COLORS.brand.primary
                }
              />
            </div>
          ) : editState.hasSeparated && editState.selectedType === "dream" ? (
            <div className="space-y-6">
              {/* Q1 섹션 */}
              <div className="space-y-3">
                <div
                  className="flex items-baseline gap-3 pb-2 border-b"
                  style={{ borderColor: COLORS.border.light }}
                >
                  <span
                    className={cn(TYPOGRAPHY.h4.fontSize, "font-bold tracking-tight")}
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
                  value={editState.q1Content}
                  onChange={(e) => {
                    setEditState((prev) => ({
                      ...prev,
                      q1Content: e.target.value,
                    }));
                  }}
                  className="min-h-[150px] resize-none"
                  disabled={updateRecordMutation.isPending}
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
                    className={cn(TYPOGRAPHY.h4.fontSize, "font-bold tracking-tight")}
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
                  value={editState.q2Content}
                  onChange={(e) => {
                    setEditState((prev) => ({
                      ...prev,
                      q2Content: e.target.value,
                    }));
                  }}
                  className="min-h-[150px] resize-none"
                  disabled={updateRecordMutation.isPending}
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
              value={editState.editContent}
              onChange={(e) => {
                setEditState((prev) => ({
                  ...prev,
                  editContent: e.target.value,
                }));
              }}
              className="min-h-[300px] resize-none"
              disabled={updateRecordMutation.isPending}
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
          className="sticky bottom-0 flex flex-row items-center gap-3"
          style={{
            width: "100%",
            background: `linear-gradient(to top, ${COLORS.background.base} 0%, ${COLORS.background.base} 80%, transparent 100%)`,
            padding: "1.5rem 1.5rem 1.5rem 1.5rem",
            marginTop: "auto",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="flex-1"
            style={{
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
            }}
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={
              (editState.selectedType === "emotion"
                ? !editState.emotionIntensity ||
                  editState.emotionKeywords.length === 0 ||
                  editState.emotionFactors.length === 0
                : editState.hasSeparated && editState.selectedType === "dream"
                ? !editState.q1Content.trim() && !editState.q2Content.trim()
                : !editState.editContent.trim()) || updateRecordMutation.isPending
            }
            className="flex-1"
            style={{
              backgroundColor:
                (editState.selectedType === "emotion"
                  ? !editState.emotionIntensity ||
                    editState.emotionKeywords.length === 0 ||
                    editState.emotionFactors.length === 0
                  : editState.hasSeparated && editState.selectedType === "dream"
                  ? !editState.q1Content.trim() && !editState.q2Content.trim()
                  : !editState.editContent.trim()) ||
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
                (editState.selectedType === "emotion"
                  ? !editState.emotionIntensity ||
                    editState.emotionKeywords.length === 0 ||
                    editState.emotionFactors.length === 0
                  : editState.hasSeparated && editState.selectedType === "dream"
                  ? !editState.q1Content.trim() && !editState.q2Content.trim()
                  : !editState.editContent.trim()) ||
                updateRecordMutation.isPending
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease-in-out",
              padding: "0.625rem 1rem",
              opacity:
                (editState.selectedType === "emotion"
                  ? !editState.emotionIntensity ||
                    editState.emotionKeywords.length === 0 ||
                    editState.emotionFactors.length === 0
                  : editState.hasSeparated && editState.selectedType === "dream"
                  ? !editState.q1Content.trim() && !editState.q2Content.trim()
                  : !editState.editContent.trim()) ||
                updateRecordMutation.isPending
                  ? 0.5
                  : 1,
            }}
          >
            {updateRecordMutation.isPending ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
