import { EmailField } from "@/components/forms/EmailField";
import { PasswordField } from "@/components/forms/PasswordField";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";

interface LoginInfoStepProps {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  isSocialMode?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onClearError: (field: "email" | "password") => void;
}

export function LoginInfoStep({
  email,
  password,
  emailError,
  passwordError,
  isSocialMode = false,
  onEmailChange,
  onPasswordChange,
  onClearError,
}: LoginInfoStepProps) {
  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          로그인 정보
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          {isSocialMode
            ? email
              ? "소셜 로그인에서 가져온 이메일로 계속 진행해요."
              : "연동 계정에 이메일이 없어요. 서비스 이용을 위해 이메일을 입력해주세요."
            : "서비스 이용을 위한 기본 로그인 정보를 입력해주세요."}
        </p>
      </div>

      <div className="space-y-5">
        <EmailField
          value={email}
          onChange={(value) => {
            onEmailChange(value);
            onClearError("email");
          }}
          placeholder="example@gmail.com"
          error={emailError}
          disabled={isSocialMode && Boolean(email)}
        />

        {!isSocialMode && (
          <PasswordField
            value={password}
            onChange={(value) => {
              onPasswordChange(value);
              onClearError("password");
            }}
            placeholder="영문+숫자 8자 이상 입력"
            error={passwordError}
            autocomplete="new-password"
          />
        )}

        {isSocialMode && email && (
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            이메일은 소셜 로그인 계정과 동일하게 고정됩니다.
          </p>
        )}
      </div>
    </PaperCard>
  );
}
