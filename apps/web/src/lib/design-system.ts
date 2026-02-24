/**
 * 프로젝트 전역 디자인 시스템
 * 모든 컴포넌트에서 일관된 디자인을 유지하기 위한 중앙 집중식 디자인 토큰
 */

// ============================================
// 색상 팔레트
// ============================================
export const COLORS = {
  // Primary Colors - Sage / Olive Green (브랜드 그린 계열)
  primary: {
    50: "#f1f2ec",
    100: "#e4e6d9",
    200: "#d3d9c4",
    300: "#b9c0a3",
    400: "#9da688",
    500: "#7f8f7a", // 메인 세이지 그린
    600: "#6f7f68",
    700: "#5f6b3a", // 포인트 올리브 그린
    800: "#4b5530",
    900: "#343b22",
  },
  // Secondary Colors - Mustard Yellow (옐로우 포인트)
  secondary: {
    50: "#f6f0df",
    100: "#ecddb8",
    200: "#e0c68a",
    300: "#d4af5c",
    400: "#c89c42",
    500: "#b38e3a", // 머스터드 옐로우 (포인트)
    600: "#947331",
    700: "#735828",
    800: "#524020",
    900: "#342918",
  },
  // Accent Colors - Dusty / Navy Blue (블루 & 네이비 포인트)
  accent: {
    50: "#eef2f5",
    100: "#d8e0e9",
    200: "#bcc8d7",
    300: "#9caac1",
    400: "#7f8fa9",
    500: "#6f859c", // 더스티 블루
    600: "#5e7085",
    700: "#2e3a4f", // 네이비 블루
    800: "#242d3e",
    900: "#181f2b",
  },
  // 텍스트 색상
  text: {
    primary: "#2b2b2b",
    secondary: "#4b4b4b",
    tertiary: "#7a7a7a",
    muted: "#9a9a9a", // 더 연한 회색 (비활성/보조 텍스트용)
    inverse: "#f7f5f0",
    white: "#FFFFFF",
  },
  // 배경 색상
  background: {
    base: "#FAFAF8", // 메인 배경
    secondary: "#d8d3c7",
    card: "#f5f3ee",
    cardGradient: "linear-gradient(135deg, #f5f3ee 0%, #FAFAF8 100%)",
    cardElevated: "#ffffff",
    hover: "#e0ddd5",
    hoverLight: "#f5f3ee",
  },
  // Glassmorphism 전용 컬러
  glass: {
    surface: "rgba(255, 255, 255, 0.16)",
    surfaceStrong: "rgba(255, 255, 255, 0.22)",
    border: "rgba(255, 255, 255, 0.4)",
    highlight: "rgba(255, 255, 255, 0.7)",
    shadow: "rgba(16, 24, 40, 0.18)",
  },
  // 차트 전용 컬러
  chart: {
    alignment: "#7f8f7a",
    execution: "#5f6b3a",
    waveLight: "rgba(127, 143, 122, 0.55)",
    waveStrong: "rgba(127, 143, 122, 0.9)",
    glow: "rgba(127, 143, 122, 0.45)",
  },
  // 데일리 비비드 전용 컬러
  dailyVivid: {
    current: "#E5B96B",
    future: "#A3BFD9",
    currentText: "#B8860B",
    futureText: "#5A7A9A",
  },
  // Surface Colors (카드/모달 등)
  surface: {
    default: "#f5f3ee",
    elevated: "#ffffff",
    hover: "#e0ddd5",
  },
  // 테두리 색상
  border: {
    default: "#c4beb2",
    light: "#d8d3c7",
    card: "#c4beb2",
    input: "#c4beb2",
  },
  // 브랜드 색상 (Primary 그린 계열을 브랜드로 매핑)
  brand: {
    primary: "#7f8f7a", // 세이지 그린
    secondary: "#5f6b3a", // 올리브 그린
    light: "#b9c0a3",
    dark: "#4b5530",
  },
  // 주간 VIVID 전용 - 부드러운 하늘빛 (소프트 스카이 블루)
  weekly: {
    primary: "#7ab8ce", // 소프트 스카이 블루
    light: "#c8dde8", // 프로스티드 글라스 느낌 연한 블루
    dark: "#5a8e9e", // 뮤트 딥 스카이
  },
  // 월간 VIVID 전용 - 모던한 투명감 있는 보랏빛
  monthly: {
    primary: "#a89bc4", // 소프트 라벤더 (모던/투명감)
    light: "#e2deec", // 프로스티드 글라스 느낌 연한 퍼플
    dark: "#8b7a9e", // 리파인드 딥 라벤더
  },
  // 오늘의 할 일 & 피드백 섹션 전용 - 세련된 보랏빛
  todoFeedback: {
    primary: "#9b8bb5", // 소프트 바이올렛
    light: "#f0edf5", // 연한 라벤더 배경
    border: "#d4cce0", // 라벤더 테두리
    accent: "#b8a9d4", // 포인트 퍼플
  },
  // 상태 색상
  status: {
    success: "#7f8f7a",
    successLight: "#b9c0a3",
    successDark: "#5f6b3a",
    warning: "#b38e3a",
    warningLight: "#d4af5c",
    warningDark: "#735828",
    error: "#b5674a", // 테리코타
    errorLight: "#d58a6f",
    errorDark: "#8b4a35",
    info: "#6f859c", // 더스티 블루
  },
  // 섹션별 컬러 (월간 비비드 리포트용) - 새로운 색상 시스템 적용
  section: {
    summary: {
      primary: "#7f8f7a", // 세이지 그린
      gradient: "linear-gradient(135deg, #7f8f7a 0%, #5f6b3a 100%)",
      light: "#7f8f7a20",
      border: "#7f8f7a40",
    },
    insight: {
      primary: "#6f859c", // 더스티 블루
      gradient: "linear-gradient(135deg, #6f859c 0%, #5e7085 100%)",
      light: "#6f859c20",
      border: "#6f859c40",
    },
    feedback: {
      primary: "#5f6b3a", // 올리브 그린
      gradient: "linear-gradient(135deg, #5f6b3a 0%, #4b5530 100%)",
      light: "#5f6b3a20",
      border: "#5f6b3a40",
    },
    vision: {
      primary: "#2e3a4f", // 네이비 블루
      gradient: "linear-gradient(135deg, #2e3a4f 0%, #242d3e 100%)",
      light: "#2e3a4f20",
      border: "#2e3a4f40",
    },
    conclusion: {
      primary: "#7f8f7a", // 세이지 그린
      gradient: "linear-gradient(135deg, #7f8f7a 0%, #5f6b3a 100%)",
      light: "#7f8f7a20",
      border: "#7f8f7a40",
    },
    recovery: {
      primary: "#5d9aae", // 푸른 에메랄드 - 회복·힐링 톤
      gradient: "linear-gradient(135deg, #5d9aae 0%, #4a8799 100%)",
      light: "#5d9aae20",
      border: "#5d9aae40",
    },
  },
} as const;

// ============================================
// 폰트 시스템
// ============================================
export const FONTS = {
  sans: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
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
  glass: {
    backgroundColor: COLORS.glass.surface,
    border: `1px solid ${COLORS.glass.border}`,
    borderRadius: "24px",
    boxShadow: `0 16px 40px ${COLORS.glass.shadow}, inset 0 1px 0 ${COLORS.glass.highlight}`,
    backdropFilter: "blur(32px)",
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
// 그림자 시스템 (Elevation System)
// ============================================
export const SHADOWS = {
  elevation0: "none",
  elevation1: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  elevation2: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
  elevation3: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
  elevation4: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
  elevation5: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
  glowSoft: "0 12px 36px rgba(127, 143, 122, 0.25), 0 4px 12px rgba(127, 143, 122, 0.12)",
  glowStrong: "0 16px 44px rgba(127, 143, 122, 0.35), 0 6px 16px rgba(127, 143, 122, 0.2)",
  // Legacy aliases for backward compatibility
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  default: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
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
// 입력 필드 스타일
// ============================================
export const INPUT_STYLES = {
  textareaMinHeight: "min-h-[120px]",
} as const;

// ============================================
// 색상 유틸리티 함수
// ============================================
/**
 * HEX 색상을 RGBA 문자열로 변환
 * @param hex HEX 색상 코드 (예: "#6B7A6F" 또는 "6B7A6F")
 * @param alpha 투명도 (0-1)
 * @returns RGBA 문자열 (예: "rgba(107, 122, 111, 0.5)")
 */
export function hexToRgba(hex: string, alpha: number): string {
  // # 제거
  const cleanHex = hex.replace("#", "");

  // RGB 값 추출
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 색상을 어둡게 만드는 헬퍼 함수
 * @param hex HEX 색상 코드 (예: "#6B7A6F" 또는 "6B7A6F")
 * @param amount 어둡게 만들 정도 (0-1, 0.1 = 10% 어둡게)
 * @returns RGB 문자열 (예: "rgb(96, 110, 96)")
 */
export function darkenColor(hex: string, amount: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Math.max(0, parseInt(cleanHex.substring(0, 2), 16) - amount * 255);
  const g = Math.max(0, parseInt(cleanHex.substring(2, 4), 16) - amount * 255);
  const b = Math.max(0, parseInt(cleanHex.substring(4, 6), 16) - amount * 255);

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * 색상을 밝게 만드는 헬퍼 함수
 * @param hex HEX 색상 코드 (예: "#6B7A6F" 또는 "6B7A6F")
 * @param amount 밝게 만들 정도 (0-1, 0.1 = 10% 밝게)
 * @returns RGB 문자열 (예: "rgb(139, 154, 139)")
 */
export function lightenColor(hex: string, amount: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Math.min(
    255,
    parseInt(cleanHex.substring(0, 2), 16) + amount * 255
  );
  const g = Math.min(
    255,
    parseInt(cleanHex.substring(2, 4), 16) + amount * 255
  );
  const b = Math.min(
    255,
    parseInt(cleanHex.substring(4, 6), 16) + amount * 255
  );

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// ============================================
// 그라디언트 생성 유틸리티
// ============================================
/**
 * 그라디언트 스타일 생성 유틸리티
 * 컨테이너 컴포넌트에서 일관된 그라디언트 스타일을 생성하기 위한 함수들
 */
export const GRADIENT_UTILS = {
  /**
   * 카드 배경용 그라디언트 생성
   * 색상에서 흰색으로 페이드되는 그라디언트
   * @param color 기본 색상 (HEX)
   * @param opacity 시작 색상의 투명도 (기본: 0.12)
   * @param endColor 끝 색상 (기본: 흰색)
   * @returns linear-gradient 문자열
   */
  cardBackground: (
    color: string,
    opacity: number = 0.12,
    endColor: string = "rgb(255, 255, 255)"
  ): string => {
    return `linear-gradient(135deg, ${hexToRgba(
      color,
      opacity
    )} 0%, ${endColor} 100%)`;
  },

  /**
   * 배경 장식용 방사형 그라디언트 생성
   * 카드 배경 장식으로 사용되는 방사형 그라디언트
   * @param color 기본 색상 (HEX)
   * @param opacity 시작 색상의 투명도 (기본: 0.8)
   * @param size 그라디언트 크기 비율 (기본: 70%)
   * @returns radial-gradient 문자열
   */
  decoration: (
    color: string,
    opacity: number = 0.8,
    size: number = 70
  ): string => {
    return `radial-gradient(circle, ${hexToRgba(
      color,
      opacity
    )} 0%, transparent ${size}%)`;
  },

  /**
   * 아이콘 배지용 그라디언트 생성
   * 아이콘 배경에 사용되는 그라디언트
   * @param color 기본 색상 (HEX)
   * @param darkenAmount 어둡게 만들 정도 (기본: 0.1)
   * @returns linear-gradient 문자열
   */
  iconBadge: (color: string, darkenAmount: number = 0.1): string => {
    return `linear-gradient(135deg, ${color} 0%, ${darkenColor(
      color,
      darkenAmount
    )} 100%)`;
  },

  /**
   * 테두리 색상 생성
   * 기본 색상에서 투명도를 적용한 테두리 색상
   * @param color 기본 색상 (HEX)
   * @param opacity 투명도 (기본: 0.25, 16진수로는 40)
   * @returns HEX 색상 문자열 (투명도 포함)
   */
  borderColor: (color: string, opacity: string = "40"): string => {
    return `${color}${opacity}`;
  },
} as const;

// ============================================
// 레거시 호환성 (월간 비비드 리포트용)
// ============================================
// 기존 코드와의 호환성을 위해 유지
export const SECTION_COLORS = COLORS.section;
export const COMMON_COLORS = {
  text: COLORS.text,
  background: COLORS.background,
  border: COLORS.border,
};
