"use client";

import { useState, useEffect } from "react";
import { NameField } from "@/components/forms/NameField";
import { PhoneField } from "@/components/forms/PhoneField";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicProfileStepProps {
  name: string;
  phone: string;
  nameError?: string;
  phoneError?: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onClearError: (field: "name" | "phone" | "code") => void;
  onVerificationComplete: () => void;
  isPhoneVerified?: boolean;
}

export function BasicProfileStep({
  name,
  phone,
  nameError,
  phoneError,
  onNameChange,
  onPhoneChange,
  onClearError,
  onVerificationComplete,
  isPhoneVerified = false,
}: BasicProfileStepProps) {
  const MAX_ATTEMPTS = 5;
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(0); // 5분 = 300초
  const [isAttemptExceeded, setIsAttemptExceeded] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  const getAttemptStateFromMessage = (message?: string) => {
    if (!message) {
      return { shouldForceResend: false, remainingAttempts: undefined };
    }
    const remainingMatch = message.match(/(\d+)회 남음/);
    const remainingAttempts = remainingMatch
      ? Number(remainingMatch[1])
      : undefined;
    const shouldForceResend =
      message.includes("인증 시도 횟수를 초과했습니다.") ||
      remainingAttempts === 0;
    return { shouldForceResend, remainingAttempts };
  };

  const getRemainingSecondsFromMessage = (message?: string) => {
    if (!message) {
      return undefined;
    }
    const match = message.match(/(\d+)\s*초\s*후\s*가능/);
    return match ? Number(match[1]) : undefined;
  };

  // 전화번호가 11자리인지 확인 (하이픈 제거 후)
  const normalizedPhone = phone.replace(/[\s-]/g, "");
  const isPhoneComplete = normalizedPhone.length === 11;

  // 전화번호가 완성되면 인증번호 입력 UI 표시
  const showVerificationUI = isPhoneComplete && !isPhoneVerified;

  // 타이머 카운트다운
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  useEffect(() => {
    const { shouldForceResend, remainingAttempts } =
      getAttemptStateFromMessage(codeError);
    if (shouldForceResend) {
      setIsAttemptExceeded(true);
    } else if (typeof remainingAttempts === "number") {
      setIsAttemptExceeded(false);
    }
  }, [codeError]);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (!isPhoneComplete) {
      return;
    }

    setIsSending(true);
    setCodeError(undefined);
    setIsAttemptExceeded(false);
    setResendCooldown(0);
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
      setTimer(300);
      setAttemptsLeft(MAX_ATTEMPTS);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "인증번호 전송에 실패했습니다.";
      setCodeError(message);
      const remainingSeconds = getRemainingSecondsFromMessage(message);
      if (typeof remainingSeconds === "number") {
        setResendCooldown(remainingSeconds);
      }
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

    // 타이머 만료 체크: 5분이 지나면 인증 불가능
    if (timer === 0) {
      setCodeError("인증번호가 만료되었습니다. 다시 받아주세요.");
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
        const message = data.error || "인증번호가 일치하지 않습니다.";
        const { shouldForceResend, remainingAttempts } =
          getAttemptStateFromMessage(message);

        if (typeof remainingAttempts === "number") {
          setAttemptsLeft(remainingAttempts);
        } else if (
          /만료/.test(message) ||
          /존재하지\s*않습니다/.test(message)
        ) {
          setAttemptsLeft((prev) => Math.max(prev - 1, 0));
        }

        if (shouldForceResend || remainingAttempts === 0) {
          setIsAttemptExceeded(true);
        } else if (typeof remainingAttempts === "number") {
          setIsAttemptExceeded(false);
        }
        throw new Error(message);
      }

      // 인증 완료
      onVerificationComplete();
      setTimer(0);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "인증번호가 일치하지 않습니다.";
      const { shouldForceResend, remainingAttempts } =
        getAttemptStateFromMessage(message);

      if (typeof remainingAttempts === "number") {
        setAttemptsLeft(remainingAttempts);
        setCodeError(message);
      } else if (/만료/.test(message) || /존재하지\s*않습니다/.test(message)) {
        setAttemptsLeft((prev) => Math.max(prev - 1, 0));
        const nextRemaining = Math.max(attemptsLeft - 1, 0);
        setCodeError(
          `인증번호가 일치하지 않습니다. (${nextRemaining}회 남음)`
        );
      } else {
        setCodeError(message);
      }

      if (shouldForceResend || remainingAttempts === 0 || attemptsLeft === 0) {
        setIsAttemptExceeded(true);
      } else if (typeof remainingAttempts === "number") {
        setIsAttemptExceeded(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const codeValid = code.length === 6;
  const { shouldForceResend } = getAttemptStateFromMessage(codeError);
  const showResendOnly =
    isAttemptExceeded || shouldForceResend || attemptsLeft === 0;

  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          기본 프로필
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          계정 복구와 이메일 찾기에 활용돼요.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <NameField
            value={name}
            onChange={(value) => {
              onNameChange(value);
              onClearError("name");
            }}
            placeholder="이름을 입력하세요"
            error={nameError}
          />
        </div>

        <div>
          <PhoneField
            value={phone}
            onChange={(value) => {
              onPhoneChange(value);
              onClearError("phone");
              // 전화번호가 변경되면 인증 상태 초기화
              if (isCodeSent) {
                setIsCodeSent(false);
                setCode("");
                setTimer(0);
                setAttemptsLeft(MAX_ATTEMPTS);
              }
            }}
            error={phoneError}
            disabled={isPhoneVerified}
          />
        </div>

        {/* 인증번호 입력 UI (전화번호 완성 시 표시) */}
        {showVerificationUI && (
          <div 
            className="space-y-4 pt-4 border-t"
            style={{ 
              borderColor: COLORS.border.light,
              animation: "fadeInSlideDown 0.3s ease-out",
            }}
          >
            {/* 인증번호 전송 버튼 (전송 전) */}
            {!isCodeSent && (
              <Button
                onClick={handleSendCode}
                disabled={!isPhoneComplete || isSending || resendCooldown > 0}
                className="w-full"
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: "white",
                  animation: "fadeInSlideUp 0.3s ease-out",
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
            {!isCodeSent && resendCooldown > 0 && (
              <p className="mt-2 text-xs" style={{ color: COLORS.text.tertiary }}>
                {resendCooldown}초 후 다시 요청할 수 있어요.
              </p>
            )}

            {/* 인증번호 입력 필드 (전송 후) */}
            {isCodeSent && (
              <div 
                className="space-y-4"
                style={{
                  animation: "fadeInSlideDown 0.3s ease-out",
                }}
              >
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
                    style={{
                      animation: "fadeInSlideUp 0.2s ease-out",
                    }}
                    maxLength={6}
                    disabled={isVerifying || timer === 0}
                  />
                  {codeError && (
                    <p 
                      className="mt-1 text-xs text-red-500"
                      style={{
                        animation: "fadeInSlideUp 0.2s ease-out",
                      }}
                    >
                      {codeError}
                    </p>
                  )}
                  
                  {/* 문자 메시지 안내 - 미니멀 디자인 */}
                  <p
                    className="mt-2 text-xs"
                    style={{
                      color: COLORS.text.tertiary,
                      animation: "fadeInSlideUp 0.2s ease-out",
                    }}
                  >
                    인증번호는{" "}
                    <span style={{ color: COLORS.brand.primary, fontWeight: 600 }}>
                      카카오톡 메시지
                    </span>
                    에서 확인이 가능합니다.
                  </p>
                </div>

                {/* 타이머 표시 */}
                {/* 만료 경고 및 재전송 UI */}
                {showResendOnly ? (
                  <>
                    <Button
                      onClick={() => {
                        setCode("");
                        setCodeError(undefined);
                        setIsAttemptExceeded(false);
                        handleSendCode();
                      }}
                      disabled={isSending || resendCooldown > 0}
                      className="w-full"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: "white",
                      }}
                    >
                      인증번호 다시 받기
                    </Button>
                    {resendCooldown > 0 && (
                      <p
                        className="mt-2 text-xs text-center"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {resendCooldown}초 후 다시 받을 수 있어요.
                      </p>
                    )}
                  </>
                ) : timer === 0 ? (
                  <div
                    className="space-y-3 p-4 rounded-lg"
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      animation: "fadeInSlideUp 0.3s ease-out",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: "#EF4444",
                          color: "white",
                        }}
                      >
                        ⚠
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: "#DC2626" }}
                        >
                          인증번호가 만료되었습니다
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "#991B1B" }}
                        >
                          새로운 인증번호를 받아주세요.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setIsCodeSent(false);
                        setCode("");
                        handleSendCode();
                      }}
                      disabled={isSending || resendCooldown > 0}
                      className="w-full"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: "white",
                      }}
                    >
                      인증번호 다시 받기
                    </Button>
                    {resendCooldown > 0 && (
                      <p
                        className="text-xs text-center"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {resendCooldown}초 후 다시 받을 수 있어요.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 인증하기 버튼 */}
                    <Button
                      onClick={handleVerifyCode}
                      disabled={!codeValid || isVerifying || resendCooldown > 0}
                      className="w-full"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: "white",
                        animation: "fadeInSlideUp 0.3s ease-out",
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
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 인증 완료 메시지 */}
        {isPhoneVerified && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.brand.primary + "10",
              color: COLORS.brand.primary,
            }}
          >
            ✓ 핸드폰 인증이 완료되었습니다.
          </div>
        )}
      </div>
    </PaperCard>
  );
}
