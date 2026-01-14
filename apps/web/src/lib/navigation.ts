export type RouteRule =
  | { type: "exact"; value: string }
  | { type: "prefix"; value: string }
  | { type: "regex"; value: RegExp };

const bottomNavHiddenRules: RouteRule[] = [
  { type: "exact", value: "/login" },
  { type: "exact", value: "/signup" },
  { type: "exact", value: "/auth/reset-password" },
  { type: "prefix", value: "/admin" }, // 어드민 페이지에서 BottomNavigation 비활성화
  { type: "prefix", value: "/policy" }, // 정책 페이지에서 BottomNavigation 비활성화
];

export function shouldShowBottomNav(pathname: string): boolean {
  for (const rule of bottomNavHiddenRules) {
    if (rule.type === "exact" && pathname === rule.value) {
      return false;
    }
    if (rule.type === "prefix" && pathname.startsWith(rule.value)) {
      return false;
    }
    if (rule.type === "regex" && (rule.value as RegExp).test(pathname)) {
      return false;
    }
  }
  return true;
}

/**
 * Footer를 표시할지 여부를 결정
 * 서비스 이용 페이지(데일리/주간/월간 입력/조회, 리포트)에서는 숨기고,
 * 프로필, 설정, 로그인/회원가입 페이지에서는 보여줌
 */
const footerHiddenRules: RouteRule[] = [
  { type: "exact", value: "/" }, // 홈 (데일리 입력)
  { type: "regex", value: /^\/(\d{4}-\d{2}-\d{2})$/ }, // 날짜별 페이지
  { type: "prefix", value: "/reports" }, // 리포트 페이지
  { type: "prefix", value: "/analysis" }, // 분석 페이지
  { type: "prefix", value: "/logs" }, // 로그 페이지
  { type: "prefix", value: "/admin" }, // 어드민 페이지
];

export function shouldShowFooter(pathname: string): boolean {
  for (const rule of footerHiddenRules) {
    if (rule.type === "exact" && pathname === rule.value) {
      return false;
    }
    if (rule.type === "prefix" && pathname.startsWith(rule.value)) {
      return false;
    }
    if (rule.type === "regex" && (rule.value as RegExp).test(pathname)) {
      return false;
    }
  }
  return true;
}
