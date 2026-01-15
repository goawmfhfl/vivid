import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";
import { Search } from "lucide-react";
import type { CouponVerification } from "@/types/coupon";
import { supabase } from "@/lib/supabase";
import { CouponTicket } from "@/components/coupon/CouponTicket";

interface AdditionalInfoStepProps {
  birthYear: string;
  gender: string;
  birthYearError?: string;
  genderError?: string;
  onBirthYearChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  couponCode: string | null;
  onCouponCodeChange: (code: string | null) => void;
}

export function AdditionalInfoStep({
  birthYear,
  gender,
  birthYearError,
  genderError,
  onBirthYearChange,
  onGenderChange,
  couponCode,
  onCouponCodeChange,
}: AdditionalInfoStepProps) {
  const [couponInput, setCouponInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCouponFocused, setIsCouponFocused] = useState(false);
  const [isGenderFocused, setIsGenderFocused] = useState(false);
  const [verification, setVerification] =
    useState<CouponVerification | null>(null);

  const fetchCouponVerification = async (targetCode: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`/api/coupons/${targetCode.trim()}`, {
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });

    const data: CouponVerification = await response.json();
    return data;
  };

  // couponCode가 변경되면 입력값과 검증 상태 동기화
  useEffect(() => {
    if (couponCode) {
      setCouponInput(couponCode);
      // couponCode가 있으면 해당 쿠폰 정보 다시 조회
      if (couponCode.trim()) {
        fetchCouponVerification(couponCode)
          .then((data) => setVerification(data))
          .catch(() => {
            // 조회 실패 시 무시
          });
      }
    }
  }, [couponCode]);

  const handleCouponSearch = async () => {
    if (!couponInput.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const data = await fetchCouponVerification(couponInput);
      setVerification(data);
      
      if (data.isValid && data.coupon) {
        onCouponCodeChange(couponInput.trim());
      } else {
        onCouponCodeChange(null);
      }
    } catch (error) {
      console.error("쿠폰 조회 실패:", error);
      setVerification({
        coupon: null,
        isValid: false,
        isUsed: false,
        message: "쿠폰 조회 중 오류가 발생했습니다.",
      });
      onCouponCodeChange(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          추가 정보
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          개인화된 경험을 위해 추가 정보를 입력해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: COLORS.text.primary }}
              htmlFor="birthYear"
            >
              출생년도
            </label>
            <Input
              id="birthYear"
              type="text"
              inputMode="numeric"
              value={birthYear}
              onChange={(e) => {
                const cleaned = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 4);
                onBirthYearChange(cleaned);
              }}
              placeholder="예) 1994"
              className="w-full"
              style={{
                borderColor: birthYearError ? "#EF4444" : COLORS.border.light,
                backgroundColor: "white",
              }}
            />
            {birthYearError && (
              <p className="mt-1 text-xs text-[#EF4444]">{birthYearError}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: COLORS.text.primary }}
              htmlFor="gender"
            >
              성별
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => onGenderChange(e.target.value)}
              onFocus={() => setIsGenderFocused(true)}
              onBlur={() => setIsGenderFocused(false)}
              className="w-full rounded-md border px-3 py-2 text-sm transition-all outline-none"
              style={{
                borderColor: genderError
                  ? "#EF4444"
                  : isGenderFocused
                    ? COLORS.brand.primary
                    : COLORS.border.light,
                borderWidth: isGenderFocused ? "2px" : "1px",
                backgroundColor: "white",
                color: gender ? COLORS.text.primary : COLORS.text.muted,
                boxShadow: isGenderFocused
                  ? `0 0 0 3px ${COLORS.brand.primary}20`
                  : "none",
              }}
            >
              <option value="">선택해주세요</option>
              <option value="female">여성</option>
              <option value="male">남성</option>
              <option value="other">기타/선택 안함</option>
            </select>
            {genderError && (
              <p className="mt-1 text-xs text-[#EF4444]">{genderError}</p>
            )}
          </div>
        </div>

        {/* 쿠폰 등록 (선택사항) */}
        <div className="pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: COLORS.text.primary }}
          >
            쿠폰 등록 (선택사항)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                const newValue = e.target.value.toUpperCase();
                setCouponInput(newValue);
                // 입력값이 변경되어도 기존 검증 결과는 유지 (다른 코드 검색 시에만 초기화)
                if (newValue.trim() !== couponCode) {
                  onCouponCodeChange(null);
                }
              }}
              onFocus={() => setIsCouponFocused(true)}
              onBlur={() => setIsCouponFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCouponSearch();
                }
              }}
              placeholder="쿠폰 코드를 입력하세요"
              className="flex-1 px-4 py-2 rounded-lg border text-sm transition-all outline-none"
              style={{
                borderColor: isCouponFocused
                  ? COLORS.brand.primary
                  : COLORS.border.light,
                borderWidth: isCouponFocused ? "2px" : "1px",
                backgroundColor: "white",
                color: COLORS.text.primary,
                boxShadow: isCouponFocused
                  ? `0 0 0 3px ${COLORS.brand.primary}20`
                  : "none",
              }}
            />
            <button
              onClick={handleCouponSearch}
              disabled={!couponInput.trim() || isSearching}
              className="px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              <Search className="w-4 h-4" />
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </div>

          {verification && (
            <div className="mt-3">
              <CouponTicket
                coupon={verification.coupon}
                codeDisplay={verification.coupon?.code || "— — — —"}
                isValid={Boolean(
                  verification.coupon &&
                    (verification.isValid ||
                      verification.message?.includes("사용 횟수가 초과"))
                )}
                isUsed={Boolean(verification.isUsed)}
                isSoldOut={Boolean(
                  verification.message?.includes("사용 횟수가 초과")
                )}
                invalidMessage={verification.message}
                size="compact"
                statusMessage={
                  verification.coupon &&
                  (verification.isValid ||
                    verification.message?.includes("사용 횟수가 초과")) &&
                  !verification.isUsed &&
                  !verification.message?.includes("사용 횟수가 초과")
                    ? "적용되었습니다."
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
