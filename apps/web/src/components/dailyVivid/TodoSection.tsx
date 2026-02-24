"use client";

import { ListTodo, Loader2, Check } from "lucide-react";
import { SectionProps } from "./types";
import { COLORS, TYPOGRAPHY, SHADOWS, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { hexToRgbTriplet } from "./colorUtils";
import type { TodoListItem } from "@/types/daily-vivid";

const C = COLORS.todoFeedback;
const C_RGB = hexToRgbTriplet(C.primary);

/** 읽기 전용 투두 아이템 */
function TodoItem({ item }: { item: TodoListItem }) {
  const isChecked = item.is_checked;

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 py-3.5 px-2 -mx-2 rounded-lg transition-colors duration-150",
        "hover:bg-white/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 border-2 transition-all duration-200"
        )}
        style={{
          borderColor: isChecked ? C.primary : C.border,
          backgroundColor: isChecked ? C.primary : "transparent",
        }}
      >
        {isChecked && (
          <Check
            className="w-2.5 h-2.5"
            strokeWidth={3}
            style={{ color: COLORS.text.white }}
          />
        )}
      </div>
      <span
        className={cn(
          TYPOGRAPHY.bodySmall.fontSize,
          "flex-1 min-w-0 break-words leading-[1.5]"
        )}
        style={{
          color: isChecked ? COLORS.text.tertiary : COLORS.text.primary,
          textDecoration: isChecked ? "line-through" : "none",
          opacity: isChecked ? 0.75 : 1,
        }}
      >
        {item.contents || ""}
      </span>
    </div>
  );
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
        className={cn(TYPOGRAPHY.bodySmall.fontSize)}
        style={{ color: COLORS.text.secondary }}
      >
        오늘의 할 일을 생성하고 있어요
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-14 text-center">
      <p
        className={cn(TYPOGRAPHY.bodySmall.fontSize)}
        style={{ color: COLORS.text.tertiary }}
      >
        할 일이 없습니다
      </p>
    </div>
  );
}

export function TodoSection({ view, todoLists, isGeneratingTodo }: SectionProps) {
  if (!todoLists && !isGeneratingTodo) return null;

  const hasItems = todoLists && todoLists.length > 0;
  const showLoading = isGeneratingTodo && !hasItems;

  const containerStyle = {
    background: `linear-gradient(135deg, rgba(${C_RGB}, 0.18) 0%, rgba(${C_RGB}, 0.08) 45%, ${COLORS.glass.surface} 100%)`,
    border: `1px solid rgba(${C_RGB}, 0.35)`,
    borderRadius: "24px",
    boxShadow: `${SHADOWS.glowSoft}, inset 0 1px 0 ${COLORS.glass.highlight}`,
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)" as const,
  };

  return (
    <ScrollAnimation delay={180}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primary}DD 100%)`,
              boxShadow: `0 4px 12px ${C.primary}40`,
            }}
          >
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            오늘의 할 일
          </h3>
        </div>

        <div className="p-6 sm:p-7 relative overflow-hidden rounded-[24px]" style={containerStyle}>
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
            {showLoading ? (
              <LoadingState />
            ) : hasItems ? (
              <div className="-mx-2 py-1">
                {todoLists!.map((item) => (
                  <TodoItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-3")}
          style={{ color: COLORS.text.tertiary, lineHeight: 1.5 }}
        >
          할 일 추가, 완료 체크, 순서 변경은{' '}
          <span style={{ color: COLORS.text.secondary }}>할 일</span> 탭에서 편하게
          관리할 수 있어요.
        </p>
      </div>
    </ScrollAnimation>
  );
}
