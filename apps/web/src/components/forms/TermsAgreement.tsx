"use client";

import { AlertCircle } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

interface TermsAgreementProps {
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
  onTermsChange: (checked: boolean) => void;
  onAIChange: (checked: boolean) => void;
  onMarketingChange: (checked: boolean) => void;
  onAgreeAll: (checked: boolean) => void;
  onShowTerms: () => void;
  onShowAI: () => void;
  error?: string;
}

export function TermsAgreement({
  agreeTerms,
  agreeAI,
  agreeMarketing,
  onTermsChange,
  onAIChange,
  onMarketingChange,
  onAgreeAll,
  onShowTerms,
  onShowAI,
  error,
}: TermsAgreementProps) {
  const allChecked = agreeTerms && agreeAI && agreeMarketing;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={agreeTerms}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="terms"
          className="flex-1 cursor-pointer"
          style={{ color: "#333333", fontSize: "0.9rem" }}
        >
          <span style={{ color: "#EF4444" }}>[필수]</span> 이용약관 및 개인정보
          수집·이용 동의{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onShowTerms();
            }}
            className="underline"
            style={{ color: "#6B7A6F" }}
          >
            (보기)
          </button>
        </label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="ai"
          checked={agreeAI}
          onCheckedChange={(checked) => onAIChange(checked === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="ai"
          className="flex-1 cursor-pointer"
          style={{ color: "#333333", fontSize: "0.9rem" }}
        >
          <span style={{ color: "#EF4444" }}>[필수]</span> AI 피드백 데이터 학습
          활용 동의{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onShowAI();
            }}
            className="underline"
            style={{ color: "#6B7A6F" }}
          >
            (보기)
          </button>
        </label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="marketing"
          checked={agreeMarketing}
          onCheckedChange={(checked) => onMarketingChange(checked === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="marketing"
          className="flex-1 cursor-pointer"
          style={{ color: "#333333", fontSize: "0.9rem" }}
        >
          <span style={{ color: "#6B7A6F" }}>[선택]</span> 마케팅 정보
          (문자·이메일) 수신 동의
          <p style={{ fontSize: "0.75rem", color: "#6B7A6F" }}>
            신규 기능, 서비스 팁, 이벤트 소식을 보내드려요.
          </p>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onAgreeAll(!allChecked)}
          className="w-full rounded-lg py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: allChecked ? "#6B7A6F" : "#D1D5DB",
            color: allChecked ? "white" : "white",
            opacity: allChecked ? 1 : 0.6,
          }}
        >
          전체 동의하기
        </button>
        <p
          className="mt-1 text-center"
          style={{ fontSize: "0.75rem", color: "#6B7A6F" }}
        >
          버튼을 누르면 필수·선택 항목이 모두 {allChecked ? "해제" : "동의"}
          됩니다.
        </p>
      </div>

      {error && (
        <p
          className="flex items-center gap-1"
          style={{ color: "#EF4444", fontSize: "0.8rem" }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
