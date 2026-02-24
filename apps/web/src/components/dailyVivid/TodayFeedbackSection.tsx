"use client";

import { MessageSquare, Loader2 } from "lucide-react";
import { COLORS, TYPOGRAPHY, SHADOWS, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { hexToRgbTriplet } from "./colorUtils";
import type {
  TodayFeedbackContent,
  TodayFeedbackSuggestions,
} from "@/types/daily-vivid";

const C = COLORS.todoFeedback;
const C_RGB = hexToRgbTriplet(C.primary);

/** suggestions 정규화 (레거시 string[] 형식 호환) */
function normalizeSuggestions(
  s: TodayFeedbackContent["suggestions"]
): TodayFeedbackSuggestions {
  if (!s) return { growth: [], rest: [] };
  if (Array.isArray(s))
    return { growth: s.filter((x): x is string => typeof x === "string"), rest: [] };
  return {
    growth: Array.isArray(s.growth) ? s.growth : [],
    rest: Array.isArray(s.rest) ? s.rest : [],
  };
}

interface TodayFeedbackSectionProps {
  todayFeedback: TodayFeedbackContent | null | undefined;
  isLoading: boolean;
  isGeneratingTodo?: boolean;
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-14">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${C.primary}18` }}
      >
        <Loader2
          className="w-5 h-5 animate-spin"
          style={{ color: C.primary }}
        />
      </div>
      <p
        className={cn(TYPOGRAPHY.body.fontSize)}
        style={{ color: COLORS.text.secondary }}
      >
        오늘의 피드백을 생성하고 있어요
      </p>
    </div>
  );
}

function FeedbackBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="space-y-2">
      <h3
        className={cn(
          TYPOGRAPHY.body.fontSize,
          TYPOGRAPHY.body.fontWeight,
          "flex items-center gap-2"
        )}
        style={{ color: COLORS.text.primary }}
      >
        <span
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: C.primary }}
        />
        {title}
      </h3>
      <p
        className={cn(
          TYPOGRAPHY.bodySmall.fontSize,
          TYPOGRAPHY.bodySmall.lineHeight,
          "mt-1"
        )}
        style={{ color: COLORS.text.secondary }}
      >
        {content}
      </p>
    </div>
  );
}

function SuggestionList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3
        className={cn(
          TYPOGRAPHY.body.fontSize,
          TYPOGRAPHY.body.fontWeight,
          "flex items-center gap-2"
        )}
        style={{ color: COLORS.text.primary }}
      >
        <span
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: C.accent }}
        />
        {title}
      </h3>
      <ul className="space-y-2 mt-1">
        {items.map((s, i) => (
          <li
            key={i}
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              "flex items-start gap-2.5"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
              style={{ backgroundColor: C.border }}
            />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TodayFeedbackSection({
  todayFeedback,
  isLoading,
  isGeneratingTodo = false,
}: TodayFeedbackSectionProps) {
  const showLoading = isLoading || isGeneratingTodo;
  if (!showLoading && !todayFeedback) return null;

  const containerStyle = {
    background: `linear-gradient(135deg, rgba(${C_RGB}, 0.18) 0%, rgba(${C_RGB}, 0.08) 45%, ${COLORS.glass.surface} 100%)`,
    border: `1px solid rgba(${C_RGB}, 0.35)`,
    borderRadius: "24px",
    boxShadow: `${SHADOWS.glowSoft}, inset 0 1px 0 ${COLORS.glass.highlight}`,
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)" as const,
  };

  return (
    <ScrollAnimation delay={200}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primary}DD 100%)`,
              boxShadow: `0 4px 12px ${C.primary}40`,
            }}
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            오늘의 피드백
          </h3>
        </div>

        {showLoading ? (
          <div
            className="p-6 sm:p-7 relative overflow-hidden rounded-[24px]"
            style={containerStyle}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-12 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 80% 20%, rgba(${C_RGB}, 0.28) 0%, transparent 60%)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 opacity-8 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 80%, rgba(${C_RGB}, 0.2) 0%, transparent 50%)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: `linear-gradient(120deg, ${hexToRgba(COLORS.text.white, 0.35)} 0%, ${hexToRgba(COLORS.text.white, 0.08)} 35%, transparent 60%)`,
              }}
            />
            <div className="relative z-10">
              <LoadingState />
            </div>
          </div>
        ) : todayFeedback ? (
          <div
            className="p-6 sm:p-7 relative overflow-hidden rounded-[24px] space-y-6"
            style={containerStyle}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-12 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 80% 20%, rgba(${C_RGB}, 0.28) 0%, transparent 60%)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 opacity-8 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 80%, rgba(${C_RGB}, 0.2) 0%, transparent 50%)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: `linear-gradient(120deg, ${hexToRgba(COLORS.text.white, 0.35)} 0%, ${hexToRgba(COLORS.text.white, 0.08)} 35%, transparent 60%)`,
              }}
            />
            <div className="relative z-10 space-y-6">
            {todayFeedback.past_context && (
                <FeedbackBlock
                  title="지금까지의 흐름"
                  content={todayFeedback.past_context}
                />
              )}

              {todayFeedback.direction_analysis && (
                <FeedbackBlock
                  title="방향성 분석"
                  content={todayFeedback.direction_analysis}
                />
              )}

              {(() => {
                const sug = normalizeSuggestions(todayFeedback.suggestions);
                const hasSuggestions =
                  sug.growth.length > 0 || sug.rest.length > 0;
                if (!hasSuggestions) return null;
                return (
                  <div className="space-y-5 pt-2">
                    <SuggestionList title="성장을 위한 제안" items={sug.growth} />
                    <SuggestionList title="휴식을 위한 제안" items={sug.rest} />
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}

        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-3")}
          style={{ color: COLORS.text.tertiary, lineHeight: 1.5 }}
        >
          AI가 드리는 피드백은 참고용이에요. 최종 결정은 여러분의 판단이 가장
          중요해요.
        </p>
      </div>
    </ScrollAnimation>
  );
}
