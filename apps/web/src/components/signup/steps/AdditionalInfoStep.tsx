import { Input } from "@/components/ui/Input";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";
import {
  RecordTypeCard,
  RECORD_TYPES,
  type RecordType,
} from "../RecordTypeCard";

interface AdditionalInfoStepProps {
  birthYear: string;
  gender: string;
  recordTypes: RecordType[];
  birthYearError?: string;
  genderError?: string;
  onBirthYearChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onRecordTypeToggle: (type: RecordType) => void;
}

export function AdditionalInfoStep({
  birthYear,
  gender,
  recordTypes,
  birthYearError,
  genderError,
  onBirthYearChange,
  onGenderChange,
  onRecordTypeToggle,
}: AdditionalInfoStepProps) {
  const maxSelections = 2;
  const isMaxSelected = recordTypes.length >= maxSelections;

  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          맞춤형 피드백 정보
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          더 정교한 피드백을 위해 선택 정보를 입력해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: COLORS.text.primary }}
              htmlFor="birthYear"
            >
              출생년도
            </label>
            <Input
              id="birthYear"
              type="text"
              inputMode="numeric"
              value={birthYear}
              onChange={(e) => {
                const cleaned = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 4);
                onBirthYearChange(cleaned);
              }}
              placeholder="예) 1994"
              className="w-full"
              style={{
                borderColor: birthYearError ? "#EF4444" : COLORS.border.light,
                backgroundColor: "white",
              }}
            />
            {birthYearError && (
              <p className="mt-1 text-xs text-[#EF4444]">{birthYearError}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: COLORS.text.primary }}
              htmlFor="gender"
            >
              성별
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => onGenderChange(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: genderError ? "#EF4444" : COLORS.border.light,
                backgroundColor: "white",
                color: gender ? COLORS.text.primary : COLORS.text.muted,
              }}
            >
              <option value="">선택해주세요</option>
              <option value="female">여성</option>
              <option value="male">남성</option>
              <option value="other">기타/선택 안함</option>
            </select>
            {genderError && (
              <p className="mt-1 text-xs text-[#EF4444]">{genderError}</p>
            )}
          </div>
        </div>

        {/* 기록 타입 선택 */}
        <div>
          <div className="mb-4">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              기록 타입 선택
            </h3>
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
              나에게 맞는 기록 타입을 2개 선택해주세요. ({recordTypes.length}/
              {maxSelections})
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RECORD_TYPES.map((type) => {
              const isSelected = recordTypes.includes(type.id);
              return (
                <RecordTypeCard
                  key={type.id}
                  type={type}
                  isSelected={isSelected}
                  isDisabled={isMaxSelected && !isSelected}
                  onClick={() => onRecordTypeToggle(type.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </PaperCard>
  );
}
