"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginPath } from "@/lib/navigation";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { AuthHeader } from "@/components/forms/AuthHeader";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // URL에서 토큰 확인 및 처리
    const checkSession = async () => {
      try {
        // URL 해시에서 access_token 추출
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // recovery 타입의 토큰이 있으면 세션 설정
        if (type === "recovery" && accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("세션 설정 에러:", sessionError);
            setErrors({
              general:
                "세션을 설정할 수 없습니다. 비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.",
            });
            setLoading(false);
            return;
          }

          // 세션 설정 후 해시 제거 (깔끔한 URL 유지)
          window.history.replaceState(null, "", window.location.pathname);
        }

        // 세션 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("세션 확인 에러:", error);
          setErrors({
            general:
              "세션을 확인할 수 없습니다. 비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.",
          });
          setLoading(false);
          return;
        }

        if (!data.session) {
          setErrors({
            general: "비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.",
          });
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("세션 확인 중 오류:", error);
        setErrors({
          general: "비밀번호 재설정 중 오류가 발생했습니다.",
        });
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): boolean => {
    // 최소 6자 이상
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이미 제출 중이면 중복 요청 방지
    if (isSubmitting) {
      return;
    }

    setErrors({});
    setSuccess(false);

    const newErrors: typeof errors = {};

    // 비밀번호 검증
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (!validatePassword(password)) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        let errorMessage = error.message;

        if (error.message.includes("same as the old password")) {
          errorMessage = "새 비밀번호는 기존 비밀번호와 달라야 합니다.";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "비밀번호는 6자 이상이어야 합니다.";
        }

        setErrors({ general: errorMessage });
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push(getLoginPath(searchParams));
      }, 3000);
    } catch (error) {
      console.error("비밀번호 재설정 중 오류:", error);
      setErrors({
        general:
          "비밀번호 재설정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <LoadingSpinner
          message="비밀번호 재설정 페이지를 불러오는 중..."
          size="md"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="w-full max-w-md">
        <AuthHeader
          title="비밀번호 재설정"
          subtitle="새로운 비밀번호를 입력해주세요."
        />

        {success ? (
          <div className="space-y-4">
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
                  비밀번호가 성공적으로 변경되었습니다
                </p>
                <p style={{ color: "#047857", fontSize: "0.85rem" }}>
                  잠시 후 로그인 페이지로 이동합니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="새 비밀번호를 입력하세요 (6자 이상)"
              error={errors.password}
              autocomplete="new-password"
            />

            <div>
              <label
                className="block mb-2"
                style={{ color: "#333333", fontSize: "0.9rem" }}
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: "#6B7A6F", opacity: 0.5 }}
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                      general: undefined,
                    }));
                  }}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  className="pl-11 pr-4"
                  style={{
                    borderColor: errors.confirmPassword ? "#EF4444" : "#EFE9E3",
                    backgroundColor: "white",
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <p
                  className="mt-1.5 flex items-center gap-1"
                  style={{ color: "#EF4444", fontSize: "0.8rem" }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <SubmitButton
              isLoading={isSubmitting}
              isValid={Boolean(password && confirmPassword) && !isSubmitting}
              loadingText="재설정 중..."
              defaultText="비밀번호 재설정"
            />

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => router.push(getLoginPath(searchParams))}
                className="underline"
                style={{ color: "#6B7A6F", fontSize: "0.9rem" }}
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center px-4 py-8"
          style={{ backgroundColor: "#FAFAF8" }}
        >
          <LoadingSpinner
            message="비밀번호 재설정 페이지를 불러오는 중..."
            size="md"
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
