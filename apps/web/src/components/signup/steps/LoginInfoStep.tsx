"use client";

import { EmailField } from "@/components/forms/EmailField";
import { PasswordField } from "@/components/forms/PasswordField";
import { NameField } from "@/components/forms/NameField";
import { COLORS } from "@/lib/design-system";
import { CheckCircle2 } from "lucide-react";

type EmailCheckStatus = "idle" | "checking" | "available" | "taken";

interface LoginInfoStepProps {
  email: string;
  password: string;
  name?: string;
  emailError?: string;
  passwordError?: string;
  nameError?: string;
  isSocialMode?: boolean;
  emailCheckStatus?: EmailCheckStatus;
  onCheckEmail?: () => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange?: (value: string) => void;
  onClearError: (field: "email" | "password" | "name") => void;
  showNameField?: boolean;
}

export function LoginInfoStep({
  email,
  password,
  name = "",
  emailError,
  passwordError,
  nameError,
  isSocialMode = false,
  emailCheckStatus = "idle",
  onCheckEmail,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onClearError,
  showNameField = true,
}: LoginInfoStepProps) {
  const isEmailCheckPassed = emailCheckStatus === "available";

  return (
    <div className="space-y-8 mt-16">
      <header>
        <h1
          className="mb-2 text-2xl font-semibold leading-tight sm:text-3xl"
          style={{ color: COLORS.text.primary }}
        >
          계정을 만들어 주세요
        </h1>
        <p
          className="text-base leading-relaxed sm:text-lg"
          style={{ color: COLORS.text.secondary }}
        >
          {isSocialMode
            ? email
              ? "소셜 로그인에서 가져온 이메일로 계속 진행해요."
              : "연동 계정에 이메일이 없어요. 서비스 이용을 위해 이메일을 입력해주세요."
            : "이메일과 비밀번호를 입력해 주세요."}
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <EmailField
            value={email}
            onChange={(value) => {
              onEmailChange(value);
              onClearError("email");
            }}
            placeholder="example@gmail.com"
            error={emailError}
            disabled={isSocialMode && Boolean(email)}
            disableActiveStyle
            rightAction={
              !isSocialMode && onCheckEmail ? (
                <button
                  type="button"
                  onClick={onCheckEmail}
                  disabled={emailCheckStatus === "checking" || !email.trim()}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    borderColor: isEmailCheckPassed
                      ? COLORS.brand.primary
                      : COLORS.border.light,
                    color: isEmailCheckPassed
                      ? COLORS.brand.primary
                      : COLORS.text.secondary,
                    backgroundColor: isEmailCheckPassed
                      ? `${COLORS.brand.light}20`
                      : COLORS.background.base,
                  }}
                >
                  {isEmailCheckPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {emailCheckStatus === "checking"
                    ? "확인 중..."
                    : isEmailCheckPassed
                    ? "확인 완료"
                    : "중복 확인"}
                </button>
              ) : undefined
            }
          />
          {isEmailCheckPassed && (
            <p className="mt-2 text-xs" style={{ color: COLORS.brand.primary }}>
              사용 가능한 이메일입니다.
            </p>
          )}
        </div>

        {!isSocialMode && (
          <>
            <PasswordField
              value={password}
              onChange={(value) => {
                onPasswordChange(value);
                onClearError("password");
              }}
              placeholder="영문+숫자 8자 이상 입력"
              error={passwordError}
              autocomplete="new-password"
              disableActiveStyle
            />
            {showNameField && onNameChange && (
              <NameField
                value={name}
                onChange={(value) => {
                  onNameChange(value);
                  onClearError("name");
                }}
                placeholder="닉네임을 입력해 주세요."
                error={nameError}
              />
            )}
          </>
        )}

        {isSocialMode && email && (
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            이메일은 소셜 로그인 계정과 동일하게 고정됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
