"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { Search } from "lucide-react";
import type { CouponVerification } from "@/types/coupon";
import { supabase } from "@/lib/supabase";
import { SystemModal } from "@/components/ui/modals/SystemModal";
import { CouponTicket } from "@/components/coupon/CouponTicket";
import { QUERY_KEYS } from "@/constants";

interface SystemModalState {
  open: boolean;
  title: string;
  message: string;
}

export function CouponRegisterView() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [verification, setVerification] =
    useState<CouponVerification | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [systemModal, setSystemModal] = useState<SystemModalState>({
    open: false,
    title: "",
    message: "",
  });

  const openSystemModal = (title: string, message: string) => {
    setSystemModal({ open: true, title, message });
  };

  const handleSearch = async () => {
    if (!code.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/coupons/${code.trim()}`, {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });
      const data: CouponVerification = await response.json();
      setVerification(data);
    } catch (error) {
      console.error("쿠폰 조회 실패:", error);
      setVerification({
        coupon: null,
        isValid: false,
        isUsed: false,
        message: "쿠폰 조회 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = async () => {
    if (!verification?.isValid || !verification.coupon) {
      return;
    }

    setIsApplying(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "쿠폰 적용에 실패했습니다.";
        if (errorMessage.includes("이미 사용한 쿠폰")) {
          openSystemModal("쿠폰 등록", errorMessage);
          setVerification((prev) =>
            prev && prev.coupon
              ? { ...prev, isUsed: true, isValid: true }
              : prev
          );
          return;
        }
        throw new Error(errorMessage);
      }

      setVerification((prev) =>
        prev && prev.coupon ? { ...prev, isUsed: true, isValid: true } : prev
      );
      await supabase.auth.refreshSession();
      // 쿠폰 적용 직후 사용자 메타데이터(구독 상태)를 즉시 동기화
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.CURRENT_USER],
      });
      openSystemModal("쿠폰 적용 완료", "쿠폰이 성공적으로 적용되었습니다.");
    } catch (error) {
      console.error("쿠폰 적용 실패:", error);
      if (error instanceof Error) {
        if (error.message.includes("이미 사용한 쿠폰")) {
          openSystemModal("쿠폰 등록", error.message);
          return;
        }
        alert(error.message);
        return;
      }
      alert("쿠폰 적용 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  const isSoldOutCoupon = Boolean(
    verification?.message?.includes("사용 횟수가 초과")
  );
  const coupon = verification?.coupon || null;
  const isValidCoupon = Boolean(
    coupon && (verification?.isValid || isSoldOutCoupon)
  );
  const isUsedCoupon = Boolean(verification?.isUsed);

  return (
    <div className="space-y-6 mt-6">
      <SystemModal
        open={systemModal.open}
        onClose={() => setSystemModal((prev) => ({ ...prev, open: false }))}
        title={systemModal.title || "쿠폰 등록"}
        message={systemModal.message || "처리 중 오류가 발생했습니다."}
        closable={true}
      />
      {/* 안내 문구 */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: COLORS.background.hover,
          border: `1px solid ${COLORS.border.light}`,
        }}
      >
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          쿠폰을 등록해주세요
        </p>
      </div>

      {/* 쿠폰 코드 입력 */}
      <div
        className="rounded-xl p-4 sm:p-6"
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: COLORS.text.secondary }}
        >
          쿠폰 코드
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onFocus={() => setIsCodeFocused(true)}
            onBlur={() => setIsCodeFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="쿠폰 코드를 입력하세요"
            className="flex-1 min-w-0 w-full px-4 py-3 rounded-lg border text-base transition-all outline-none"
            style={{
              borderColor: isCodeFocused
                ? COLORS.brand.primary
                : COLORS.border.input,
              borderWidth: isCodeFocused ? "2px" : "1.5px",
              backgroundColor: COLORS.background.base,
              color: COLORS.text.primary,
              boxShadow: isCodeFocused
                ? `0 0 0 3px ${COLORS.brand.primary}20`
                : "none",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={!code.trim() || isSearching}
            className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
            }}
          >
            <Search className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">
              {isSearching ? "검색 중..." : "검색"}
            </span>
          </button>
        </div>
      </div>

      {/* 검색 결과 */}
      {verification && (
        <CouponTicket
          coupon={coupon}
          codeDisplay={coupon?.code || "— — — —"}
          isValid={isValidCoupon}
          isUsed={isUsedCoupon}
          isSoldOut={isSoldOutCoupon}
          isApplying={isApplying}
          invalidMessage={verification.message}
          onApply={handleApply}
          size="default"
          statusMessage={
            isUsedCoupon
              ? "적용되었습니다."
              : undefined
          }
        />
      )}
    </div>
  );
}