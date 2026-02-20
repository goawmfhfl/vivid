"use client";

import { CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ChartGlassCard } from "../analysisShared";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { hexToRgbTriplet } from "../colorUtils";
import type { TodoListItem } from "@/types/daily-vivid";
import type { DailyReportData } from "../types";

const executionColor = COLORS.chart.execution;
const executionGradientColor = hexToRgbTriplet(executionColor);

const itemBaseStyle = {
  background: `rgba(${executionGradientColor}, 0.06)`,
  border: `1px solid rgba(${executionGradientColor}, 0.2)`,
} as const;

const uncompletedItemStyle = {
  background: `rgba(${executionGradientColor}, 0.03)`,
  border: `1px solid rgba(${executionGradientColor}, 0.12)`,
} as const;

interface ReviewTodayTodosSectionProps {
  view: DailyReportData;
  todoLists: TodoListItem[];
  renderAddToScheduleButton: (contents: string) => React.ReactNode;
  renderRescheduleButton: (item: TodoListItem) => React.ReactNode;
}

export function ReviewTodayTodosSection({
  view,
  todoLists,
  renderAddToScheduleButton,
  renderRescheduleButton,
}: ReviewTodayTodosSectionProps) {
  const dailySummary = view.daily_summary ?? "";
  const completedTodos = view.completed_todos ?? [];
  const uncompletedTodos = view.uncompleted_todos ?? [];
  const uncompletedItems = todoLists.filter((t) => !t.is_checked && !t.scheduled_at);
  const hasUncompletedItems = uncompletedItems.length > 0;
  const hasUncompletedTodosOnly = uncompletedTodos.length > 0 && !hasUncompletedItems;

  const hasContent = dailySummary || completedTodos.length > 0 || hasUncompletedItems || hasUncompletedTodosOnly;
  if (!hasContent) return null;

  return (
    <ScrollAnimation delay={260}>
      <div className="mb-60">
        <ChartGlassCard gradientColor={executionGradientColor}>
          <div className="space-y-4">
            {/* 오늘 한 일 요약 */}
            {dailySummary && (
              <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl min-w-0"
                style={itemBaseStyle}
              >
                <MessageSquare
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: executionColor }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(TYPOGRAPHY.label.fontSize, "mb-1.5")}
                    style={{ color: COLORS.text.secondary }}
                  >
                    오늘 한 일 요약
                  </p>
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {dailySummary}
                  </p>
                </div>
              </div>
            )}

            {/* 완료한 일 */}
            {completedTodos.length > 0 && (
              <div className="space-y-1.5">
                <p
                  className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, "px-1")}
                  style={{ color: COLORS.text.secondary }}
                >
                  완료한 일
                </p>
                {completedTodos.map((todo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                    style={itemBaseStyle}
                  >
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: executionColor }}
                    />
                    <span
                      className={cn(TYPOGRAPHY.body.fontSize, "flex-1 min-w-0 break-words")}
                      style={{ color: COLORS.text.primary }}
                    >
                      {todo}
                    </span>
                    {renderAddToScheduleButton(todo)}
                  </div>
                ))}
              </div>
            )}

            {/* 미완료한 일 */}
            {(hasUncompletedItems || hasUncompletedTodosOnly) && (
              <div className="space-y-1.5">
                <p
                  className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, "px-1")}
                  style={{ color: COLORS.text.secondary }}
                >
                  미완료한 일
                </p>
                {hasUncompletedItems &&
                  uncompletedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                      style={uncompletedItemStyle}
                    >
                      <Circle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: COLORS.text.muted }}
                      />
                      <span
                        className={cn(TYPOGRAPHY.body.fontSize, "flex-1 min-w-0 break-words")}
                        style={{ color: COLORS.text.primary }}
                      >
                        {item.contents}
                      </span>
                      {renderRescheduleButton(item)}
                    </div>
                  ))}
                {hasUncompletedTodosOnly &&
                  uncompletedTodos.map((todo, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-0"
                      style={uncompletedItemStyle}
                    >
                      <Circle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: COLORS.text.muted }}
                      />
                      <span
                        className={cn(TYPOGRAPHY.body.fontSize, "flex-1 min-w-0 break-words")}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {todo}
                      </span>
                      {renderAddToScheduleButton(todo)}
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
