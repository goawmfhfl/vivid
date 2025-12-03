"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { useKakaoLogin } from "@/hooks/useKakaoLogin";
import { AuthHeader } from "../forms/AuthHeader";
import { EmailField } from "../forms/EmailField";
import { PasswordField } from "../forms/PasswordField";
import { SubmitButton } from "../forms/SubmitButton";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { FindEmailDialog } from "./FindEmailDialog";
import { FindPasswordDialog } from "./FindPasswordDialog";

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
  const loginMutation = useLogin();
  const kakaoLoginMutation = useKakaoLogin();

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
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="w-full max-w-md">
        <AuthHeader
          title="myRecord"
          subtitle="기록하면, 피드백이 따라옵니다."
        />

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          aria-busy={loginMutation.isPending}
        >
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
              className="cursor-pointer"
              style={{ color: "#4E4B46", fontSize: "0.9rem" }}
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
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-sm underline"
              style={{ color: "#6B7A6F" }}
            >
              계정이 없으신가요? 회원가입하기
            </button>
          </div>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{ borderColor: "#EFE9E3" }}
              />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-4"
                style={{
                  backgroundColor: "#FAFAF8",
                  color: "#4E4B46",
                  opacity: 0.6,
                  fontSize: "0.8rem",
                }}
              >
                간편 로그인
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  kakaoLoginMutation.mutate();
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  backgroundColor: "#FEE500",
                }}
                title="카카오 로그인"
                disabled={kakaoLoginMutation.isPending}
              >
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 3C5.58172 3 2 5.89543 2 9.5C2 11.6484 3.23828 13.5391 5.17188 14.6953L4.30469 17.8359C4.25781 18.0078 4.42969 18.1641 4.59375 18.0781L8.35938 15.8203C8.89844 15.9141 9.44531 15.9766 10 15.9766C14.4183 15.9766 18 13.0811 18 9.47656C18 5.87201 14.4183 3 10 3Z"
                    fill="#000000"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 이메일/비밀번호 찾기 - 아래로 이동 */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFindEmailDialogOpen(true)}
              className="text-sm underline"
              style={{ color: "#6B7A6F" }}
            >
              이메일 찾기
            </button>
            <span style={{ color: "#6B7A6F" }}>|</span>
            <button
              type="button"
              onClick={() => setFindPasswordDialogOpen(true)}
              className="text-sm underline"
              style={{ color: "#6B7A6F" }}
            >
              비밀번호 찾기
            </button>
          </div>
        </form>

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
