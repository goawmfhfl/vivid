"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { NameField } from "./forms/NameField";
import { PhoneField } from "./forms/PhoneField";
import { SubmitButton } from "./forms/SubmitButton";
import { AuthHeader } from "./forms/AuthHeader";

export function ProfileSettingsView() {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  // 현재 사용자 정보 로드
  useEffect(() => {
    if (currentUser?.user_metadata) {
      const metadata = currentUser.user_metadata;
      setName((metadata.name as string) || "");
      setPhone((metadata.phone as string) || "");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const newErrors: typeof errors = {};

    // 이름 검증
    if (!name || name.trim() === "") {
      newErrors.name = "이름을 입력해주세요.";
    }

    // 전화번호 검증
    if (!phone || phone.trim() === "") {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneRegex = /^[0-9-]+$/;
      const cleanedPhone = phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ color: "#6B7A6F" }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="max-w-md mx-auto">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
          style={{ color: "#6B7A6F" }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontSize: "0.9rem" }}>뒤로</span>
        </button>

        <AuthHeader
          title="프로필 설정"
          subtitle="이름과 전화번호를 입력해주세요."
        />

        {success ? (
          <div className="space-y-4 mt-6">
            <div
              className="p-4 rounded-lg flex items-start gap-3"
              style={{
                backgroundColor: "#D1FAE5",
                border: "1px solid #10B981",
              }}
            >
              <CheckCircle2
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "#10B981" }}
              />
              <div className="flex-1">
                <p
                  style={{
                    color: "#065F46",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                  className="mb-1"
                >
                  프로필이 업데이트되었습니다
                </p>
                <p style={{ color: "#047857", fontSize: "0.85rem" }}>
                  잠시 후 홈으로 이동합니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* General Error */}
            {errors.general && (
              <div
                className="p-4 rounded-lg flex items-center gap-2"
                style={{
                  backgroundColor: "#FEE2E2",
                  border: "1px solid #EF4444",
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "#EF4444" }}
                />
                <p style={{ color: "#991B1B", fontSize: "0.9rem" }}>
                  {errors.general}
                </p>
              </div>
            )}

            {/* 이름 필드 */}
            <div>
              <NameField
                value={name}
                onChange={(value) => {
                  setName(value);
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                    general: undefined,
                  }));
                }}
                placeholder="이름을 입력하세요"
                error={errors.name}
                disabled={updateProfileMutation.isPending}
              />
              <p
                className="mt-1"
                style={{ color: "#6B7A6F", fontSize: "0.8rem" }}
              >
                이메일 찾기에 사용됩니다
              </p>
            </div>

            {/* 전화번호 필드 */}
            <div>
              <PhoneField
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setErrors((prev) => ({
                    ...prev,
                    phone: undefined,
                    general: undefined,
                  }));
                }}
                error={errors.phone}
                disabled={updateProfileMutation.isPending}
              />
              <p
                className="mt-1"
                style={{ color: "#6B7A6F", fontSize: "0.8rem" }}
              >
                이메일 찾기에 사용됩니다
              </p>
            </div>

            <SubmitButton
              isLoading={updateProfileMutation.isPending}
              isValid={Boolean(name && phone)}
              loadingText="저장 중..."
              defaultText="저장하기"
            />
          </form>
        )}
      </div>
    </div>
  );
}
