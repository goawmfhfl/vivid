"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { getLoginPath } from "@/lib/navigation";
import { COLORS, SPACING, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/useModalStore";

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

export function DeleteAccountPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteAccountMutation = useDeleteAccount();
  const openLoadingModal = useModalStore((state) => state.openLoadingModal);
  const closeLoadingModal = useModalStore((state) => state.closeLoadingModal);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalComment, setAdditionalComment] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason]
    );
  };

  const handleDelete = () => {
    setSubmitError(null);
    openLoadingModal("회원 탈퇴 중...", true);

    deleteAccountMutation.mutate(
      {
        reasons: selectedReasons,
        additionalComment: additionalComment.trim() || null,
      },
      {
        onSuccess: () => {
          closeLoadingModal();
          setTimeout(() => {
            router.push(getLoginPath(searchParams, { deleted: "true" }));
          }, 300);
        },
        onError: (error) => {
          closeLoadingModal();
          setSubmitError(error.message || "회원 탈퇴 중 오류가 발생했습니다.");
        },
      }
    );
  };

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-16`}
      style={{ backgroundColor: COLORS.background.base, minHeight: "100vh" }}
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{ color: COLORS.text.secondary, backgroundColor: COLORS.background.cardElevated }}
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </button>
      </div>

      <section
        className={cn(SPACING.card.padding, SPACING.element.gapLarge, "flex flex-col")}
        style={{
          backgroundColor: COLORS.background.cardElevated,
          border: `1px solid ${COLORS.border.light}`,
          borderRadius: "16px",
        }}
      >
        <div className="space-y-2">
          <h1 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)} style={{ color: COLORS.text.primary }}>
            회원 탈퇴
          </h1>
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.secondary }}
          >
            탈퇴하시기 전에 아래 내용을 확인해 주세요. 탈퇴 이후에는 데이터 복구가 어렵습니다.
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: hexToRgba(COLORS.status.warningLight, 0.16),
            border: `1px solid ${hexToRgba(COLORS.status.warning, 0.35)}`,
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" style={{ color: COLORS.status.warningDark }} />
            <div>
              <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.status.warningDark }}>
                탈퇴 시 주의사항
              </p>
              <p className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)} style={{ color: COLORS.text.secondary }}>
                모든 기록, 리포트, 설정 정보가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
            </div>
          </div>
        </div>

        <div className={cn("space-y-3")}>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" style={{ color: COLORS.brand.primary }} />
            <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
              탈퇴 사유
            </p>
            <span className={cn("ml-auto", TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.tertiary }}>
              선택사항
            </span>
          </div>
          <div className="space-y-2">
            {DELETION_REASONS.map((reason) => {
              const selected = selectedReasons.includes(reason);
              return (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                  style={{
                    backgroundColor: selected ? hexToRgba(COLORS.brand.light, 0.24) : COLORS.background.hoverLight,
                    border: `1px solid ${selected ? hexToRgba(COLORS.brand.primary, 0.45) : COLORS.border.light}`,
                  }}
                >
                  <Checkbox checked={selected} onCheckedChange={() => handleReasonToggle(reason)} />
                  <span className={cn(TYPOGRAPHY.body.fontSize)} style={{ color: selected ? COLORS.text.primary : COLORS.text.secondary }}>
                    {reason}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" style={{ color: COLORS.brand.primary }} />
            <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
              추가 의견
            </p>
            <span className={cn("ml-auto", TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.tertiary }}>
              선택사항
            </span>
          </div>
          <textarea
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            placeholder="의견을 남겨주시면 서비스 개선에 반영하겠습니다."
            maxLength={1000}
            className="min-h-[120px] w-full resize-none rounded-lg p-3 focus:outline-none"
            style={{
              border: `1px solid ${additionalComment ? hexToRgba(COLORS.brand.primary, 0.45) : COLORS.border.input}`,
              backgroundColor: COLORS.background.cardElevated,
              color: COLORS.text.primary,
            }}
          />
          <div className="flex items-center justify-between">
            <span className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.tertiary }}>
              소중한 의견 감사합니다.
            </span>
            <span className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.tertiary }}>
              {additionalComment.length}/1000
            </span>
          </div>
        </div>

        {submitError && (
          <div
            className="rounded-lg p-3"
            style={{
              backgroundColor: hexToRgba(COLORS.status.errorLight, 0.14),
              border: `1px solid ${hexToRgba(COLORS.status.error, 0.3)}`,
            }}
          >
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.status.errorDark }}>
              {submitError}
            </p>
          </div>
        )}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="h-12 flex-1 rounded-xl px-4 transition-colors"
            style={{
              backgroundColor: COLORS.background.hoverLight,
              border: `1px solid ${COLORS.border.input}`,
              color: COLORS.text.secondary,
            }}
            disabled={deleteAccountMutation.isPending}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 flex-1 rounded-xl px-4 transition-colors"
            style={{
              backgroundColor: deleteAccountMutation.isPending ? COLORS.border.light : COLORS.status.error,
              color: deleteAccountMutation.isPending ? COLORS.text.tertiary : COLORS.text.white,
            }}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending
              ? isProduction
                ? "탈퇴 중..."
                : "테스트 중..."
              : isProduction
                ? "탈퇴하기"
                : "테스트하기 (실제 탈퇴 안 됨)"}
          </button>
        </div>
      </section>
    </div>
  );
}
