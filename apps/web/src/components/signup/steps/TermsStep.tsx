"use client";

import { TermsAgreement } from "@/components/forms/TermsAgreement";
import { Checkbox } from "@/components/ui/checkbox";
import { COLORS } from "@/lib/design-system";

interface TermsStepProps {
  agreeAge14: boolean;
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
  termsError?: string;
  onAge14Change: (checked: boolean) => void;
  onTermsChange: (checked: boolean) => void;
  onAIChange: (checked: boolean) => void;
  onMarketingChange: (checked: boolean) => void;
  onAgreeAll: (nextState: boolean) => void;
  onShowTerms: () => void;
  onShowAI: () => void;
}

export function TermsStep({
  agreeAge14,
  agreeTerms,
  agreeAI,
  agreeMarketing,
  termsError,
  onAge14Change,
  onTermsChange,
  onAIChange,
  onMarketingChange,
  onAgreeAll,
  onShowTerms,
  onShowAI,
}: TermsStepProps) {
  const allChecked = agreeAge14 && agreeTerms && agreeAI && agreeMarketing;

  return (
    <div className="space-y-8">
      <header className="mt-16">
        <h1
          className="text-2xl font-semibold leading-tight sm:text-3xl"
          style={{ color: COLORS.text.primary }}
        >
          서비스 이용 동의
        </h1>
      </header>

      <div className="space-y-0">
        <label
          htmlFor="terms-agree-all"
          className="flex cursor-pointer items-center gap-3 py-4"
        >
          <Checkbox
            id="terms-agree-all"
            checked={allChecked}
            onCheckedChange={(checked) => onAgreeAll(checked === true)}
            className="h-5 w-5 flex-shrink-0 rounded"
          />
          <span
            className="text-base font-medium"
            style={{ color: COLORS.text.primary }}
          >
            약관 전체 동의
          </span>
        </label>

        <div
          className="h-px w-full"
          style={{ backgroundColor: COLORS.border.light }}
        />

        <div className="pt-2">
          <TermsAgreement
            agreeAge14={agreeAge14}
            agreeTerms={agreeTerms}
            agreeAI={agreeAI}
            agreeMarketing={agreeMarketing}
            onAge14Change={onAge14Change}
            onTermsChange={onTermsChange}
            onAIChange={onAIChange}
            onMarketingChange={onMarketingChange}
            onAgreeAll={onAgreeAll}
            onShowTerms={onShowTerms}
            onShowAI={onShowAI}
            error={termsError}
            showAgreeAllButton={false}
          />
        </div>
      </div>
    </div>
  );
}
