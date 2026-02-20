import { COLORS } from "@/lib/design-system";
import { hexToRgbTriplet } from "../colorUtils";

/** 회고 페이지 전체 섹션 공통 색상 */
export const REVIEW_ACCENT = COLORS.chart.execution;
export const REVIEW_ACCENT_RGB = hexToRgbTriplet(REVIEW_ACCENT);

/** 섹션 헤더 스타일 (아이콘 + 타이틀) */
export const SECTION_HEADER_ICON_STYLE = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${REVIEW_ACCENT} 0%, ${REVIEW_ACCENT}DD 100%)`,
  boxShadow: `0 4px 12px ${REVIEW_ACCENT}40`,
} as const;

/** 서브 카드 스타일 (라벨 + 내용) */
export const SUB_CARD_STYLE = {
  background: `linear-gradient(135deg, rgba(${REVIEW_ACCENT_RGB}, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)`,
  border: `1px solid ${REVIEW_ACCENT}30`,
  borderRadius: 16,
} as const;

/** 리스트 아이템 스타일 */
export const LIST_ITEM_STYLE = {
  background: `rgba(${REVIEW_ACCENT_RGB}, 0.06)`,
  border: `1px solid rgba(${REVIEW_ACCENT_RGB}, 0.2)`,
} as const;

export const LIST_ITEM_MUTED_STYLE = {
  background: `rgba(${REVIEW_ACCENT_RGB}, 0.03)`,
  border: `1px solid rgba(${REVIEW_ACCENT_RGB}, 0.12)`,
} as const;
