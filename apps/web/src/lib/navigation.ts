export type RouteRule =
  | { type: "exact"; value: string }
  | { type: "prefix"; value: string }
  | { type: "regex"; value: RegExp };

const bottomNavHiddenRules: RouteRule[] = [
  { type: "exact", value: "/login" },
  { type: "exact", value: "/signup" },
  { type: "exact", value: "/auth/reset-password" },
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
