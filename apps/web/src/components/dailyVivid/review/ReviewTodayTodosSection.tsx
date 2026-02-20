"use client";

import { CheckCircle2, Circle, ListTodo } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ChartGlassCard } from "../analysisShared";
import { CircularProgress } from "../../ui/CircularProgress";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ReviewSectionHeader } from "./ReviewSectionHeader";
import {
  REVIEW_ACCENT,
  REVIEW_ACCENT_RGB,
  LIST_ITEM_STYLE,
  LIST_ITEM_MUTED_STYLE,
} from "./reviewSectionStyles";
import type { TodoListItem } from "@/types/daily-vivid";

interface ReviewTodayTodosSectionProps {
  todoLists: TodoListItem[];
  isLoading?: boolean;
  renderAddToScheduleButton: (contents: string) => React.ReactNode;
  renderRescheduleButton: (item: TodoListItem) => React.ReactNode;
}

/** 오늘의 투두리스트 - todo_list_items 데이터 기반 (마운트 시 별도 조회) */
export function ReviewTodayTodosSection({
  todoLists,
  isLoading = false,
  renderAddToScheduleButton,
  renderRescheduleButton,
}: ReviewTodayTodosSectionProps) {
  if (isLoading) {
    return (
      <ScrollAnimation delay={180}>
        <div className="mb-12">
          <ReviewSectionHeader icon={ListTodo} title="오늘의 투두리스트" />
          <ChartGlassCard gradientColor={REVIEW_ACCENT_RGB}>
            <div className="space-y-4">
              <div
                className="h-24 rounded-xl animate-pulse"
                style={{ backgroundColor: `${REVIEW_ACCENT}10` }}
              />
              <div
                className="h-12 rounded-xl animate-pulse"
                style={{ backgroundColor: `${REVIEW_ACCENT}08` }}
              />
              <div
                className="h-12 rounded-xl animate-pulse"
                style={{ backgroundColor: `${REVIEW_ACCENT}08` }}
              />
            </div>
          </ChartGlassCard>
        </div>
      </ScrollAnimation>
    );
  }
  if (todoLists.length === 0) return null;

  const completedItems = todoLists.filter((t) => t.is_checked);
  const uncompletedItems = todoLists.filter((t) => !t.is_checked && !t.scheduled_at);
  const total = todoLists.length;
  const checked = completedItems.length;
  const executionScore = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <ScrollAnimation delay={180}>
      <div className="mb-60">
        <ReviewSectionHeader icon={ListTodo} title="오늘의 투두리스트" />
        <ChartGlassCard gradientColor={REVIEW_ACCENT_RGB}>
          {/* 실행 점수 시각화 */}
          <div
            className="mb-6 px-5 py-5 rounded-xl flex flex-col sm:flex-row items-center gap-6"
            style={LIST_ITEM_STYLE}
          >
            <div className="flex-shrink-0">
              <CircularProgress
                percentage={executionScore}
                size={100}
                strokeWidth={8}
                showText={true}
                textSize="lg"
                animated={true}
                duration={1200}
                strokeColor={REVIEW_ACCENT}
                textColor={REVIEW_ACCENT}
              />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase mb-1"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                오늘의 할 일 실행 점수
              </p>
              <p
                className={cn(TYPOGRAPHY.body.fontSize)}
                style={{ color: COLORS.text.muted }}
              >
                완료 {checked}개 / 전체 {total}개
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 완료한 일 */}
            {completedItems.length > 0 && (
              <div className="space-y-1.5">
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase px-1"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  완료한 일
                </p>
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                    style={LIST_ITEM_STYLE}
                  >
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: REVIEW_ACCENT }}
                    />
                    <span
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        "flex-1 min-w-0 break-words"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {item.contents}
                    </span>
                    {renderAddToScheduleButton(item.contents)}
                  </div>
                ))}
              </div>
            )}

            {/* 미완료한 일 */}
            {uncompletedItems.length > 0 && (
              <div className="space-y-1.5">
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase px-1"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  미완료한 일
                </p>
                {uncompletedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                    style={LIST_ITEM_MUTED_STYLE}
                  >
                    <Circle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: COLORS.text.muted }}
                    />
                    <span
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        "flex-1 min-w-0 break-words"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {item.contents}
                    </span>
                    {renderRescheduleButton(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
