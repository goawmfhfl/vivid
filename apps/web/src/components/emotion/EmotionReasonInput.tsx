"use client";

import { useId, useState, useRef, useEffect } from "react";
import { HelpCircle, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  COLORS,
  INPUT_STYLES,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
  hexToRgba,
} from "@/lib/design-system";

interface EmotionReasonInputProps {
  value: string;
  onChange: (value: string) => void;
  onHelpOpen: () => void;
  minEncourageLength?: number;
  accentColor?: string;
}


export function EmotionReasonInput({
  value,
  onChange,
  onHelpOpen,
  minEncourageLength = 10,
  accentColor = COLORS.brand.primary,
}: EmotionReasonInputProps) {
  const [showHelp, setShowHelp] = useState(false);
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const assistId = `${inputId}-assist`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleHelpToggle = () => {
    setShowHelp((prev) => !prev);
    onHelpOpen();
  };

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // help 버튼이나 다른 클릭 가능한 요소를 클릭한 경우는 제외
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="dialog"]') ||
      target.tagName === 'BUTTON'
    ) {
      return;
    }
    // textarea에 포커스
    textareaRef.current?.focus();
  };

  // textarea 높이 자동 조정
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [value]);

  // 종이 질감을 위한 색상 설정
  const defaultColors = {
    background: COLORS.background.card,
    border: COLORS.border.light,
    lineColor: "rgba(196, 190, 178, 0.12)",
    overlay: "rgba(127, 143, 122, 0.08)",
  };

  return (
    <div
      className={cn(
        "rounded-2xl emotion-reason-card relative overflow-hidden",
        SPACING.card.padding,
        "flex flex-col gap-6",
        "cursor-text"
      )}
      onClick={handleBoxClick}
      style={{
        backgroundColor: defaultColors.background,
        border: `1.5px solid ${defaultColors.border}`,
        borderRadius: "12px",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        position: "relative",
        overflow: "hidden",
        // 종이 질감 배경 패턴
        backgroundImage: `
          /* 가로 줄무늬 */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            ${defaultColors.lineColor} 27px,
            ${defaultColors.lineColor} 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
        "--emotion-accent": accentColor,
      } as React.CSSProperties}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />
      
      <div className="flex items-start justify-between gap-3 relative z-10 mb-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={inputId}
            className={cn(
              TYPOGRAPHY.body.fontSize,
              "font-semibold"
            )}
            style={{ 
              color: COLORS.text.primary,
              letterSpacing: "-0.01em",
            }}
          >
            지금 감정에 대해서 어떻게 생각하세요?
          </label>
          <span
            className={cn(TYPOGRAPHY.caption.fontSize)}
            style={{ 
              color: COLORS.text.tertiary,
              opacity: 0.7,
            }}
          >
            선택 사항
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleHelpToggle();
          }}
          aria-expanded={showHelp}
          aria-controls={helpId}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg",
            TRANSITIONS.default
          )}
          style={{
            color: COLORS.text.tertiary,
            backgroundColor: hexToRgba(COLORS.background.hover, 0.5),
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hexToRgba(COLORS.background.hover, 0.8);
            e.currentTarget.style.color = accentColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = hexToRgba(COLORS.background.hover, 0.5);
            e.currentTarget.style.color = COLORS.text.tertiary;
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
            "rounded-xl emotion-reason-help animate-emotion-reason-help relative z-10",
            SPACING.card.paddingSmall,
            TYPOGRAPHY.bodySmall.fontSize,
            TYPOGRAPHY.bodySmall.lineHeight
          )}
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.06)} 0%, ${hexToRgba(accentColor, 0.02)} 100%)`,
            border: `1px solid ${hexToRgba(accentColor, 0.15)}`,
            color: COLORS.text.secondary,
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="mb-2.5" style={{ color: COLORS.text.primary, fontWeight: "500" }}>
            이 한 줄은 감정 그 자체보다,
            <br />
            그 감정이 만들어진 배경을 이해하는 데
            도움을 줘요.
          </p>
          <p className="mb-2.5" style={{ opacity: 0.85 }}>
            기록이 쌓이면 감정 리포트에서
            <br />
            “아, 내가 이런 상황에서 이 감정을 느끼는구나”
            <br />
            라는 패턴을 발견할 수 있어요.
          </p>
          <p className="mb-2.5" style={{ opacity: 0.85 }}>
            조금 더 적어주면 AI가 감정을 더 깊이 해석해서
            <br />더 풍부한 인사이트를
            전해줘요.
          </p>
          <p style={{ opacity: 0.75 }}>짧아도 괜찮고, 길어도 좋아요.</p>
        </div>
      )}

      <div className="relative z-10">
        <Textarea
          ref={textareaRef}
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={`${helpId} ${assistId}`}
          className={cn(
            "w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0 rounded-none shadow-none",
            INPUT_STYLES.textareaMinHeight,
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.fontWeight
          )}
          style={{
            color: COLORS.text.primary,
            fontSize: "inherit",
            lineHeight: "28px", // 줄무늬 간격(28px)과 일치
            paddingTop: "2px", // 줄무늬와 정렬을 위한 미세 조정
            minHeight: "100px",
            backgroundColor: "transparent",
            transition: "height 0.1s ease-out",
          }}
        />
      </div>

      <div
        id={assistId}
        className={cn(
          "flex items-center justify-between pt-3 border-t relative z-10",
          TYPOGRAPHY.caption.fontSize
        )}
        style={{ 
          borderColor: hexToRgba(COLORS.border.light, 0.4),
        }}
      >
        <div className="flex items-center gap-2.5">
          {value.length >= minEncourageLength ? (
            <>
              <div 
                className="flex items-center justify-center w-5 h-5 rounded-full"
                style={{
                  backgroundColor: hexToRgba(COLORS.status.success, 0.12),
                }}
              >
                <Check className="h-3 w-3" style={{ color: COLORS.status.success }} />
              </div>
              <span 
                className="font-medium"
                style={{ 
                  color: COLORS.status.success,
                  letterSpacing: "-0.01em",
                }}
              >
                좋아요, 단서가 생겼어요
              </span>
            </>
          ) : (
            <span style={{ 
              color: COLORS.text.tertiary,
              opacity: 0.7,
            }}>
              한 줄이면 충분하지만, 상세하면 더 좋아요
            </span>
          )}
        </div>
        <span 
          className="font-semibold px-2.5 py-1 rounded-md"
          style={{ 
            color: value.length >= minEncourageLength 
              ? COLORS.status.success 
              : COLORS.text.secondary,
            backgroundColor: hexToRgba(COLORS.background.hover, 0.4),
            minWidth: "2.5rem",
            textAlign: "right",
          }}
        >
          {value.length}자
        </span>
      </div>
    </div>
  );
}
