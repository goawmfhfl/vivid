"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { AuthHeader } from "../forms/AuthHeader";
import { EmailField } from "../forms/EmailField";
import { PasswordField } from "../forms/PasswordField";
import { SubmitButton } from "../forms/SubmitButton";
import { Checkbox } from "../ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginPath } from "@/lib/navigation";
import { FindEmailDialog } from "./FindEmailDialog";
import { FindPasswordDialog } from "./FindPasswordDialog";
import { COLORS, TYPOGRAPHY, GRADIENT_UTILS, SHADOWS } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/useModalStore";
import { useToast } from "@/hooks/useToast";

const EMAIL_STORAGE_KEY = "login-saved-email";
const REMEMBER_EMAIL_KEY = "login-remember-email";

export function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [findEmailDialogOpen, setFindEmailDialogOpen] = useState(false);
  const [findPasswordDialogOpen, setFindPasswordDialogOpen] = useState(false);

  // React Query mutation 사용
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const { showToast } = useToast();

  // localStorage에서 저장된 이메일 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      const shouldRemember =
        localStorage.getItem(REMEMBER_EMAIL_KEY) === "true";

      if (savedEmail && shouldRemember) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    }
  }, []);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      openSuccessModal(message);
      router.replace(getLoginPath(searchParams));
      return;
    }

    // 회원 탈퇴 완료 확인
    const isDeleted = searchParams.get("deleted");
    if (isDeleted === "true") {
      // 토스트 팝업으로 완료 메시지 표시
      showToast("회원 탈퇴가 완료되었습니다.", 4000);
      router.replace(getLoginPath(searchParams));
    }
  }, [openSuccessModal, router, searchParams, showToast]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // Validate email
    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validateEmail(email)) {
      newErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    // Validate password
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // React Query mutation 실행
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          // 이메일 저장 처리
          if (typeof window !== "undefined") {
            if (rememberEmail) {
              localStorage.setItem(EMAIL_STORAGE_KEY, email);
              localStorage.setItem(REMEMBER_EMAIL_KEY, "true");
            } else {
              localStorage.removeItem(EMAIL_STORAGE_KEY);
              localStorage.removeItem(REMEMBER_EMAIL_KEY);
            }
          }
          router.push("/");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error("use Mutation 로그인 실패:", message);
          setErrors({ general: message });
        },
      }
    );
  };

  const isFormValid = Boolean(email && password);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div className="w-full max-w-md">
        <AuthHeader
          subtitle="하루 10분 기록으로, 나를 선명하게"
          logoSrc="/logos/icon-512x512.svg"
        />

        {/* 다른 방법으로 로그인 (랜딩으로 돌아가기) */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => router.push(getLoginPath(searchParams))}
            className={cn(
              "underline hover:opacity-70 transition-opacity",
              TYPOGRAPHY.bodySmall.fontSize
            )}
            style={{ color: COLORS.text.tertiary }}
          >
            다른 방법으로 로그인
          </button>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: COLORS.surface.elevated,
            boxShadow: `0 4px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)`,
            border: `1px solid ${COLORS.border.light}`,
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-busy={loginMutation.isPending}
          >
          {/* General Error */}
          {errors.general && (
            <div
              className="relative overflow-hidden p-4 rounded-xl flex items-start gap-3"
              style={{
                background: GRADIENT_UTILS.cardBackground(COLORS.status.error, 0.18, "rgba(255, 255, 255, 0.98)"),
                border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.status.error, "55")}`,
                boxShadow: SHADOWS.default,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                }}
              />
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ backgroundColor: GRADIENT_UTILS.borderColor(COLORS.status.error, "22") }}
              >
              <AlertCircle
                className="w-4 h-4"
                style={{ color: COLORS.status.error }}
              />
              </div>
              <div className="relative z-10 min-w-0">
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: COLORS.status.errorDark, letterSpacing: "0.01em" }}
                >
                  로그인 오류
                </p>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.status.errorDark }}>
                  {errors.general}
                </p>
              </div>
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
          />

          <PasswordField
            value={password}
            onChange={(value) => {
              setPassword(value);
              setErrors((prev) => ({
                ...prev,
                password: undefined,
                general: undefined,
              }));
            }}
            placeholder="비밀번호를 입력하세요"
            error={errors.password}
            autocomplete="current-password"
          />

          {/* 이메일 저장 체크박스 */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-email"
              checked={rememberEmail}
              onCheckedChange={(checked) => {
                setRememberEmail(checked === true);
              }}
            />
            <label
              htmlFor="remember-email"
              className={cn("cursor-pointer", TYPOGRAPHY.body.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              이메일 저장하기
            </label>
          </div>

          {/* 로그인 버튼 - 고정 위치 */}
          <div className="w-full">
            <SubmitButton
              isLoading={loginMutation.isPending}
              isValid={isFormValid}
              loadingText="로그인 중..."
              defaultText="로그인"
            />
          </div>

          {/* 회원가입하기 버튼 - 이메일/비밀번호 찾기 자리 */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className={cn("underline hover:opacity-70 transition-opacity", TYPOGRAPHY.body.fontSize)}
              style={{ color: COLORS.brand.primary }}
            >
              계정이 없으신가요? 회원가입하기
            </button>
          </div>

          {/* 이메일/비밀번호 찾기 - 아래로 이동 */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFindEmailDialogOpen(true)}
              className={cn("underline hover:opacity-70 transition-opacity", TYPOGRAPHY.bodySmall.fontSize)}
              style={{ color: COLORS.brand.primary }}
            >
              이메일 찾기
            </button>
            <span style={{ color: COLORS.text.tertiary }}>|</span>
            <button
              type="button"
              onClick={() => setFindPasswordDialogOpen(true)}
              className={cn("underline hover:opacity-70 transition-opacity", TYPOGRAPHY.bodySmall.fontSize)}
              style={{ color: COLORS.brand.primary }}
            >
              비밀번호 찾기
            </button>
          </div>
        </form>
        </div>

        {/* 이메일 찾기 다이얼로그 */}
        <FindEmailDialog
          open={findEmailDialogOpen}
          onOpenChange={setFindEmailDialogOpen}
        />

        {/* 비밀번호 찾기 다이얼로그 */}
        <FindPasswordDialog
          open={findPasswordDialogOpen}
          onOpenChange={setFindPasswordDialogOpen}
        />
      </div>
    </div>
  );
}
