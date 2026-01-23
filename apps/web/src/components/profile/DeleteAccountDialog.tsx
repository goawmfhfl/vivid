"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { Checkbox } from "../ui/checkbox";
import { AlertCircle, MessageSquare, HelpCircle } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";
import { useToast } from "@/hooks/useToast";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 탈퇴 사유 옵션
const DELETION_REASONS = [
  "사용 빈도가 낮아서",
  "기대했던 기능/효과와 달라서",
  "사용 방법이 어렵거나 복잡해서",
  "콘텐츠/기능이 부족해서",
  "가격이 부담돼서",
  "다른 서비스를 이용하게 돼서",
  "기술적 오류가 잦아서",
  "개인적인 사정으로 잠시 중단",
  "개인정보/보안이 걱정돼서",
] as const;

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: DeleteAccountDialogProps) {
  const deleteAccountMutation = useDeleteAccount();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalComment, setAdditionalComment] = useState("");
  const openLoadingModal = useModalStore((state) => state.openLoadingModal);
  const closeLoadingModal = useModalStore((state) => state.closeLoadingModal);
  const { showToast } = useToast();
  
  // Production 모드 체크 (Production에서만 실제 탈퇴 실행)
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleDelete = () => {
    // 로딩 모달 열기
    openLoadingModal("회원 탈퇴 중...", true);
    
    // 다이얼로그 닫기
    onOpenChange(false);

    // Development 모드에서는 테스트만 (실제 탈퇴는 안 됨)
    if (!isProduction) {
      // Development 모드: 테스트용 시뮬레이션
      console.log("Development 모드: 회원 탈퇴 테스트 (실제 탈퇴는 되지 않습니다)");
      console.log("탈퇴 사유:", selectedReasons);
      console.log("추가 의견:", additionalComment);
      
      // 시뮬레이션: 로딩 상태 표시
      deleteAccountMutation.mutate(
        {
          reasons: selectedReasons,
          additionalComment: additionalComment.trim() || null,
        },
        {
          onSuccess: () => {
            // Development에서는 실제 API 호출 없이 시뮬레이션만
            setTimeout(() => {
              closeLoadingModal();
              // 약간의 지연 후 리다이렉션
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess();
                }
              }, 300);
            }, 1500);
          },
          onError: (error) => {
            closeLoadingModal();
            console.error("회원 탈퇴 테스트 실패:", error.message);
          },
        }
      );
      return;
    }

    // Production 모드: 실제 회원 탈퇴 실행
    deleteAccountMutation.mutate(
      {
        reasons: selectedReasons,
        additionalComment: additionalComment.trim() || null,
      },
      {
        onSuccess: () => {
          // 탈퇴 성공 시 로딩 모달 닫기
          closeLoadingModal();
          // 약간의 지연 후 리다이렉션
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            }
          }, 300);
        },
        onError: (error) => {
          closeLoadingModal();
          console.error("회원 탈퇴 실패:", error.message);
        },
      }
    );
  };

  // 다이얼로그가 닫힐 때 상태 초기화
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedReasons([]);
      setAdditionalComment("");
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
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
            <AlertDialogHeader className="pb-4 sm:pb-5">
              <AlertDialogTitle
                className="text-center text-lg sm:text-xl"
                style={{
                  color: COLORS.text.primary,
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                회원 탈퇴를 고려하고 계신가요?
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-center text-sm sm:text-base mt-2"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.6",
                }}
              >
                탈퇴하시기 전에, 저희 서비스를 떠나시는 이유를
                <br />
                알려주시면 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
              </AlertDialogDescription>

              {/* 안내 박스 */}
              <div
                className="mt-4 p-3 rounded-lg flex items-start gap-2"
                style={{
                  backgroundColor: COLORS.status.warningLight + "20",
                  border: `1px solid ${COLORS.status.warning}30`,
                }}
              >
                <AlertCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: COLORS.status.warning }}
                />
                <div className="flex-1">
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: COLORS.status.warningDark }}
                  >
                    탈퇴 시 주의사항
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                  >
                    탈퇴하시면 모든 기록, 리포트, 설정 정보가
                    <br />
                    영구적으로 삭제되며 복구할 수 없습니다.
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            {/* 탈퇴 사유 섹션 */}
            <div className="mt-6 space-y-5 max-h-[420px] overflow-y-auto px-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle
                    className="w-4 h-4"
                    style={{ color: COLORS.brand.primary }}
                  />
                  <label
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    탈퇴하시는 이유를 알려주세요
                  </label>
                  <span
                    className="text-xs ml-auto"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    선택사항
                  </span>
                </div>
                <div className="space-y-1.5">
                  {DELETION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 group"
                      style={{
                        backgroundColor: selectedReasons.includes(reason)
                          ? COLORS.brand.light + "25"
                          : COLORS.background.hoverLight,
                        border: `1px solid ${
                          selectedReasons.includes(reason)
                            ? COLORS.brand.primary + "40"
                            : COLORS.border.light
                        }`,
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedReasons.includes(reason)) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.background.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedReasons.includes(reason)) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.background.hoverLight;
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedReasons.includes(reason)}
                        onCheckedChange={() => handleReasonToggle(reason)}
                      />
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: selectedReasons.includes(reason)
                            ? COLORS.text.primary
                            : COLORS.text.secondary,
                          fontWeight: selectedReasons.includes(reason)
                            ? "500"
                            : "400",
                        }}
                      >
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 추가 의견 입력 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare
                    className="w-4 h-4"
                    style={{ color: COLORS.brand.primary }}
                  />
                  <label
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    더 자세한 의견이 있으시다면
                  </label>
                  <span
                    className="text-xs ml-auto"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    선택사항
                  </span>
                </div>
                <textarea
                  value={additionalComment}
                  onChange={(e) => setAdditionalComment(e.target.value)}
                  placeholder="예: 특정 기능이 추가되면 다시 이용하고 싶어요, UI가 더 직관적이면 좋겠어요 등"
                  className="w-full min-h-[100px] p-3 rounded-lg border resize-none transition-colors focus:outline-none"
                  style={{
                    borderColor: additionalComment
                      ? COLORS.brand.primary + "40"
                      : COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    소중한 의견 감사합니다
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        additionalComment.length > 900
                          ? COLORS.status.warning
                          : COLORS.text.tertiary,
                    }}
                  >
                    {additionalComment.length}/1000
                  </p>
                </div>
              </div>
            </div>
            <div
              className="mt-6 pt-4 border-t"
              style={{
                borderColor: COLORS.border.light,
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
                  height: "48px",
                  minHeight: "48px",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.75rem 1rem",
                  margin: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.hoverLight;
                  e.currentTarget.style.borderColor = COLORS.brand.primary + "40";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.hover;
                  e.currentTarget.style.borderColor = COLORS.border.input;
                }}
              >
                계속 이용하기
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteAccountMutation.isPending}
                className="!h-auto"
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  backgroundColor: deleteAccountMutation.isPending
                    ? COLORS.border.light
                    : COLORS.status.error,
                  color: deleteAccountMutation.isPending
                    ? COLORS.text.tertiary
                    : COLORS.text.white,
                  fontWeight: "600",
                  border: "none",
                  height: "48px",
                  minHeight: "48px",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9375rem",
                  cursor: deleteAccountMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  transition: "all 0.2s ease-in-out",
                  padding: "0.75rem 1rem",
                  margin: 0,
                  boxShadow: deleteAccountMutation.isPending
                    ? "none"
                    : `0 2px 8px ${COLORS.status.error}30`,
                }}
                onMouseEnter={(e) => {
                  if (!deleteAccountMutation.isPending) {
                    e.currentTarget.style.backgroundColor = COLORS.status.errorDark;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.status.error}40`;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleteAccountMutation.isPending) {
                    e.currentTarget.style.backgroundColor = COLORS.status.error;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.status.error}30`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {deleteAccountMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    {isProduction ? "탈퇴 중..." : "테스트 중..."}
                  </span>
                ) : (
                  isProduction ? "탈퇴하기" : "테스트하기 (실제 탈퇴 안 됨)"
                )}
              </AlertDialogAction>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
