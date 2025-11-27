"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EmailField } from "../forms/EmailField";
import { SubmitButton } from "../forms/SubmitButton";
import { useResetPassword } from "@/hooks/useResetPassword";

interface FindPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindPasswordDialog({
  open,
  onOpenChange,
}: FindPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const newErrors: typeof errors = {};

    // 이메일 검증
    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "이메일 형식이 올바르지 않습니다.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ email });
      setSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  const handleClose = () => {
    setEmail("");
    setErrors({});
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: "#333333" }}>비밀번호 찾기</DialogTitle>
          <DialogDescription style={{ color: "#6B7A6F" }}>
            가입하신 이메일 주소를 입력해주세요. 비밀번호 재설정 링크를
            보내드립니다.
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
                  이메일을 확인해주세요
                </p>
                <p style={{ color: "#047857", fontSize: "0.85rem" }}>
                  입력하신 이메일 주소로 비밀번호 재설정 링크를 보내드렸습니다.
                  <br />
                  이메일을 확인하여 비밀번호를 재설정해주세요.
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
              disabled={resetPasswordMutation.isPending}
            />

            <SubmitButton
              isLoading={resetPasswordMutation.isPending}
              isValid={Boolean(email)}
              loadingText="전송 중..."
              defaultText="비밀번호 재설정 링크 보내기"
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
