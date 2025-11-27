"use client";

import { useState, ReactNode } from "react";
import { useSignUp } from "@/hooks/useSignUp";
import { AuthHeader } from "../forms/AuthHeader";
import { EmailField } from "../forms/EmailField";
import { PasswordField } from "../forms/PasswordField";
import { NameField } from "../forms/NameField";
import { PhoneField } from "../forms/PhoneField";
import { TermsAgreement } from "../forms/TermsAgreement";
import { ErrorMessage } from "../forms/ErrorMessage";
import { SubmitButton } from "../forms/SubmitButton";
import { TermsModal } from "../modals/TermsModal";
import { AIDataModal } from "../modals/AIDataModal";
import { Input } from "../ui/Input";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <section className="rounded-2xl border border-[#EFE9E3] bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
    <div className="mb-4">
      <h3 className="text-base font-semibold text-[#333333]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[#6B7A6F]">{description}</p>
      )}
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

type BasicInfoSectionProps = {
  formData: {
    email: string;
    password: string;
  };
  errors: {
    email?: string;
    password?: string;
  };
  updateFormData: (field: "email" | "password", value: string) => void;
  clearError: (field: "email" | "password") => void;
};

const BasicInfoSection = ({
  formData,
  errors,
  updateFormData,
  clearError,
}: BasicInfoSectionProps) => (
  <SectionCard
    title="로그인 정보"
    description="서비스 이용을 위한 기본 로그인 정보를 입력해주세요."
  >
    <EmailField
      value={formData.email}
      onChange={(value) => {
        updateFormData("email", value);
        clearError("email");
      }}
      placeholder="example@gmail.com"
      error={errors.email}
    />

    <PasswordField
      value={formData.password}
      onChange={(value) => {
        updateFormData("password", value);
        clearError("password");
      }}
      placeholder="영문+숫자 8자 이상 입력"
      error={errors.password}
    />
  </SectionCard>
);

type ProfileSectionProps = {
  formData: {
    name: string;
    phone: string;
  };
  errors: {
    name?: string;
    phone?: string;
  };
  updateField: (field: "name" | "phone", value: string) => void;
  clearError: (field: "name" | "phone") => void;
};

const ProfileSection = ({
  formData,
  errors,
  updateField,
  clearError,
}: ProfileSectionProps) => (
  <SectionCard
    title="기본 프로필"
    description="계정 복구와 이메일 찾기에 활용돼요."
  >
    <div>
      <NameField
        value={formData.name}
        onChange={(value) => {
          updateField("name", value);
          clearError("name");
        }}
        placeholder="이름을 입력하세요"
        error={errors.name}
      />
      <p className="mt-1 text-xs text-[#6B7A6F]">이메일 찾기에 사용됩니다.</p>
    </div>

    <div>
      <PhoneField
        value={formData.phone}
        onChange={(value) => {
          updateField("phone", value);
          clearError("phone");
        }}
        error={errors.phone}
      />
      <p className="mt-1 text-xs text-[#6B7A6F]">
        빠른 연락과 계정 보호를 위해 필요해요.
      </p>
    </div>
  </SectionCard>
);

type AdditionalInfoSectionProps = {
  birthYear: string;
  gender: string;
  errors: { birthYear?: string; gender?: string };
  onBirthYearChange: (value: string) => void;
  onGenderChange: (value: string) => void;
};

const AdditionalInfoSection = ({
  birthYear,
  gender,
  errors,
  onBirthYearChange,
  onGenderChange,
}: AdditionalInfoSectionProps) => (
  <SectionCard
    title="맞춤형 피드백 정보"
    description="더 정교한 피드백을 위해 선택 정보를 입력해주세요."
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#333333]"
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
            const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
            onBirthYearChange(cleaned);
          }}
          placeholder="예) 1994"
          className="w-full"
          style={{
            borderColor: errors.birthYear ? "#EF4444" : "#EFE9E3",
            backgroundColor: "white",
          }}
        />
        {errors.birthYear && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.birthYear}</p>
        )}
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#333333]"
          htmlFor="gender"
        >
          성별
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
          style={{
            borderColor: errors.gender ? "#EF4444" : "#EFE9E3",
            backgroundColor: "white",
            color: gender ? "#333333" : "#9CA3AF",
          }}
        >
          <option value="">선택해주세요</option>
          <option value="female">여성</option>
          <option value="male">남성</option>
          <option value="other">기타/선택 안함</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.gender}</p>
        )}
      </div>
    </div>
  </SectionCard>
);

export function SignUpView({
  initialMessage,
}: {
  initialMessage?: string | null;
}) {
  const [infoMessage] = useState<string | null>(initialMessage || null);

  // 폼 데이터 상태 통합
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    agreeTerms: false,
    agreeAI: false,
    agreeMarketing: false,
    birthYear: "",
    gender: "",
  });

  // 에러 상태 (이미 객체 형태)
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    birthYear?: string;
    gender?: string;
    terms?: string;
  }>({});

  // 모달 상태 통합
  const [modals, setModals] = useState({
    showTerms: false,
    showAI: false,
  });

  // React Query mutation 사용
  const signUpMutation = useSignUp();

  // 폼 데이터 업데이트 헬퍼 함수들
  const updateFormData = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateModals = (modal: keyof typeof modals, isOpen: boolean) => {
    setModals((prev) => ({ ...prev, [modal]: isOpen }));
  };

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "비밀번호는 영문과 숫자를 포함해 8자 이상 입력해주세요.";
    }

    // Validate name
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "이름을 입력해주세요.";
    }

    // Validate phone
    if (!formData.phone || formData.phone.trim() === "") {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      // 전화번호 형식 검증 (숫자와 하이픈만 허용)
      const phoneRegex = /^[0-9-]+$/;
      const cleanedPhone = formData.phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    // Validate birth year
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

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    // Validate terms
    if (!formData.agreeTerms || !formData.agreeAI) {
      newErrors.terms = "필수 약관에 동의해주세요.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // React Query mutation 실행
    signUpMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      agreeTerms: formData.agreeTerms,
      agreeAI: formData.agreeAI,
      agreeMarketing: formData.agreeMarketing,
      birthYear: formData.birthYear,
      gender: formData.gender,
    });
  };

  const isFormValid = Boolean(
    formData.email &&
      formData.password &&
      formData.name &&
      formData.name.trim() !== "" &&
      formData.phone &&
      formData.phone.trim() !== "" &&
      formData.birthYear &&
      formData.gender &&
      formData.agreeTerms &&
      formData.agreeAI
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="w-full max-w-2xl">
        <AuthHeader
          title="myRecord"
          subtitle="기록하면, 피드백이 따라옵니다."
        />

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
          aria-busy={signUpMutation.isPending}
        >
          <BasicInfoSection
            formData={{
              email: formData.email,
              password: formData.password,
            }}
            errors={{ email: errors.email, password: errors.password }}
            updateFormData={(field, value) => updateFormData(field, value)}
            clearError={(field) => clearFieldError(field)}
          />

          <ProfileSection
            formData={{ name: formData.name, phone: formData.phone }}
            errors={{ name: errors.name, phone: errors.phone }}
            updateField={(field, value) => updateFormData(field, value)}
            clearError={(field) => clearFieldError(field)}
          />

          <AdditionalInfoSection
            birthYear={formData.birthYear}
            gender={formData.gender}
            errors={{ birthYear: errors.birthYear, gender: errors.gender }}
            onBirthYearChange={(value) => {
              updateFormData("birthYear", value);
              clearFieldError("birthYear");
            }}
            onGenderChange={(value) => {
              updateFormData("gender", value);
              clearFieldError("gender");
            }}
          />

          <SectionCard
            title="약관 및 알림 설정"
            description="필수 약관을 확인하고 선택 동의 여부를 설정할 수 있어요."
          >
            <TermsAgreement
              agreeTerms={formData.agreeTerms}
              agreeAI={formData.agreeAI}
              agreeMarketing={formData.agreeMarketing}
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
              onShowTerms={() => updateModals("showTerms", true)}
              onShowAI={() => updateModals("showAI", true)}
              error={errors.terms}
            />
          </SectionCard>

          {infoMessage && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-[#1F2937] shadow-sm">
              {infoMessage}
            </div>
          )}

          {signUpMutation.error && (
            <ErrorMessage message={signUpMutation.error.message} />
          )}

          <div className="space-y-6 pt-2">
            <SubmitButton
              isLoading={signUpMutation.isPending}
              isValid={isFormValid}
              loadingText="가입 중..."
              defaultText="가입하고 시작하기"
            />

            <div className="rounded-2xl border border-[#EFE9E3] bg-white/80 py-3 text-center text-sm text-[#6B7A6F]">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                className="font-semibold text-[#6B7A6F] underline-offset-4 hover:underline"
              >
                로그인하기
              </button>
            </div>
          </div>
        </form>
      </div>

      <TermsModal
        isOpen={modals.showTerms}
        onClose={() => updateModals("showTerms", false)}
      />

      <AIDataModal
        isOpen={modals.showAI}
        onClose={() => updateModals("showAI", false)}
      />
    </div>
  );
}
