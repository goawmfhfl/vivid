"use client";

import { useState } from "react";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { COLORS } from "@/lib/design-system";
import type { CouponVerification } from "@/types/coupon";

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (code: string) => Promise<void>;
}

export function CouponModal({
  open,
  onOpenChange,
  onApply,
}: CouponModalProps) {
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [verification, setVerification] =
    useState<CouponVerification | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleSearch = async () => {
    if (!code.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/coupons/${code.trim()}`);
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
      await onApply(code.trim());
      onOpenChange(false);
      setCode("");
      setVerification(null);
    } catch (error) {
      console.error("쿠폰 적용 실패:", error);
      alert("쿠폰 적용 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6"
          style={{
            backgroundColor: COLORS.background.card,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Dialog.Title
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            쿠폰 등록
          </Dialog.Title>

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-opacity-50"
            style={{ backgroundColor: COLORS.background.hover }}
          >
            <X className="w-4 h-4" style={{ color: COLORS.text.secondary }} />
          </button>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                쿠폰 코드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="쿠폰 코드를 입력하세요"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.base,
                    color: COLORS.text.primary,
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={!code.trim() || isSearching}
                  className="px-4 py-2 rounded-lg disabled:opacity-50"
                  style={{
                    backgroundColor: COLORS.brand.primary,
                    color: COLORS.text.white,
                  }}
                >
                  {isSearching ? "검색 중..." : "검색"}
                </button>
              </div>
            </div>

            {verification && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: COLORS.background.hover,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                {verification.isValid && verification.coupon ? (
                  <>
                    <div className="space-y-2 mb-4">
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          쿠폰명:
                        </span>
                        <span
                          className="ml-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          {verification.coupon.name}
                        </span>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          유효 기간:
                        </span>
                        <span
                          className="ml-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          {verification.coupon.duration_days}일
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full px-4 py-2 rounded-lg disabled:opacity-50"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: COLORS.text.white,
                      }}
                    >
                      {isApplying ? "적용 중..." : "사용하기"}
                    </button>
                  </>
                ) : (
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: COLORS.status.error }}
                    >
                      {verification.message || "유효하지 않은 쿠폰입니다."}
                    </p>
                    {verification.isUsed && (
                      <p
                        className="text-xs mt-2"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        이미 사용한 쿠폰입니다.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
