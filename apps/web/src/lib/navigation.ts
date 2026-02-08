/**
 * 로그인 페이지 경로 생성. 앱 WebView에서 embed=1/source=app을 유지해 애플 로그인 버튼이 보이도록 함.
 */
export function getLoginPath(
  currentParams?: URLSearchParams | { get(key: string): string | null } | null,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
  }
  if (currentParams) {
    const embed = currentParams.get("embed");
    const source = currentParams.get("source");
    if (embed) params.set("embed", embed);
    if (source) params.set("source", source);
  }
  const q = params.toString();
  return q ? `/login?${q}` : "/login";
}

/**
 * 현재 오리진 기준 로그인 페이지 전체 URL.
 * 로그아웃 시 사용하면 Expo Go 등에서 프로덕션으로 튕기지 않고 로컬과 동일하게 테스트 가능.
 */
export function getLoginFullUrl(
  currentParams?: URLSearchParams | { get(key: string): string | null } | null,
  extra?: Record<string, string>
): string {
  if (typeof window === "undefined") return getLoginPath(currentParams, extra);
  const path = getLoginPath(currentParams, extra);
  const base = window.location.origin.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 이메일 로그인 페이지 경로. 앱 WebView에서 embed/source 유지 */
export function getLoginEmailPath(
  currentParams?: URLSearchParams | { get(key: string): string | null } | null
): string {
  const params = new URLSearchParams();
  if (currentParams) {
    const embed = currentParams.get("embed");
    const source = currentParams.get("source");
    if (embed) params.set("embed", embed);
    if (source) params.set("source", source);
  }
  const q = params.toString();
  return q ? `/login/email?${q}` : "/login/email";
}

export type RouteRule =
  | { type: "exact"; value: string }
  | { type: "prefix"; value: string }
  | { type: "regex"; value: RegExp };

const bottomNavHiddenRules: RouteRule[] = [
  { type: "prefix", value: "/login" }, // /login, /login/email
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
  { type: "prefix", value: "/login" }, // 로그인 랜딩·이메일 로그인 (개인정보처리방침 미노출)
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
