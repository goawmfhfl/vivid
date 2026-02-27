import { ClientProviders } from "./ClientProviders";

/**
 * 앱 본문 레이아웃 - Provider/BottomNav/GlobalModals 적용.
 * /404 요청 시 이 layout은 사용되지 않음 (루트 layout > not-found 직렬).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
