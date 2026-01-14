"use client";

import { useState, useEffect } from "react";
import { PhoneField } from "@/components/forms/PhoneField";
import { PaperCard } from "../PaperCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneVerificationStepProps {
  phone: string;
  phoneError?: string;
  onPhoneChange: (value: string) => void;
  onVerificationComplete: () => void;
  onClearError: (field: "phone" | "code") => void;
}

export function PhoneVerificationStep({
  phone,
  phoneError,
  onPhoneChange,
  onVerificationComplete,
  onClearError,
}: PhoneVerificationStepProps) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // 재전송 카운트다운
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (!phone || phone.replace(/[\s-]/g, "").length < 10) {
      return;
    }

    setIsSending(true);
    setCodeError(undefined);
    onClearError("phone");

    try {
      const response = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증번호 전송에 실패했습니다.");
      }

      setIsCodeSent(true);
      setResendCountdown(60); // 60초 후 재전송 가능

      // 개발 환경에서 인증번호가 반환된 경우 콘솔에 출력
      if (data.code) {
        console.log("📱 인증번호:", data.code);
      }
    } catch (error) {
      setCodeError(
        error instanceof Error
          ? error.message
          : "인증번호 전송에 실패했습니다."
      );
    } finally {
      setIsSending(false);
    }
  };

  // 인증번호 검증
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setCodeError("인증번호 6자리를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    setCodeError(undefined);
    onClearError("code");

    try {
      const response = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증번호가 일치하지 않습니다.");
      }

      // 인증 완료
      onVerificationComplete();
    } catch (error) {
      setCodeError(
        error instanceof Error
          ? error.message
          : "인증번호가 일치하지 않습니다."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const phoneValid = phone.replace(/[\s-]/g, "").length >= 10;
  const codeValid = code.length === 6;

  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          핸드폰 인증
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          카카오톡 인증을 위해 핸드폰 번호를 인증해주세요.
        </p>
      </div>

      <div className="space-y-5">
        {/* 전화번호 입력 */}
        <div>
          <PhoneField
            value={phone}
            onChange={(value) => {
              onPhoneChange(value);
              onClearError("phone");
              if (isCodeSent) {
                setIsCodeSent(false);
                setCode("");
              }
            }}
            error={phoneError}
            disabled={isCodeSent}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>

        {/* 인증번호 전송 버튼 */}
        {!isCodeSent && (
          <Button
            onClick={handleSendCode}
            disabled={!phoneValid || isSending}
            className="w-full"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: "white",
            }}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                전송 중...
              </>
            ) : (
              "인증번호 전송"
            )}
          </Button>
        )}

        {/* 인증번호 입력 */}
        {isCodeSent && (
          <div className="space-y-4">
            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: COLORS.text.primary }}
              >
                인증번호
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setCode(value);
                  setCodeError(undefined);
                  onClearError("code");
                }}
                placeholder="6자리 인증번호를 입력하세요"
                className={cn(
                  "text-center text-lg tracking-widest",
                  codeError && "border-red-500"
                )}
                maxLength={6}
                disabled={isVerifying}
              />
              {codeError && (
                <p className="mt-1 text-xs text-red-500">{codeError}</p>
              )}
            </div>

            {/* 인증번호 검증 버튼 */}
            <Button
              onClick={handleVerifyCode}
              disabled={!codeValid || isVerifying}
              className="w-full"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: "white",
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  인증 중...
                </>
              ) : (
                "인증하기"
              )}
            </Button>

            {/* 재전송 버튼 */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendCountdown > 0 || isSending}
                className={cn(
                  "text-sm underline-offset-4 hover:underline",
                  resendCountdown > 0 && "opacity-50 cursor-not-allowed"
                )}
                style={{ color: COLORS.brand.primary }}
              >
                {resendCountdown > 0
                  ? `${resendCountdown}초 후 재전송 가능`
                  : "인증번호 다시 받기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PaperCard>
  );
}
