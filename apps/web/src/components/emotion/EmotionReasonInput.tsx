"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { HelpCircle, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  COLORS,
  INPUT_STYLES,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/lib/design-system";

interface EmotionReasonInputProps {
  value: string;
  onChange: (value: string) => void;
  onHelpOpen: () => void;
  maxLengthSoft?: number;
  minEncourageLength?: number;
  accentColor?: string;
}

const PLACEHOLDERS = [
  "예) 회의가 예상보다 길어져서 많이 지쳤다",
  "예) 혼자 산책하며 생각이 정리됐다",
  "예) 별일 없었지만 하루가 무난했다",
];

export function EmotionReasonInput({
  value,
  onChange,
  onHelpOpen,
  maxLengthSoft = 120,
  minEncourageLength = 10,
  accentColor = COLORS.brand.primary,
}: EmotionReasonInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const assistId = `${inputId}-assist`;

  useEffect(() => {
    if (value.trim().length > 0) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [value]);

  const placeholder = useMemo(
    () => PLACEHOLDERS[placeholderIndex],
    [placeholderIndex]
  );

  const handleHelpToggle = () => {
    setShowHelp((prev) => !prev);
    onHelpOpen();
  };

  return (
    <div
      className={cn(
        "rounded-2xl border emotion-reason-card",
        SPACING.card.padding,
        "flex flex-col gap-5"
      )}
      style={{
        borderColor: COLORS.border.light,
        boxShadow: "0 16px 32px rgba(0,0,0,0.06)",
        "--emotion-accent": accentColor,
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={inputId}
          className={cn(
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.h4.fontWeight
          )}
          style={{ color: COLORS.text.primary }}
        >
          지금 감정을 만든 한 줄
          <span
            className={cn(TYPOGRAPHY.caption.fontSize, "ml-2")}
            style={{ color: COLORS.text.tertiary }}
          >
            (선택)
          </span>
        </label>
        <button
          type="button"
          onClick={handleHelpToggle}
          aria-expanded={showHelp}
          aria-controls={helpId}
          className={cn("flex items-center", TRANSITIONS.default)}
          style={{
            color: COLORS.text.tertiary,
            border: "none",
            borderRadius: "0px",
            padding: "0px",
            backgroundColor: "transparent",
          }}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {showHelp && (
        <div
          id={helpId}
          role="dialog"
          className={cn(
            "rounded-xl border emotion-reason-help animate-emotion-reason-help",
            SPACING.card.paddingSmall,
            TYPOGRAPHY.bodySmall.fontSize,
            TYPOGRAPHY.bodySmall.lineHeight
          )}
          style={{
            borderColor: COLORS.border.light,
            color: COLORS.text.secondary,
          }}
        >
          <p className="mb-2" style={{ color: COLORS.text.primary }}>
            이 한 줄은 감정 그 자체보다,
            <br />
            그 감정이 만들어진 배경을 이해하는 데
            도움을 줘요.
          </p>
          <p className="mb-2">
            기록이 쌓이면 감정 리포트에서
            <br />
            “아, 내가 이런 상황에서 이 감정을 느끼는구나”
            <br />
            라는 패턴을 발견할 수 있어요.
          </p>
          <p className="mb-2">
            조금 더 적어주면 AI가 감정을 더 깊이 해석해서
            <br />더 풍부한 인사이트를
            전해줘요.
          </p>
          <p>짧아도 괜찮고, 길어도 좋아요.</p>
        </div>
      )}

      <Textarea
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={`${helpId} ${assistId}`}
        className={cn(
            "w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0 rounded-none shadow-none",
          INPUT_STYLES.textareaMinHeight,
            TYPOGRAPHY.bodySmall.fontSize,
            TYPOGRAPHY.bodySmall.lineHeight,
            TYPOGRAPHY.bodySmall.fontWeight
        )}
        style={{
          color: COLORS.text.primary,
            fontSize: "inherit",
        }}
      />

      <div
        id={assistId}
        className={cn(
          "flex items-center justify-between",
          TYPOGRAPHY.caption.fontSize
        )}
        style={{ color: COLORS.text.muted }}
      >
        <div className="flex items-center gap-2">
          {value.length >= minEncourageLength ? (
            <>
              <Check className="h-4 w-4" style={{ color: COLORS.status.success }} />
              <span style={{ color: COLORS.status.success }}>
                좋아요, 단서가 생겼어요
              </span>
            </>
          ) : (
            <span>한 줄이면 충분하지만, 상세하면 더 좋아요</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>권장 {maxLengthSoft}자</span>
          <span>{value.length}자</span>
        </div>
      </div>
    </div>
  );
}
