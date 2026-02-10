"use client";

import { NameField } from "@/components/forms/NameField";
import { COLORS } from "@/lib/design-system";

interface DisplayNameStepProps {
  name: string;
  nameError?: string;
  infoMessage?: string | null;
  onNameChange: (value: string) => void;
  onClearError: (field: "name") => void;
}

export function DisplayNameStep({
  name,
  nameError,
  infoMessage,
  onNameChange,
  onClearError,
}: DisplayNameStepProps) {
  return (
    <div className="space-y-8">
      <header className="mt-16">
        <h1
          className="mb-2 text-2xl font-semibold leading-tight sm:text-3xl"
          style={{ color: COLORS.text.primary }}
        >
          만나서 반가워요!
        </h1>
        <p
          className="text-base leading-relaxed sm:text-lg"
          style={{ color: COLORS.text.secondary }}
        >
          VIVID에서 사용할{" "}
          <span style={{ color: COLORS.brand.primary, fontWeight: 600 }}>
            닉네임
          </span>
          을 입력해 주세요.
        </p>
        {infoMessage && (
          <p className="mt-3 text-sm" style={{ color: COLORS.text.tertiary }}>
            {infoMessage}
          </p>
        )}
      </header>

      <div className="space-y-2">
        <NameField
          value={name}
          onChange={(value) => {
            onNameChange(value);
            onClearError("name");
          }}
          placeholder="닉네임을 입력해 주세요."
          error={nameError}
        />
        <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
          • 공백 포함 최대 12글자까지 가능해요.
        </p>
      </div>
    </div>
  );
}
