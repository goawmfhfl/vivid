/** workUnitAsyncStorage prerender 버그 회피 (Next.js 이슈) */
export const dynamic = "force-dynamic";

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
