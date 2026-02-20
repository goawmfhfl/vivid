"use client";

import { Lightbulb, MessageSquare, CalendarPlus } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ChartGlassCard } from "../analysisShared";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ReviewSectionHeader } from "./ReviewSectionHeader";
import {
  REVIEW_ACCENT,
  REVIEW_ACCENT_RGB,
  SUB_CARD_STYLE,
  LIST_ITEM_STYLE,
} from "./reviewSectionStyles";
import type { TodoListItem } from "@/types/daily-vivid";
import type { DailyReportData } from "../types";

interface ReviewSuggestionsSectionProps {
  view: DailyReportData;
  todoLists: TodoListItem[];
  renderAddToScheduleButton: (contents: string) => React.ReactNode;
}

/** 오늘의 투두리스트를 토대로 한 제안 섹션 (todo_feedback + suggested_todos_for_tomorrow) */
export function ReviewSuggestionsSection({
  view,
  todoLists,
  renderAddToScheduleButton,
}: ReviewSuggestionsSectionProps) {
  const todoFeedback = view.todo_feedback ?? [];
  const suggestedTodos = view.suggested_todos_for_tomorrow;
  const hasFeedback = todoFeedback.length > 0;
  const hasSuggested =
    suggestedTodos && suggestedTodos.items?.length > 0;

  if (!hasFeedback && !hasSuggested) return null;

  return (
    <ScrollAnimation delay={260}>
      <div className="mb-60">
        <ReviewSectionHeader icon={Lightbulb} title="오늘 한 일을 바탕으로 한 제안" />
        <ChartGlassCard gradientColor={REVIEW_ACCENT_RGB}>
          <div className="space-y-6">
            {/* 투두 피드백 */}
            {hasFeedback && (
              <div className="rounded-xl overflow-hidden p-5" style={SUB_CARD_STYLE}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4" style={{ color: REVIEW_ACCENT }} />
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    한 일 피드백
                  </p>
                </div>
                <div className="space-y-3">
                  {todoFeedback.map((fb, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: REVIEW_ACCENT }}
                      />
                      <p
                        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                        style={{ color: COLORS.text.primary }}
                      >
                        {fb}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 내일을 위한 할 일 제안 */}
            {hasSuggested && (
              <div className="rounded-xl overflow-hidden p-5" style={SUB_CARD_STYLE}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarPlus className="w-4 h-4" style={{ color: REVIEW_ACCENT }} />
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    내일을 위한 할 일 제안
                  </p>
                </div>
                <div className="space-y-4">
                  {suggestedTodos!.reason && (
                    <div>
                      <p
                        className={cn(TYPOGRAPHY.label.fontSize, "mb-1.5")}
                        style={{ color: COLORS.text.secondary }}
                      >
                        권장 이유
                      </p>
                      <p
                        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                        style={{ color: COLORS.text.primary }}
                      >
                        {suggestedTodos!.reason}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {suggestedTodos!.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                        style={LIST_ITEM_STYLE}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: REVIEW_ACCENT }}
                        />
                        <span
                          className={cn(
                            TYPOGRAPHY.body.fontSize,
                            "flex-1 min-w-0 break-words"
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {item}
                        </span>
                        {renderAddToScheduleButton(item)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
