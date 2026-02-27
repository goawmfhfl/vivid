/** workUnitAsyncStorage prerender 버그 회피 - admin 전체 적용 (Next.js 이슈) */
export const dynamic = "force-dynamic";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
