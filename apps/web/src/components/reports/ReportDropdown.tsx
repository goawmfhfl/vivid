"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/lib/design-system";

interface ReportDropdownProps {
  label: string;
  items: string[];
  accentColor: string;
  defaultOpen?: boolean;
}

const MAX_ITEMS = 5;

/**
 * 섹션별 리스트를 드롭다운으로 표시. 클릭 시 펼쳐서 전체 텍스트 확인.
 * 열림/닫힘 시 max-height, opacity 애니메이션 적용.
 */
export function ReportDropdown({
  label,
  items,
  accentColor,
  defaultOpen = false,
}: ReportDropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const list = (items || []).slice(0, MAX_ITEMS);
  if (!list.length) return null;

  return (
    <div
      className="rounded-lg overflow-hidden border transition-colors duration-200"
      style={{
        borderColor: open ? `${accentColor}40` : COLORS.border.light,
        backgroundColor: open ? `${accentColor}08` : "transparent",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 py-2.5 px-3 text-left"
        style={{ color: COLORS.text.primary }}
      >
        <span className="text-sm font-medium">
          {label}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out"
          style={{
            color: COLORS.text.muted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{
          maxHeight: open ? 320 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <ul
          className="px-3 pb-3 pt-0 space-y-2 border-t"
          style={{ borderColor: COLORS.border.light }}
        >
          {list.map((item, i) => (
            <li key={i} className="flex items-start gap-2 pt-2 first:pt-3">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs sm:text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
