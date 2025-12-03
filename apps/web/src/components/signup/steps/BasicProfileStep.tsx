import { NameField } from "@/components/forms/NameField";
import { PhoneField } from "@/components/forms/PhoneField";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";

interface BasicProfileStepProps {
  name: string;
  phone: string;
  nameError?: string;
  phoneError?: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onClearError: (field: "name" | "phone") => void;
}

export function BasicProfileStep({
  name,
  phone,
  nameError,
  phoneError,
  onNameChange,
  onPhoneChange,
  onClearError,
}: BasicProfileStepProps) {
  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          기본 프로필
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          계정 복구와 이메일 찾기에 활용돼요.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <NameField
            value={name}
            onChange={(value) => {
              onNameChange(value);
              onClearError("name");
            }}
            placeholder="이름을 입력하세요"
            error={nameError}
          />
          <p className="mt-1 text-xs" style={{ color: COLORS.text.tertiary }}>
            이메일 찾기에 사용됩니다.
          </p>
        </div>

        <div>
          <PhoneField
            value={phone}
            onChange={(value) => {
              onPhoneChange(value);
              onClearError("phone");
            }}
            error={phoneError}
          />
          <p className="mt-1 text-xs" style={{ color: COLORS.text.tertiary }}>
            빠른 연락과 계정 보호를 위해 필요해요.
          </p>
        </div>
      </div>
    </PaperCard>
  );
}
