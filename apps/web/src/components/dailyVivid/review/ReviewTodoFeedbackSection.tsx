import { MessageSquare } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { hexToRgbTriplet } from "../colorUtils";
import type { ReviewSectionProps } from "./types";

export function ReviewTodoFeedbackSection({ view }: ReviewSectionProps) {
  const todoFeedback = view.todo_feedback ?? [];
  if (todoFeedback.length === 0) return null;

  return (
    <ScrollAnimation delay={340}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.primary}DD 100%)`,
              boxShadow: `0 4px 12px ${COLORS.brand.primary}40`,
            }}
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            투두 피드백
          </h3>
        </div>
        <div className="space-y-4">
          {todoFeedback.map((fb, i) => (
            <div
              key={i}
              className="px-5 py-4 rounded-xl flex items-start gap-3 transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: `linear-gradient(135deg, rgba(${hexToRgbTriplet(COLORS.brand.primary)}, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)`,
                border: `1px solid ${COLORS.brand.primary}30`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: COLORS.brand.primary }}
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
    </ScrollAnimation>
  );
}
