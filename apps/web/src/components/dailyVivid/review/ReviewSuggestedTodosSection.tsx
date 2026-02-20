import { CalendarPlus } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { hexToRgbTriplet } from "../colorUtils";
import type { ReviewSuggestedTodosSectionProps } from "./types";

export function ReviewSuggestedTodosSection({
  view,
  renderAddToScheduleButton,
}: ReviewSuggestedTodosSectionProps) {
  const suggestedTodos = view.suggested_todos_for_tomorrow;
  if (!suggestedTodos || !suggestedTodos.items?.length) return null;

  return (
    <ScrollAnimation delay={360}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.secondary} 0%, ${COLORS.brand.secondary}DD 100%)`,
              boxShadow: `0 4px 12px ${COLORS.brand.secondary}40`,
            }}
          >
            <CalendarPlus className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            내일을 위한 할 일 제안
          </h3>
        </div>
        <div
          className="px-5 py-4 rounded-xl mb-4"
          style={{
            background: `linear-gradient(135deg, rgba(${hexToRgbTriplet(COLORS.brand.secondary)}, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)`,
            border: `1px solid ${COLORS.brand.secondary}30`,
          }}
        >
          <p
            className={cn(TYPOGRAPHY.label.fontSize, "mb-2")}
            style={{ color: COLORS.text.secondary }}
          >
            권장 이유
          </p>
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.primary }}
          >
            {suggestedTodos.reason}
          </p>
        </div>
        <div className="space-y-1.5">
          {suggestedTodos.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg min-w-0"
              style={{
                background: `rgba(${hexToRgbTriplet(COLORS.brand.secondary)}, 0.06)`,
                border: `1px solid ${COLORS.brand.secondary}20`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS.brand.secondary }}
              />
              <span
                className={cn(TYPOGRAPHY.body.fontSize, "flex-1 min-w-0 break-words")}
                style={{ color: COLORS.text.primary }}
              >
                {item}
              </span>
              {renderAddToScheduleButton(item)}
            </div>
          ))}
        </div>
      </div>
    </ScrollAnimation>
  );
}
