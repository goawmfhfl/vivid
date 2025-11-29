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
import { COLORS } from "@/lib/design-system";

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
        {!success && (
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle
              className="text-xl"
              style={{ color: COLORS.text.primary }}
            >
              비밀번호 찾기
            </DialogTitle>
            <DialogDescription
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.tertiary }}
            >
              가입하신 이메일 주소를 입력해주세요.
              <br />
              비밀번호 재설정 링크를 보내드립니다.
            </DialogDescription>
          </DialogHeader>
        )}

        {success ? (
          <div className="space-y-8 py-6">
            {/* 성공 아이콘 */}
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "#F0FDF4" }}
              >
                <CheckCircle2
                  className="w-10 h-10"
                  style={{ color: COLORS.status.success }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: COLORS.text.primary }}
              >
                이메일을 확인해주세요
              </h3>
              <p
                className="text-base text-center leading-relaxed max-w-sm mx-auto"
                style={{ color: COLORS.text.tertiary }}
              >
                입력하신 이메일 주소로
                <br />
                비밀번호 재설정 링크를 보내드렸습니다.
                <br />
                <span className="mt-2 block">
                  이메일을 확인하여 비밀번호를 재설정해주세요.
                </span>
              </p>
            </div>

            {/* 확인 버튼 */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-8 py-3 rounded-lg font-medium text-base"
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: COLORS.text.white,
                }}
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* General Error */}
            {errors.general && (
              <div
                className="p-4 rounded-lg flex items-start gap-3"
                style={{
                  backgroundColor: "#FEE2E2",
                  border: "1px solid #EF4444",
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#EF4444" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#991B1B" }}
                >
                  {errors.general}
                </p>
              </div>
            )}

            <div className="space-y-5">
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
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
