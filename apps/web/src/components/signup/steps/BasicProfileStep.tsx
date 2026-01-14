"use client";

import { useState, useEffect } from "react";
import { NameField } from "@/components/forms/NameField";
import { PhoneField } from "@/components/forms/PhoneField";
import { PaperCard } from "../PaperCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
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
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(0); // 5분 = 300초
  const [generatedCode, setGeneratedCode] = useState<string>("");

  // 전화번호가 11자리인지 확인 (하이픈 제거 후)
  const normalizedPhone = phone.replace(/[\s-]/g, "");
  const isPhoneComplete = normalizedPhone.length === 11;

  // 개발 모드 확인
  const isDevelopment = process.env.NODE_ENV === "development";

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

  // 타이머 포맷팅 (MM:SS)
  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 인증번호 전송
  const handleSendCode = async () => {
    if (!isPhoneComplete) {
      return;
    }

    setIsSending(true);
    setCodeError(undefined);
    onClearError("phone");

    try {
      // 개발 모드: 자동으로 인증번호 생성
      if (isDevelopment) {
        const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(autoCode);
        setIsCodeSent(true);
        setTimer(10); // 테스트용: 10초
        console.log("📱 [개발 모드] 인증번호:", autoCode);
        setIsSending(false);
        return;
      }

      // 프로덕션 모드: API 호출
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
      setTimer(3); // 테스트용: 3초 (프로덕션에서는 300초로 변경)

      // 개발 환경에서 인증번호가 반환된 경우
      if (data.code) {
        setGeneratedCode(data.code);
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

    // 타이머 만료 체크: 5분이 지나면 인증 불가능
    if (timer === 0) {
      setCodeError("인증번호가 만료되었습니다. 다시 받아주세요.");
      return;
    }

    setIsVerifying(true);
    setCodeError(undefined);
    onClearError("code");

    try {
      // 개발 모드에서는 생성된 코드와 비교
      if (isDevelopment && generatedCode) {
        if (code === generatedCode) {
          // 인증 완료
          onVerificationComplete();
          setTimer(0);
        } else {
          setCodeError("인증번호가 일치하지 않습니다.");
        }
        setIsVerifying(false);
        return;
      }

      // 프로덕션 모드: API 호출
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
      setTimer(0);
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

  const codeValid = code.length === 6;

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
                setGeneratedCode("");
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
                disabled={!isPhoneComplete || isSending}
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
                  
                  {/* 카카오톡 메시지 안내 - 미니멀 디자인 */}
                  <p
                    className="mt-2 text-xs"
                    style={{
                      color: COLORS.text.tertiary,
                      animation: "fadeInSlideUp 0.2s ease-out",
                    }}
                  >
                    인증번호는 <span style={{ color: COLORS.brand.primary, fontWeight: 600 }}>카카오톡 메시지</span>에서 확인하실 수 있습니다.
                  </p>
                </div>

                {/* 타이머 및 개발 모드 표시 */}
                <div 
                  className="flex items-center justify-between text-sm"
                  style={{
                    animation: "fadeInSlideUp 0.3s ease-out",
                    color: COLORS.text.secondary,
                  }}
                >
                  <div>
                    {timer > 0 ? (
                      <span>유효시간 {formatTimer(timer)}</span>
                    ) : null}
                  </div>
                  {isDevelopment && generatedCode && timer > 0 && (
                    <div 
                      className="text-xs font-mono"
                      style={{ 
                        color: COLORS.text.tertiary,
                        opacity: 0.6,
                      }}
                    >
                      {generatedCode}
                    </div>
                  )}
                </div>

                {/* 만료 경고 및 재전송 UI */}
                {timer === 0 ? (
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
                        setGeneratedCode("");
                        handleSendCode();
                      }}
                      className="w-full"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: "white",
                      }}
                    >
                      인증번호 다시 받기
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 인증하기 버튼 */}
                    <Button
                      onClick={handleVerifyCode}
                      disabled={!codeValid || isVerifying}
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
