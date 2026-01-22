"use client";

import { useState, useEffect } from "react";
import { PhoneField } from "@/components/forms/PhoneField";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
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
  const [isAttemptExceeded, setIsAttemptExceeded] = useState(false);
  const [verifyErrorResponse, setVerifyErrorResponse] = useState<unknown>();

  const getAttemptStateFromMessage = (message?: string) => {
    if (!message) {
      return { shouldForceResend: false, remainingAttempts: undefined };
    }
    const normalizedMessage = message.replace(/[\s.]/g, "");
    const remainingMatch = message.match(/(\d+)회 남음/);
    const remainingAttempts = remainingMatch
      ? Number(remainingMatch[1])
      : undefined;
    const isExpiredMessage =
      /만료/.test(message) ||
      /존재하지\s*않습니다/.test(message) ||
      normalizedMessage.includes("만료되었거나 존재하지 않습니다");
    const shouldForceResend =
      message.includes("인증 시도 횟수를 초과했습니다.") ||
      remainingAttempts === 0 ||
      isExpiredMessage;
    return { shouldForceResend, remainingAttempts };
  };

  const formatErrorResponse = (value: unknown): string => {
    if (typeof value === "string") {
      return value;
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  useEffect(() => {
    const { shouldForceResend, remainingAttempts } =
      getAttemptStateFromMessage(codeError);
    if (shouldForceResend) {
      setIsAttemptExceeded(true);
    } else if (typeof remainingAttempts === "number") {
      setIsAttemptExceeded(false);
    }
  }, [codeError]);

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
      setResendCountdown(300); // 5분 후 재전송 가능
      setIsAttemptExceeded(false);

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
    setVerifyErrorResponse(undefined);
    onClearError("code");

    try {
      const response = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : typeof data?.message === "string"
              ? data.message
              : "인증번호가 일치하지 않습니다.";
        const { shouldForceResend, remainingAttempts } =
          getAttemptStateFromMessage(message);
        if (shouldForceResend) {
          setIsAttemptExceeded(true);
        } else if (typeof remainingAttempts === "number") {
          setIsAttemptExceeded(false);
        }
        setCodeError(message);
        setVerifyErrorResponse(data);
        return;
      }

      // 인증 완료
      onVerificationComplete();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "인증번호가 일치하지 않습니다.";
      setCodeError(message);
      setVerifyErrorResponse(
        error instanceof Error ? { message: error.message } : error
      );
      const { shouldForceResend, remainingAttempts } =
        getAttemptStateFromMessage(message);
      if (shouldForceResend) {
        setIsAttemptExceeded(true);
      } else if (typeof remainingAttempts === "number") {
        setIsAttemptExceeded(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const phoneValid = phone.replace(/[\s-]/g, "").length >= 10;
  const codeValid = code.length === 6;
  const { shouldForceResend } = getAttemptStateFromMessage(codeError);
  const showResendOnly = isAttemptExceeded || shouldForceResend;

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
              if (isAttemptExceeded) {
                setIsAttemptExceeded(false);
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
              {process.env.NODE_ENV !== "production" &&
                Boolean(verifyErrorResponse) && (
                  <p
                    className="mt-1 text-xs whitespace-pre-wrap"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    {formatErrorResponse(verifyErrorResponse)}
                  </p>
                )}
            </div>

            {/* 인증번호 검증 버튼 */}
            <Button
              onClick={showResendOnly ? handleSendCode : handleVerifyCode}
              disabled={
                showResendOnly
                  ? isSending
                  : !codeValid || isVerifying
              }
              className="w-full"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: "white",
              }}
            >
              {showResendOnly ? (
                isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    재요청 중...
                  </>
                ) : (
                  "인증번호 다시 요청"
                )
              ) : isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  인증 중...
                </>
              ) : (
                "인증하기"
              )}
            </Button>

            {/* 재전송 버튼 */}
            {!showResendOnly && (
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
            )}
          </div>
        )}
      </div>
    </PaperCard>
  );
}
