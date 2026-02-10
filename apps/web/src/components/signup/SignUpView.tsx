"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginPath } from "@/lib/navigation";
import { useSignUp } from "@/hooks/useSignUp";
import { ErrorMessage } from "../forms/ErrorMessage";
import { SubmitButton } from "../forms/SubmitButton";
import { TermsModal } from "../modals/TermsModal";
import { AIDataModal } from "../modals/AIDataModal";
import { LoginInfoStep } from "./steps/LoginInfoStep";
import { DisplayNameStep } from "./steps/DisplayNameStep";
import { TermsStep } from "./steps/TermsStep";
import { COLORS } from "@/lib/design-system";
import { ChevronLeft } from "lucide-react";

const TOTAL_STEPS = 2;

export function SignUpView({
  initialMessage = null,
  initialEmail = null,
  isSocialOnboarding = false,
}: {
  initialMessage?: string | null;
  initialEmail?: string | null;
  isSocialOnboarding?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [infoMessage] = useState<string | null>(
    initialMessage ??
      (isSocialOnboarding
        ? "소셜 로그인(카카오/애플) 정보를 확인했어요. 약관 동의 후 닉네임을 입력하면 가입이 완료됩니다."
        : null)
  );

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    email: initialEmail || "",
    password: "",
    name: "",
    phone: "",
    agreeTerms: false,
    agreeAI: false,
    agreeMarketing: false,
    birthYear: "",
    gender: "",
  });

  // 에러 상태
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    terms?: string;
  }>({});

  // 모달 상태
  const [modals, setModals] = useState({
    showTerms: false,
    showAI: false,
  });

  const signUpMutation = useSignUp();

  // 이메일 중복 확인 (이메일 가입 시에만 사용)
  const [emailCheckStatus, setEmailCheckStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const handleCheckEmail = async () => {
    const email = formData.email?.trim();
    if (!email || !validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "이메일 형식을 확인해주세요." }));
      return;
    }
    setEmailCheckStatus("checking");
    clearFieldError("email");
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailCheckStatus("idle");
        setErrors((prev) => ({ ...prev, email: data.error || "확인에 실패했습니다." }));
        return;
      }
      setEmailCheckStatus(data.available ? "available" : "taken");
      if (!data.available) {
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
      }
    } catch {
      setEmailCheckStatus("idle");
      setErrors((prev) => ({ ...prev, email: "확인에 실패했습니다." }));
    }
  };

  // 이메일 변경 시 중복 확인 상태 초기화
  useEffect(() => {
    if (emailCheckStatus !== "idle") setEmailCheckStatus("idle");
    // formData.email만 의존: 이메일 필드 변경 시에만 리셋
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email]);

  // 이메일 중복 에러 처리: 1단계로 이동하고 이메일 에러 표시
  useEffect(() => {
    if (signUpMutation.error) {
      const errorMessage = signUpMutation.error.message || "";
      if (
        errorMessage.includes("이미 가입된 이메일") ||
        errorMessage.includes("already registered")
      ) {
        // 1단계로 이동
        setCurrentStep(2); // 이메일 입력은 2단계
        setErrors((prev) => ({
          ...prev,
          email: "이미 가입된 이메일입니다.",
        }));
      }
    }
  }, [signUpMutation.error]);

  // 폼 데이터 업데이트 헬퍼
  const updateFormData = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // 검증 함수들
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  };

  // 각 단계별 검증 (1=서비스 이용 동의, 2=닉네임 또는 이메일/비밀번호/닉네임)
  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};

    if (step === 1) {
      if (!formData.agreeTerms || !formData.agreeAI) {
        newErrors.terms = "필수 약관에 동의해주세요.";
      }
    } else if (step === 2) {
      if (isSocialOnboarding) {
        if (!formData.name || formData.name.trim() === "") {
          newErrors.name = "닉네임을 입력해주세요.";
        }
      } else {
        if (!formData.email) {
          newErrors.email = "이메일을 입력해주세요.";
        } else if (!validateEmail(formData.email)) {
          newErrors.email = "이메일 형식이 올바르지 않습니다.";
        }
        if (!formData.password) {
          newErrors.password = "비밀번호를 입력해주세요.";
        } else if (!validatePassword(formData.password)) {
          newErrors.password =
            "비밀번호는 영문과 숫자를 포함해 8자 이상 입력해주세요.";
        }
        if (!formData.name || formData.name.trim() === "") {
          newErrors.name = "닉네임을 입력해주세요.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // 이전 단계로 이동 (2단계 → 1단계 시 약관 에러 초기화)
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      clearFieldError("terms");
      clearFieldError("name");
      clearFieldError("email");
      clearFieldError("password");
    }
  };

  // 최종 제출
  const handleSubmit = () => {
    if (!validateStep(TOTAL_STEPS)) {
      return;
    }

    signUpMutation.mutate({
      email: formData.email || undefined,
      password: isSocialOnboarding ? undefined : formData.password,
      name: formData.name.trim(),
      agreeTerms: formData.agreeTerms,
      agreeAI: formData.agreeAI,
      agreeMarketing: formData.agreeMarketing,
      isSocialOnboarding,
      ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
      ...(formData.birthYear?.trim() && { birthYear: formData.birthYear }),
      ...(formData.gender?.trim() && { gender: formData.gender }),
    });
  };


  // 현재 단계가 유효한지 확인 (1=약관, 2=닉네임 또는 이메일/비밀번호/닉네임)
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return formData.agreeTerms && formData.agreeAI;
    }
    if (currentStep === 2) {
      if (isSocialOnboarding) {
        return Boolean(formData.name?.trim());
      }
      return (
        Boolean(formData.email && validateEmail(formData.email)) &&
        Boolean(formData.password && validatePassword(formData.password)) &&
        Boolean(formData.name?.trim())
      );
    }
    return false;
  };

  return (
    <div
      className="flex min-h-screen flex-col px-4 pt-6 pb-8 sm:pt-8"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col">
        {/* 상단: 뒤로가기 (2단계일 때만) */}
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="mb-6 flex items-center gap-1.5 self-start rounded-lg py-2 pr-2 transition-opacity hover:opacity-70"
            style={{ color: COLORS.text.secondary }}
            aria-label="이전"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="text-sm font-medium">이전</span>
          </button>
        )}

        {/* 본문: 제목+내용은 각 스텝 컴포넌트에서 렌더 */}
        <div
          className="flex-1"
          key={currentStep}
          style={{ animation: "fadeInSlide 0.3s ease-in-out" }}
        >
          {/* 1단계: 서비스 이용 동의 */}
          {currentStep === 1 && (
            <TermsStep
              agreeTerms={formData.agreeTerms}
              agreeAI={formData.agreeAI}
              agreeMarketing={formData.agreeMarketing}
              termsError={errors.terms}
              onTermsChange={(checked) => {
                updateFormData("agreeTerms", checked);
                clearFieldError("terms");
              }}
              onAIChange={(checked) => {
                updateFormData("agreeAI", checked);
                clearFieldError("terms");
              }}
              onMarketingChange={(checked) => {
                updateFormData("agreeMarketing", checked);
              }}
              onAgreeAll={(nextState) => {
                updateFormData("agreeTerms", nextState);
                updateFormData("agreeAI", nextState);
                updateFormData("agreeMarketing", nextState);
                if (nextState) clearFieldError("terms");
              }}
              onShowTerms={() =>
                setModals((prev) => ({ ...prev, showTerms: true }))
              }
              onShowAI={() =>
                setModals((prev) => ({ ...prev, showAI: true }))
              }
            />
          )}

          {/* 2단계: 닉네임(소셜) 또는 이메일/비밀번호/닉네임(이메일 가입) */}
          {currentStep === 2 &&
            (isSocialOnboarding ? (
              <DisplayNameStep
                name={formData.name}
                nameError={errors.name}
                infoMessage={infoMessage}
                onNameChange={(value) => {
                  updateFormData("name", value);
                  clearFieldError("name");
                }}
                onClearError={clearFieldError}
              />
            ) : (
              <LoginInfoStep
                email={formData.email}
                password={formData.password}
                name={formData.name}
                emailError={errors.email}
                passwordError={errors.password}
                nameError={errors.name}
                isSocialMode={false}
                emailCheckStatus={emailCheckStatus}
                onCheckEmail={handleCheckEmail}
                onEmailChange={(value) => {
                  updateFormData("email", value);
                  clearFieldError("email");
                }}
                onPasswordChange={(value) => {
                  updateFormData("password", value);
                  clearFieldError("password");
                }}
                onNameChange={(value) => {
                  updateFormData("name", value);
                  clearFieldError("name");
                }}
                onClearError={clearFieldError}
              />
            ))}

          {signUpMutation.error &&
            !(
              signUpMutation.error.message.includes("이미 가입된 이메일") ||
              signUpMutation.error.message.includes("already registered")
            ) && (
              <div className="mt-4">
                <ErrorMessage
                  message={
                    signUpMutation.error?.message ||
                    "요청 처리 중 오류가 발생했습니다."
                  }
                />
              </div>
            )}
        </div>

        {/* 하단: 풀 너비 확인 버튼 */}
        <div
          className="mt-8 flex flex-col gap-4"
          style={{ paddingBottom: 24 }}
        >
          <SubmitButton
            isLoading={signUpMutation.isPending}
            isValid={isCurrentStepValid()}
            loadingText={
              currentStep === TOTAL_STEPS
                ? isSocialOnboarding
                  ? "저장 중..."
                  : "가입 중..."
                : "다음"
            }
            defaultText={
              currentStep === TOTAL_STEPS
                ? isSocialOnboarding
                  ? "확인"
                  : "가입하고 시작하기"
                : "확인"
            }
            onClick={handleNext}
            className="w-full py-3.5 text-base"
          />

          <p
            className="text-center text-sm"
            style={{ color: COLORS.text.tertiary }}
          >
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: COLORS.brand.primary }}
              onClick={() => router.push(getLoginPath(searchParams))}
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>

      <TermsModal
        isOpen={modals.showTerms}
        onClose={() => setModals((prev) => ({ ...prev, showTerms: false }))}
      />

      <AIDataModal
        isOpen={modals.showAI}
        onClose={() => setModals((prev) => ({ ...prev, showAI: false }))}
      />
    </div>
  );
}
