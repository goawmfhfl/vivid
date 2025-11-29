/**
 * 프로젝트 전역 디자인 시스템
 * 모든 컴포넌트에서 일관된 디자인을 유지하기 위한 중앙 집중식 디자인 토큰
 */

// ============================================
// 색상 팔레트
// ============================================
export const COLORS = {
  // 텍스트 색상
  text: {
    primary: "#333333",
    secondary: "#4E4B46",
    tertiary: "#6B7A6F",
    muted: "#9CA3AF",
    white: "#FFFFFF",
  },
  // 배경 색상
  background: {
    base: "#FAFAF8",
    card: "#FFFFFF",
    cardGradient: "linear-gradient(135deg, #F5F7F5 0%, #F0F5F0 100%)",
    hover: "#F3F4F6",
    hoverLight: "#F9FAFB",
  },
  // 테두리 색상
  border: {
    default: "#E8E8E8",
    light: "#EFE9E3",
    card: "#E0E5E0",
    input: "#E5E7EB",
  },
  // 브랜드 색상 (그린 계열)
  brand: {
    primary: "#6B7A6F", // 다크 그린
    secondary: "#7C9A7C", // 미드 그린
    light: "#A8BBA8", // 라이트 그린
    dark: "#5A6B5A", // 더 다크 그린
  },
  // 상태 색상
  status: {
    success: "#10B981",
    error: "#DC2626",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  // 섹션별 컬러 (월간 피드백 리포트용)
  section: {
    summary: {
      primary: "#6B7A6F",
      gradient: "linear-gradient(135deg, #6B7A6F 0%, #5A6B5A 100%)",
      light: "#6B7A6F20",
      border: "#6B7A6F40",
    },
    emotion: {
      primary: "#7C9A7C",
      gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
      light: "#7C9A7C20",
      border: "#7C9A7C40",
    },
    insight: {
      primary: "#A8BBA8",
      gradient: "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
      light: "#A8BBA820",
      border: "#A8BBA840",
    },
    feedback: {
      primary: "#7C9A7C",
      gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
      light: "#7C9A7C20",
      border: "#7C9A7C40",
    },
    vision: {
      primary: "#7C9A7C",
      gradient: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
      light: "#7C9A7C20",
      border: "#7C9A7C40",
    },
    conclusion: {
      primary: "#6B7A6F",
      gradient: "linear-gradient(135deg, #6B7A6F 0%, #5A6B5A 100%)",
      light: "#6B7A6F20",
      border: "#6B7A6F40",
    },
  },
} as const;

// ============================================
// 타이포그래피
// ============================================
export const TYPOGRAPHY = {
  h1: {
    fontSize: "text-2xl sm:text-3xl",
    fontWeight: "font-bold",
    lineHeight: "leading-tight",
    color: COLORS.text.primary,
  },
  h2: {
    fontSize: "text-xl sm:text-2xl",
    fontWeight: "font-semibold",
    lineHeight: "leading-tight",
    color: COLORS.text.primary,
  },
  h3: {
    fontSize: "text-lg sm:text-xl",
    fontWeight: "font-semibold",
    lineHeight: "leading-tight",
    color: COLORS.text.primary,
  },
  h4: {
    fontSize: "text-base sm:text-lg",
    fontWeight: "font-semibold",
    lineHeight: "leading-tight",
    color: COLORS.text.primary,
  },
  body: {
    fontSize: "text-sm",
    fontWeight: "font-normal",
    lineHeight: "leading-relaxed",
    color: COLORS.text.secondary,
  },
  bodyLarge: {
    fontSize: "text-base",
    fontWeight: "font-normal",
    lineHeight: "leading-relaxed",
    color: COLORS.text.secondary,
  },
  bodySmall: {
    fontSize: "text-xs",
    fontWeight: "font-normal",
    lineHeight: "leading-relaxed",
    color: COLORS.text.tertiary,
  },
  label: {
    fontSize: "text-xs",
    fontWeight: "font-semibold",
    letterSpacing: "tracking-wide",
    textTransform: "uppercase",
    color: COLORS.text.tertiary,
  },
  caption: {
    fontSize: "text-xs",
    fontWeight: "font-normal",
    color: COLORS.text.muted,
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
    small: {
      fontSize: "text-lg",
      fontWeight: "font-semibold",
    },
  },
} as const;

// ============================================
// 간격 시스템
// ============================================
export const SPACING = {
  // 섹션 간격
  section: {
    marginTop: "32px",
    marginBottom: "mb-10 sm:mb-12",
    padding: "px-4 py-6",
  },
  // 카드 간격
  card: {
    padding: "p-5 sm:p-6",
    paddingSmall: "p-4",
    paddingLarge: "p-6 sm:p-8",
    borderRadius: "rounded-xl",
    gap: "gap-4",
    gapSmall: "gap-2",
    gapLarge: "gap-6",
  },
  // 요소 간격
  element: {
    gap: "gap-3",
    gapSmall: "gap-2",
    gapLarge: "gap-5",
    marginBottom: "mb-4",
    marginBottomSmall: "mb-2",
    marginBottomLarge: "mb-6",
  },
  // 페이지 간격
  page: {
    padding: "px-4 py-6",
    paddingHorizontal: "px-4 sm:px-6",
    paddingVertical: "py-6 sm:py-8",
    maxWidth: "max-w-3xl",
    maxWidthNarrow: "max-w-2xl",
  },
} as const;

// ============================================
// 카드 스타일
// ============================================
export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.background.card,
    border: `1.5px solid ${COLORS.border.default}`,
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  gradient: {
    background: COLORS.background.cardGradient,
    border: `1px solid ${COLORS.border.card}`,
    borderRadius: "16px",
  },
  withColor: (color: string) => ({
    backgroundColor: COLORS.background.card,
    border: `1.5px solid ${color}40`,
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }),
  hover: {
    transition: "transition-all duration-300",
    hoverShadow: "hover:shadow-lg",
    hoverScale: "hover:scale-[1.02]",
  },
} as const;

// ============================================
// 버튼 스타일
// ============================================
export const BUTTON_STYLES = {
  primary: {
    background: COLORS.brand.primary,
    color: COLORS.text.white,
    hover: `${COLORS.brand.primary}DD`,
    borderRadius: "rounded-xl",
    padding: "px-6 py-3",
  },
  secondary: {
    background: COLORS.brand.secondary,
    color: COLORS.text.white,
    hover: `${COLORS.brand.secondary}DD`,
    borderRadius: "rounded-xl",
    padding: "px-6 py-3",
  },
  ghost: {
    background: "transparent",
    color: COLORS.brand.primary,
    hover: COLORS.background.hover,
    borderRadius: "rounded-md",
    padding: "px-4 py-2",
  },
} as const;

// ============================================
// 아이콘 배지 스타일
// ============================================
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
  small: (color: string) => ({
    width: "w-8 h-8",
    borderRadius: "rounded-lg",
    background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
    boxShadow: `0 2px 4px ${color}30`,
  }),
} as const;

// ============================================
// 그림자 시스템
// ============================================
export const SHADOWS = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  default: "0 2px 8px rgba(0,0,0,0.04)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
} as const;

// ============================================
// 전환 효과
// ============================================
export const TRANSITIONS = {
  default: "transition-all duration-300",
  fast: "transition-all duration-200",
  slow: "transition-all duration-500",
  colors: "transition-colors duration-200",
} as const;

// ============================================
// 레거시 호환성 (월간 피드백 리포트용)
// ============================================
// 기존 코드와의 호환성을 위해 유지
export const SECTION_COLORS = COLORS.section;
export const COMMON_COLORS = {
  text: COLORS.text,
  background: COLORS.background,
  border: COLORS.border,
};
