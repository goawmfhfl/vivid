import { TermsAgreement } from "@/components/forms/TermsAgreement";
import { PaperCard } from "../PaperCard";
import { COLORS } from "@/lib/design-system";

interface TermsStepProps {
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
  termsError?: string;
  onTermsChange: (checked: boolean) => void;
  onAIChange: (checked: boolean) => void;
  onMarketingChange: (checked: boolean) => void;
  onAgreeAll: (nextState: boolean) => void;
  onShowTerms: () => void;
  onShowAI: () => void;
}

export function TermsStep({
  agreeTerms,
  agreeAI,
  agreeMarketing,
  termsError,
  onTermsChange,
  onAIChange,
  onMarketingChange,
  onAgreeAll,
  onShowTerms,
  onShowAI,
}: TermsStepProps) {
  return (
    <PaperCard className="p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          약관 및 알림 설정
        </h2>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          필수 약관을 확인하고 선택 동의 여부를 설정할 수 있어요.
        </p>
      </div>

      <TermsAgreement
        agreeTerms={agreeTerms}
        agreeAI={agreeAI}
        agreeMarketing={agreeMarketing}
        onTermsChange={onTermsChange}
        onAIChange={onAIChange}
        onMarketingChange={onMarketingChange}
        onAgreeAll={onAgreeAll}
        onShowTerms={onShowTerms}
        onShowAI={onShowAI}
        error={termsError}
      />
    </PaperCard>
  );
}
