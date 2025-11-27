"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { EmailField } from "./forms/EmailField";
import { NameField } from "./forms/NameField";
import { PhoneField } from "./forms/PhoneField";
import { SubmitButton } from "./forms/SubmitButton";
import { useResetPassword } from "@/hooks/useResetPassword";
import { useFindEmail } from "@/hooks/useFindEmail";

interface FindAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "email" | "password";
}

export function FindAccountDialog({
  open,
  onOpenChange,
  mode,
}: FindAccountDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    phone?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [foundEmails, setFoundEmails] = useState<string[]>([]);

  const resetPasswordMutation = useResetPassword();
  const findEmailMutation = useFindEmail();

  const isPasswordMode = mode === "password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setFoundEmails([]);

    const newErrors: typeof errors = {};

    if (isPasswordMode) {
      // 비밀번호 찾기: 이메일 검증
      if (!email) {
        newErrors.email = "이메일을 입력해주세요.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = "이메일 형식이 올바르지 않습니다.";
        }
      }
    } else {
      // 이메일 찾기: 이름과 전화번호 모두 필수
      if (!name || name.trim() === "") {
        newErrors.name = "이름을 입력해주세요.";
      }
      if (!phone || phone.trim() === "") {
        newErrors.phone = "전화번호를 입력해주세요.";
      } else {
        const phoneRegex = /^[0-9-]+$/;
        const cleanedPhone = phone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
          newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      if (isPasswordMode) {
        // 비밀번호 재설정
        await resetPasswordMutation.mutateAsync({ email });
        setSuccess(true);
      } else {
        // 이메일 찾기
        const result = await findEmailMutation.mutateAsync({ name, phone });
        setFoundEmails(result.emails || []);
        setSuccess(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setPhone("");
    setErrors({});
    setSuccess(false);
    setFoundEmails([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: "#333333" }}>
            {isPasswordMode ? "비밀번호 찾기" : "이메일 찾기"}
          </DialogTitle>
          <DialogDescription style={{ color: "#6B7A6F" }}>
            {isPasswordMode
              ? "가입하신 이메일 주소를 입력해주세요. 비밀번호 재설정 링크를 보내드립니다."
              : "가입 시 입력하신 이름과 전화번호를 모두 입력해주세요."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
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
                  {isPasswordMode
                    ? "이메일을 확인해주세요"
                    : "이메일을 찾았습니다"}
                </p>
                <p style={{ color: "#047857", fontSize: "0.85rem" }}>
                  {isPasswordMode ? (
                    <>
                      입력하신 이메일 주소로 비밀번호 재설정 링크를
                      보내드렸습니다.
                      <br />
                      이메일을 확인하여 비밀번호를 재설정해주세요.
                    </>
                  ) : (
                    <>
                      {foundEmails.length > 0 ? (
                        <>
                          등록된 이메일:
                          <br />
                          {foundEmails.map((email, index) => (
                            <strong
                              key={index}
                              style={{ display: "block", marginTop: "4px" }}
                            >
                              {email}
                            </strong>
                          ))}
                          <br />
                          비밀번호를 잊으셨다면 비밀번호 찾기를 이용해주세요.
                        </>
                      ) : (
                        <>
                          입력하신 정보와 일치하는 계정을 찾을 수 없습니다.
                          <br />
                          이름과 전화번호를 정확히 입력해주세요.
                          <br />
                          <br />
                          <span style={{ fontSize: "0.8rem" }}>
                            회원가입 시 이름/전화번호를 입력하지 않으셨다면,
                            <br />
                            비밀번호 찾기를 통해 이메일을 확인하실 수 있습니다.
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: "#6B7A6F",
                  color: "white",
                }}
              >
                확인
              </button>
            </div>
          </div>
        ) : (
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

            {isPasswordMode ? (
              <EmailField
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                    general: undefined,
                  }));
                }}
                placeholder="example@gmail.com"
                error={errors.email}
                disabled={
                  resetPasswordMutation.isPending || findEmailMutation.isPending
                }
              />
            ) : (
              <>
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
                  disabled={
                    resetPasswordMutation.isPending ||
                    findEmailMutation.isPending
                  }
                />

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
                  disabled={
                    resetPasswordMutation.isPending ||
                    findEmailMutation.isPending
                  }
                />
              </>
            )}

            <SubmitButton
              isLoading={
                resetPasswordMutation.isPending || findEmailMutation.isPending
              }
              isValid={
                isPasswordMode
                  ? Boolean(email)
                  : Boolean(name && name.trim() && phone && phone.trim())
              }
              loadingText={isPasswordMode ? "전송 중..." : "확인 중..."}
              defaultText={
                isPasswordMode ? "비밀번호 재설정 링크 보내기" : "이메일 찾기"
              }
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
