"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { getCurrentUserProfile } from "@/lib/profile-utils";
import { NameField } from "./forms/NameField";
import { PhoneField } from "./forms/PhoneField";
import { SubmitButton } from "./forms/SubmitButton";
import { AuthHeader } from "./forms/AuthHeader";
import { Input } from "./ui/Input";
import { Checkbox } from "./ui/checkbox";

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <section className="rounded-2xl border border-[#EFE9E3] bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-[#333333]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[#6B7A6F]">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

export function ProfileSettingsView() {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthYear: "",
    gender: "",
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    birthYear?: string;
    gender?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) return;

      // user_metadata에서 기본 정보 가져오기
      const metadata = currentUser.user_metadata || {};
      const basicData = {
        name: (metadata.name as string) || "",
        phone: (metadata.phone as string) || "",
        birthYear: (metadata.birthYear as string) || "",
        gender: (metadata.gender as string) || "",
        agreeMarketing: false, // 기본값
      };

      // profiles 테이블에서 약관 동의 정보 가져오기
      try {
        const profile = await getCurrentUserProfile();
        if (profile) {
          basicData.agreeMarketing = profile.agree_marketing;
        }
      } catch (error) {
        console.error("프로필 정보 로드 실패:", error);
      }

      setFormData(basicData);
    };

    loadProfileData();
  }, [currentUser]);

  const updateField = (field: keyof typeof formData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneRegex = /^[0-9-]+$/;
      const cleaned = formData.phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleaned) || cleaned.length < 10) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    if (!formData.birthYear) {
      newErrors.birthYear = "출생년도를 입력해주세요.";
    } else {
      const year = Number(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (
        isNaN(year) ||
        formData.birthYear.length !== 4 ||
        year < 1900 ||
        year > currentYear
      ) {
        newErrors.birthYear = "올바른 출생년도(YYYY)를 입력해주세요.";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        birthYear: formData.birthYear,
        gender: formData.gender,
        agreeMarketing: formData.agreeMarketing,
      });
      setSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-sm text-[#6B7A6F]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-[#6B7A6F] transition hover:text-[#4B5A4F]"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>

        <AuthHeader
          title="프로필 설정"
          subtitle="회원가입과 동일한 형태로 정보를 관리할 수 있어요."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {errors.general && (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.general}
              </div>
            </div>
          )}

          <SectionCard
            title="기본 프로필"
            description="이름과 연락처는 계정 보호와 이메일 찾기에 활용돼요."
          >
            <div>
              <NameField
                value={formData.name}
                onChange={(value) => {
                  updateField("name", value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="이름을 입력하세요"
                error={errors.name}
                disabled={updateProfileMutation.isPending}
              />
              <p className="mt-1 text-xs text-[#6B7A6F]">
                이메일 찾기와 맞춤 피드백에 사용됩니다.
              </p>
            </div>

            <div>
              <PhoneField
                value={formData.phone}
                onChange={(value) => {
                  updateField("phone", value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                disabled={updateProfileMutation.isPending}
              />
              <p className="mt-1 text-xs text-[#6B7A6F]">
                비밀번호 재설정 등 중요한 알림을 받습니다.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="맞춤 피드백 정보"
            description="정확한 AI 피드백을 위해 선택 정보를 입력해주세요."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#333333]"
                  htmlFor="profile-birth"
                >
                  출생년도
                </label>
                <Input
                  id="profile-birth"
                  type="text"
                  inputMode="numeric"
                  value={formData.birthYear}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 4);
                    updateField("birthYear", cleaned);
                    setErrors((prev) => ({ ...prev, birthYear: undefined }));
                  }}
                  placeholder="예) 1994"
                  className="w-full"
                  style={{
                    borderColor: errors.birthYear ? "#EF4444" : "#EFE9E3",
                    backgroundColor: "white",
                  }}
                  disabled={updateProfileMutation.isPending}
                />
                {errors.birthYear && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {errors.birthYear}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#333333]"
                  htmlFor="profile-gender"
                >
                  성별
                </label>
                <select
                  id="profile-gender"
                  value={formData.gender}
                  onChange={(e) => {
                    updateField("gender", e.target.value);
                    setErrors((prev) => ({ ...prev, gender: undefined }));
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: errors.gender ? "#EF4444" : "#EFE9E3",
                    backgroundColor: "white",
                    color: formData.gender ? "#333333" : "#9CA3AF",
                  }}
                  disabled={updateProfileMutation.isPending}
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

          <SectionCard
            title="알림 및 마케팅 수신"
            description="새로운 기능과 인사이트를 가장 먼저 알려드려요."
          >
            <div className="flex items-start gap-3 rounded-2xl border border-[#F4F1EA] bg-[#FBFAF7] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                <Bell className="h-4 w-4 text-[#6B7A6F]" />
              </div>
              <div className="flex-1 text-sm text-[#4E4B46]">
                <p className="font-medium text-[#333333]">
                  마케팅 정보 수신 동의
                </p>
                <p className="mt-1 text-xs text-[#6B7A6F]">
                  문자/이메일로 서비스 꿀팁, 업데이트, 이벤트 소식을 보내드려요.
                  언제든지 철회할 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={formData.agreeMarketing}
                  onCheckedChange={(checked) =>
                    updateField("agreeMarketing", checked === true)
                  }
                  className="h-5 w-5"
                  disabled={updateProfileMutation.isPending}
                />
                <ChevronRight className="h-4 w-4 text-[#C5C1B8]" />
              </div>
            </div>
          </SectionCard>

          {success && (
            <div className="rounded-2xl border border-[#A8BBA8] bg-[#F2F7F2] p-4 text-sm text-[#3F553F]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#4C7660]" />
                프로필이 업데이트되었습니다.
              </div>
              <p className="mt-1 text-xs">
                저장된 내용은 다음 로그인부터 반영됩니다.
              </p>
            </div>
          )}

          <SubmitButton
            isLoading={updateProfileMutation.isPending}
            isValid={
              Boolean(
                formData.name &&
                  formData.phone &&
                  formData.birthYear &&
                  formData.gender
              ) && !updateProfileMutation.isPending
            }
            loadingText="저장 중..."
            defaultText="변경 사항 저장하기"
          />
        </form>
      </div>
    </div>
  );
}
