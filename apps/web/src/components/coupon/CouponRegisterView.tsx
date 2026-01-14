"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import type { CouponVerification } from "@/types/coupon";
import { formatKSTDate } from "@/lib/date-utils";

export function CouponRegisterView() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [verification, setVerification] =
    useState<CouponVerification | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    name: string;
    expiresAt: string;
  } | null>(null);

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
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "쿠폰 적용에 실패했습니다.");
      }

      const result = await response.json();
      const expiresAt = new Date(result.expiresAt);
      expiresAt.setDate(expiresAt.getDate() + verification.coupon.duration_days);

      setAppliedCoupon({
        name: verification.coupon.name,
        expiresAt: result.expiresAt,
      });
      setCode("");
      setVerification(null);
    } catch (error) {
      console.error("쿠폰 적용 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "쿠폰 적용 중 오류가 발생했습니다."
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
        {/* 안내 문구 */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: COLORS.background.hover,
            border: `1px solid ${COLORS.border.light}`,
          }}
        >
          <p
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            쿠폰을 등록해주세요
          </p>
        </div>

        {/* 쿠폰 코드 입력 */}
        <div
          className="rounded-xl p-6"
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
          <div className="flex gap-2">
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
              className="flex-1 px-4 py-3 rounded-lg border text-base transition-all outline-none"
              style={{
                borderColor: isCodeFocused ? COLORS.brand.primary : COLORS.border.input,
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
              className="px-6 py-3 rounded-lg disabled:opacity-50 flex items-center gap-2"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              <Search className="w-5 h-5" />
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        {verification && (
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            {verification.isValid && verification.coupon ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: COLORS.status.success }}
                  />
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    쿠폰을 찾았습니다
                  </h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: COLORS.text.secondary }}
                    >
                      쿠폰명:
                    </span>
                    <p
                      className="mt-1 text-base"
                      style={{ color: COLORS.text.primary }}
                    >
                      {verification.coupon.name}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: COLORS.text.secondary }}
                    >
                      유효 기간:
                    </span>
                    <p
                      className="mt-1 text-base"
                      style={{ color: COLORS.text.primary }}
                    >
                      {verification.coupon.duration_days}일
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full px-4 py-3 rounded-lg disabled:opacity-50 font-medium"
                  style={{
                    backgroundColor: COLORS.brand.primary,
                    color: COLORS.text.white,
                  }}
                >
                  {isApplying ? "적용 중..." : "사용하기"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle
                  className="w-5 h-5"
                  style={{ color: COLORS.status.error }}
                />
                <div>
                  <p
                    className="text-base font-medium"
                    style={{ color: COLORS.status.error }}
                  >
                    {verification.message || "유효하지 않은 쿠폰입니다."}
                  </p>
                  {verification.isUsed && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      이미 사용한 쿠폰입니다.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 적용 완료 모달 */}
        {appliedCoupon && (
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              border: `2px solid ${COLORS.status.success}`,
            }}
          >
            <div className="text-center space-y-4">
              <CheckCircle2
                className="w-12 h-12 mx-auto"
                style={{ color: COLORS.status.success }}
              />
              <div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: COLORS.text.primary }}
                >
                  적용이 완료되었습니다
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: COLORS.text.secondary }}
                >
                  {appliedCoupon.name}
                </p>
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: COLORS.background.hover,
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    적용 기간
                  </p>
                  <p
                    className="text-base font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {formatKSTDate(appliedCoupon.expiresAt)}까지
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAppliedCoupon(null);
                  router.push("/my-info");
                }}
                className="w-full px-4 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: COLORS.text.white,
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
