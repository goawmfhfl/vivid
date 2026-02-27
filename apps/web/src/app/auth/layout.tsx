/** workUnitAsyncStorage prerender 버그 회피 - auth 전체 적용 (Next.js 이슈) */
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
