"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { NameField } from "./forms/NameField";
import { PhoneField } from "./forms/PhoneField";
import { SubmitButton } from "./forms/SubmitButton";

const PROFILE_MODAL_DISMISSED_KEY = "profile-update-modal-dismissed";

export function ProfileUpdateModal() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    general?: string;
  }>({});

  // 사용자 정보 확인 및 모달 표시 여부 결정
  useEffect(() => {
    if (isLoading) return;

    // 이미 모달을 닫았는지 확인
    const dismissed = localStorage.getItem(PROFILE_MODAL_DISMISSED_KEY);
    if (dismissed === "true") {
      return;
    }

    // 사용자 정보 확인
    if (currentUser?.user_metadata) {
      const metadata = currentUser.user_metadata;
      const hasName = metadata.name && String(metadata.name).trim() !== "";
      const hasPhone = metadata.phone && String(metadata.phone).trim() !== "";

      // 이름 또는 전화번호가 없으면 모달 표시
      if (!hasName || !hasPhone) {
        setOpen(true);
        // 기존 값이 있으면 설정
        if (hasName) setName(String(metadata.name));
        if (hasPhone) setPhone(String(metadata.phone));
      }
    }
  }, [currentUser, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
      // 성공 시 모달 닫기 및 저장
      localStorage.setItem(PROFILE_MODAL_DISMISSED_KEY, "true");
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROFILE_MODAL_DISMISSED_KEY, "true");
    setOpen(false);
  };

  if (isLoading || !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: "#333333" }}>
            프로필 정보 입력
          </DialogTitle>
          <DialogDescription style={{ color: "#6B7A6F" }}>
            이메일 찾기 기능을 사용하기 위해 이름과 전화번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "#F3F4F6",
                color: "#6B7A6F",
              }}
              disabled={updateProfileMutation.isPending}
            >
              나중에
            </button>
            <SubmitButton
              isLoading={updateProfileMutation.isPending}
              isValid={Boolean(name && phone)}
              loadingText="저장 중..."
              defaultText="저장하기"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
