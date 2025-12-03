"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/hooks/useSignUp";
import { ErrorMessage } from "../forms/ErrorMessage";
import { SubmitButton } from "../forms/SubmitButton";
import { TermsModal } from "../modals/TermsModal";
import { AIDataModal } from "../modals/AIDataModal";
import { StepProgress } from "./StepProgress";
import { LoginInfoStep } from "./steps/LoginInfoStep";
import { BasicProfileStep } from "./steps/BasicProfileStep";
import { AdditionalInfoStep } from "./steps/AdditionalInfoStep";
import { TermsStep } from "./steps/TermsStep";
import { COLORS } from "@/lib/design-system";
import { ChevronLeft } from "lucide-react";

const TOTAL_STEPS = 4;

export function SignUpView({
  initialMessage,
  initialEmail = null,
  isSocialOnboarding = false,
}: {
  initialMessage?: string | null;
  initialEmail?: string | null;
  isSocialOnboarding?: boolean;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [infoMessage] = useState<string | null>(
    initialMessage ||
      (isSocialOnboarding
        ? "카카오 간편 로그인 정보를 확인했어요. 나머지 프로필을 입력하면 가입이 완료됩니다."
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
    recordTypes: [] as string[],
  });

  // 에러 상태
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    birthYear?: string;
    gender?: string;
    terms?: string;
    recordTypes?: string;
  }>({});

  // 모달 상태
  const [modals, setModals] = useState({
    showTerms: false,
    showAI: false,
  });

  const signUpMutation = useSignUp(isSocialOnboarding);

  // 이메일 중복 에러 처리: 1단계로 이동하고 이메일 에러 표시
  useEffect(() => {
    if (signUpMutation.error) {
      const errorMessage = signUpMutation.error.message || "";
      if (
        errorMessage.includes("이미 가입된 이메일") ||
        errorMessage.includes("already registered")
      ) {
        // 1단계로 이동
        setCurrentStep(1);
        // 이메일 에러 설정
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
    value: string | boolean | string[]
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

  // 각 단계별 검증
  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};

    if (step === 1) {
      // 로그인 정보 검증
      if (!formData.email) {
        newErrors.email = "이메일을 입력해주세요.";
      } else if (!isSocialOnboarding && !validateEmail(formData.email)) {
        newErrors.email = "이메일 형식이 올바르지 않습니다.";
      }

      if (!isSocialOnboarding) {
        if (!formData.password) {
          newErrors.password = "비밀번호를 입력해주세요.";
        } else if (!validatePassword(formData.password)) {
          newErrors.password =
            "비밀번호는 영문과 숫자를 포함해 8자 이상 입력해주세요.";
        }
      }
    } else if (step === 2) {
      // 기본 프로필 검증
      if (!formData.name || formData.name.trim() === "") {
        newErrors.name = "이름을 입력해주세요.";
      }

      if (!formData.phone || formData.phone.trim() === "") {
        newErrors.phone = "전화번호를 입력해주세요.";
      } else {
        const phoneRegex = /^[0-9-]+$/;
        const cleanedPhone = formData.phone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
          newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
        }
      }
    } else if (step === 3) {
      // 맞춤형 피드백 정보 검증
      if (!formData.birthYear) {
        newErrors.birthYear = "출생년도를 입력해주세요.";
      } else {
        const birthYearNum = Number(formData.birthYear);
        const currentYear = new Date().getFullYear();
        if (
          isNaN(birthYearNum) ||
          formData.birthYear.length !== 4 ||
          birthYearNum < 1900 ||
          birthYearNum > currentYear
        ) {
          newErrors.birthYear = "올바른 출생년도(YYYY)를 입력해주세요.";
        }
      }

      if (!formData.gender) {
        newErrors.gender = "성별을 선택해주세요.";
      }

      if (formData.recordTypes.length !== 2) {
        newErrors.recordTypes = "기록 타입을 2개 선택해주세요.";
      }
    } else if (step === 4) {
      // 약관 동의 검증
      if (!formData.agreeTerms || !formData.agreeAI) {
        newErrors.terms = "필수 약관에 동의해주세요.";
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

  // 이전 단계로 이동
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // 현재 단계의 에러 초기화
      const stepErrors: (keyof typeof errors)[] = [];
      if (currentStep === 2) {
        stepErrors.push("name", "phone");
      } else if (currentStep === 3) {
        stepErrors.push("birthYear", "gender");
      } else if (currentStep === 4) {
        stepErrors.push("terms");
      }
      stepErrors.forEach((field) => clearFieldError(field));
    }
  };

  // 최종 제출
  const handleSubmit = () => {
    if (!validateStep(TOTAL_STEPS)) {
      return;
    }

    signUpMutation.mutate({
      email: isSocialOnboarding ? undefined : formData.email,
      password: isSocialOnboarding ? undefined : formData.password,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      agreeTerms: formData.agreeTerms,
      agreeAI: formData.agreeAI,
      agreeMarketing: formData.agreeMarketing,
      birthYear: formData.birthYear,
      gender: formData.gender,
      recordTypes: formData.recordTypes,
      isSocialOnboarding,
    });
  };

  // 현재 단계가 유효한지 확인
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      const emailValid = isSocialOnboarding
        ? Boolean(formData.email)
        : Boolean(formData.email && validateEmail(formData.email));
      const passwordValid = isSocialOnboarding
        ? true
        : Boolean(formData.password && validatePassword(formData.password));
      return emailValid && passwordValid;
    } else if (currentStep === 2) {
      return (
        Boolean(formData.name?.trim()) &&
        Boolean(formData.phone?.trim()) &&
        formData.phone.replace(/\s/g, "").length >= 10
      );
    } else if (currentStep === 3) {
      return (
        Boolean(formData.birthYear && formData.gender) &&
        formData.recordTypes.length === 2
      );
    } else if (currentStep === 4) {
      return formData.agreeTerms && formData.agreeAI;
    }
    return false;
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div className="w-full max-w-2xl">
        <div className="mt-8">
          <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {infoMessage && currentStep === 1 && (
            <div
              className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm shadow-sm"
              style={{ color: COLORS.text.secondary }}
            >
              {infoMessage}
            </div>
          )}

          {signUpMutation.error &&
            !(
              signUpMutation.error.message.includes("이미 가입된 이메일") ||
              signUpMutation.error.message.includes("already registered")
            ) && (
              <div className="mb-6">
                <ErrorMessage
                  message={
                    signUpMutation.error?.message ||
                    "요청 처리 중 오류가 발생했습니다."
                  }
                />
              </div>
            )}

          {/* 단계별 컨텐츠 */}
          <div className="mb-6 relative" style={{ minHeight: "300px" }}>
            <div
              key={currentStep}
              style={{
                animation: "fadeInSlide 0.3s ease-in-out",
              }}
            >
              {currentStep === 1 && (
                <LoginInfoStep
                  email={formData.email}
                  password={formData.password}
                  emailError={errors.email}
                  passwordError={errors.password}
                  isSocialMode={isSocialOnboarding}
                  onEmailChange={(value) => {
                    updateFormData("email", value);
                    clearFieldError("email");
                  }}
                  onPasswordChange={(value) => {
                    updateFormData("password", value);
                    clearFieldError("password");
                  }}
                  onClearError={clearFieldError}
                />
              )}

              {currentStep === 2 && (
                <BasicProfileStep
                  name={formData.name}
                  phone={formData.phone}
                  nameError={errors.name}
                  phoneError={errors.phone}
                  onNameChange={(value) => {
                    updateFormData("name", value);
                    clearFieldError("name");
                  }}
                  onPhoneChange={(value) => {
                    updateFormData("phone", value);
                    clearFieldError("phone");
                  }}
                  onClearError={clearFieldError}
                />
              )}

              {currentStep === 3 && (
                <AdditionalInfoStep
                  birthYear={formData.birthYear}
                  gender={formData.gender}
                  recordTypes={formData.recordTypes as any}
                  birthYearError={errors.birthYear}
                  genderError={errors.gender}
                  onBirthYearChange={(value) => {
                    updateFormData("birthYear", value);
                    clearFieldError("birthYear");
                  }}
                  onGenderChange={(value) => {
                    updateFormData("gender", value);
                    clearFieldError("gender");
                  }}
                  onRecordTypeToggle={(type) => {
                    const currentTypes = formData.recordTypes;
                    const isSelected = currentTypes.includes(type);

                    if (isSelected) {
                      // 선택 해제
                      updateFormData(
                        "recordTypes",
                        currentTypes.filter((t) => t !== type)
                      );
                    } else {
                      // 선택 추가 (최대 2개)
                      if (currentTypes.length < 2) {
                        updateFormData("recordTypes", [...currentTypes, type]);
                      }
                    }
                  }}
                />
              )}

              {currentStep === 4 && (
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
                    if (nextState) {
                      clearFieldError("terms");
                    }
                  }}
                  onShowTerms={() =>
                    setModals((prev) => ({ ...prev, showTerms: true }))
                  }
                  onShowAI={() =>
                    setModals((prev) => ({ ...prev, showAI: true }))
                  }
                />
              )}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:opacity-80 flex-shrink-0"
                style={{
                  color: COLORS.text.secondary,
                  backgroundColor: COLORS.background.card,
                  border: `1.5px solid ${COLORS.border.light}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  minWidth: "100px",
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">이전</span>
              </button>
            )}

            <SubmitButton
              isLoading={signUpMutation.isPending}
              isValid={isCurrentStepValid()}
              loadingText={
                currentStep === TOTAL_STEPS
                  ? isSocialOnboarding
                    ? "정보 저장 중..."
                    : "가입 중..."
                  : "다음 단계로..."
              }
              defaultText={
                currentStep === TOTAL_STEPS
                  ? isSocialOnboarding
                    ? "정보 제출"
                    : "가입하고 시작하기"
                  : "다음"
              }
              onClick={handleNext}
            />
          </div>

          {currentStep === 1 && (
            <div
              className="mt-6 rounded-2xl border py-3 text-center text-sm"
              style={{
                borderColor: COLORS.border.light,
                backgroundColor: "rgba(255,255,255,0.8)",
                color: COLORS.text.tertiary,
              }}
            >
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                className="font-semibold underline-offset-4 hover:underline"
                style={{ color: COLORS.brand.primary }}
                onClick={() => router.push("/login")}
              >
                로그인하기
              </button>
            </div>
          )}
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
