"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/app/providers";
import { QUERY_KEYS } from "@/constants";
import { RECORD_TYPES, type RecordType } from "../signup/RecordTypeCard";
import { Check } from "lucide-react";

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemSettingsModal({
  isOpen,
  onClose,
}: SystemSettingsModalProps) {
  const { data: user, isLoading } = useCurrentUser();
  const { isPro } = useSubscription();
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최대 선택 개수: Pro 유저는 5개, 일반 유저는 2개
  const maxSelections = isPro ? 5 : 2;

  // 사용자의 현재 기록 타입 불러오기
  useEffect(() => {
    if (user?.user_metadata?.recordTypes) {
      const types = user.user_metadata.recordTypes as RecordType[];
      setSelectedTypes(types);
    } else {
      // 기본값: 빈 배열
      setSelectedTypes([]);
    }
  }, [user]);

  const handleTypeToggle = (typeId: RecordType) => {
    setError(null);
    if (selectedTypes.includes(typeId)) {
      // 이미 선택된 경우 제거
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      // 선택되지 않은 경우 추가
      if (selectedTypes.length < maxSelections) {
        setSelectedTypes([...selectedTypes, typeId]);
      } else {
        setError(
          isPro
            ? "기록 타입은 최대 5개까지 선택할 수 있습니다."
            : "기록 타입은 최대 2개까지 선택할 수 있습니다. Pro 멤버십을 이용하면 5개까지 선택할 수 있습니다."
        );
      }
    }
  };

  const handleSave = async () => {
    if (selectedTypes.length > maxSelections) {
      setError(
        isPro
          ? "기록 타입은 최대 5개까지 선택할 수 있습니다."
          : "기록 타입은 최대 2개까지 선택할 수 있습니다."
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const {
        data: { user: currentUser },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !currentUser) {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }

      // user_metadata 업데이트
      const updatedMetadata = {
        ...(currentUser.user_metadata || {}),
        recordTypes: selectedTypes,
      };

      const { error: updateError } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (updateError) {
        throw updateError;
      }

      // 캐시 무효화하여 사용자 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });

      onClose();
    } catch (err) {
      console.error("기록 타입 업데이트 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "기록 타입을 업데이트하는 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[90vw] sm:max-w-md w-full [&>button]:z-[110] [&>button]:bg-white/95 [&>button]:border-gray-300 [&>button]:hover:bg-gray-50"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
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
          // 오버레이 클릭 시 모달 닫기
          onClose();
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
            <DialogHeader className="pb-3">
              <DialogTitle
                className="text-lg sm:text-xl"
                style={{ color: COLORS.text.primary }}
              >
                시스템 설정
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div>
                <h3
                  className="mb-2 sm:mb-3 font-semibold text-sm sm:text-base"
                  style={{ color: COLORS.text.primary }}
                >
                  기록 타입 설정
                </h3>
                <p
                  className="mb-3 sm:mb-4 text-xs sm:text-sm"
                  style={{ color: COLORS.text.secondary, opacity: 0.8 }}
                >
                  {isPro
                    ? "사용할 기록 타입을 선택하세요. (최대 5개 - Pro 멤버십)"
                    : "사용할 기록 타입을 선택하세요. (최대 2개)"}
                </p>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p style={{ color: COLORS.text.tertiary }}>로딩 중...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {RECORD_TYPES.map((type) => {
                      const isSelected = selectedTypes.includes(type.id);
                      const isDisabled =
                        !isSelected && selectedTypes.length >= maxSelections;

                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleTypeToggle(type.id)}
                          disabled={isDisabled}
                          className="w-full text-left p-3 sm:p-4 rounded-lg transition-all relative overflow-hidden pr-10 sm:pr-12"
                          style={{
                            backgroundColor: isSelected
                              ? COLORS.background.hover
                              : COLORS.background.card,
                            border: `1px solid ${
                              isSelected
                                ? COLORS.brand.primary
                                : COLORS.border.light
                            }`,
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            boxShadow: isSelected
                              ? `0 2px 8px rgba(107, 122, 111, 0.15)`
                              : `0 1px 3px rgba(0,0,0,0.05)`,
                          }}
                          onMouseEnter={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.backgroundColor =
                                COLORS.background.hover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? COLORS.background.hover
                              : COLORS.background.card;
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-lg sm:text-xl flex-shrink-0">
                              {type.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div
                                className="font-medium text-sm sm:text-base"
                                style={{ color: COLORS.text.primary }}
                              >
                                {type.title}
                              </div>
                              <div
                                className="text-xs mt-0.5 line-clamp-2"
                                style={{
                                  color: COLORS.text.secondary,
                                  opacity: 0.7,
                                }}
                              >
                                {type.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: COLORS.brand.primary,
                                color: COLORS.text.white,
                              }}
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {error && (
                  <div
                    className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg text-xs sm:text-sm"
                    style={{
                      backgroundColor: "#FEF2F2",
                      color: COLORS.status.error,
                    }}
                  >
                    {error}
                  </div>
                )}

                <div
                  className="mt-3 sm:mt-4 text-xs sm:text-sm text-center"
                  style={{ color: COLORS.text.tertiary }}
                >
                  선택된 타입: {selectedTypes.length}/{maxSelections}
                  {!isPro && (
                    <span
                      className="ml-2"
                      style={{ color: COLORS.brand.primary, fontSize: "0.75rem" }}
                    >
                      (Pro 멤버십: 5개까지 가능)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors"
                style={{
                  backgroundColor: COLORS.background.hover,
                  color: COLORS.text.secondary,
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || selectedTypes.length === 0}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSaving
                    ? COLORS.border.light
                    : COLORS.brand.primary,
                  color: COLORS.text.white,
                }}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
