/**
 * 월간 피드백 리포트 디자인 시스템
 * InsightOverviewSection의 색감과 스타일을 기준으로 통일된 디자인 시스템 정의
 */

// 섹션별 핵심 컬러
export const SECTION_COLORS = {
  summary: {
    primary: "#6B7A6F", // 다크 그린
    gradient: "linear-gradient(135deg, #6B7A6F 0%, #5A6B5A 100%)",
    light: "#6B7A6F20",
    border: "#6B7A6F40",
  },
  emotion: {
    primary: "#7C9A7C", // 미드 그린
    gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
    light: "#7C9A7C20",
    border: "#7C9A7C40",
  },
  insight: {
    primary: "#A8BBA8", // 라이트 그린 (참고)
    gradient: "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
    light: "#A8BBA820",
    border: "#A8BBA840",
  },
  feedback: {
    primary: "#7C9A7C", // 미드 그린
    gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
    light: "#7C9A7C20",
    border: "#7C9A7C40",
  },
  vision: {
    primary: "#7C9A7C", // 미드 그린
    gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
    light: "#7C9A7C20",
    border: "#7C9A7C40",
  },
  conclusion: {
    primary: "#6B7A6F", // 다크 그린
    gradient: "linear-gradient(135deg, #6B7A6F 0%, #5A6B5A 100%)",
    light: "#6B7A6F20",
    border: "#6B7A6F40",
  },
} as const;

// 공통 색상
export const COMMON_COLORS = {
  text: {
    primary: "#333333",
    secondary: "#4E4B46",
    tertiary: "#6B7A6F",
    muted: "#9CA3AF",
  },
  background: {
    base: "#FAFAF8",
    card: "white",
    cardGradient: "linear-gradient(135deg, #F5F7F5 0%, #F0F5F0 100%)",
  },
  border: {
    default: "#E8E8E8",
    light: "#EFE9E3",
    card: "#E0E5E0",
  },
} as const;

// 타이포그래피 스케일
export const TYPOGRAPHY = {
  h1: {
    fontSize: "text-2xl sm:text-3xl",
    fontWeight: "font-bold",
    lineHeight: "leading-tight",
  },
  h2: {
    fontSize: "text-xl sm:text-2xl",
    fontWeight: "font-semibold",
    lineHeight: "leading-tight",
  },
  h3: {
    fontSize: "text-lg sm:text-xl",
    fontWeight: "font-semibold",
    lineHeight: "leading-tight",
  },
  label: {
    fontSize: "text-xs",
    fontWeight: "font-semibold",
    letterSpacing: "tracking-wide",
    textTransform: "uppercase",
    color: COMMON_COLORS.text.tertiary,
  },
  body: {
    fontSize: "text-sm",
    fontWeight: "font-normal",
    lineHeight: "leading-relaxed",
    color: COMMON_COLORS.text.secondary,
  },
  bodySmall: {
    fontSize: "text-xs",
    fontWeight: "font-normal",
    lineHeight: "leading-relaxed",
    color: COMMON_COLORS.text.tertiary,
  },
  number: {
    large: {
      fontSize: "text-3xl sm:text-4xl",
      fontWeight: "font-bold",
    },
    medium: {
      fontSize: "text-2xl",
      fontWeight: "font-bold",
    },
  },
} as const;

// 간격 시스템
export const SPACING = {
  section: {
    marginTop: "32px",
    marginBottom: "mb-10 sm:mb-12",
  },
  card: {
    padding: "p-5 sm:p-6",
    borderRadius: "rounded-xl",
    gap: "gap-4",
  },
  element: {
    gap: "gap-3",
    gapSmall: "gap-2",
    gapLarge: "gap-5",
  },
} as const;

// 카드 스타일
export const CARD_STYLES = {
  default: {
    backgroundColor: COMMON_COLORS.background.card,
    border: `1.5px solid ${COMMON_COLORS.border.default}`,
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  gradient: {
    background: COMMON_COLORS.background.cardGradient,
    border: `1px solid ${COMMON_COLORS.border.card}`,
    borderRadius: "16px",
  },
  withColor: (color: string) => ({
    backgroundColor: COMMON_COLORS.background.card,
    border: `1.5px solid ${color}40`,
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }),
} as const;

// 아이콘 배지 스타일
export const ICON_BADGE_STYLES = {
  default: (color: string) => ({
    width: "w-10 h-10",
    borderRadius: "rounded-xl",
    background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
    boxShadow: `0 2px 8px ${color}30`,
  }),
  large: (color: string) => ({
    width: "w-12 h-12",
    borderRadius: "rounded-xl",
    background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
    boxShadow: `0 4px 12px ${color}30`,
  }),
} as const;
