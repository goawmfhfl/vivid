/**
 * /login/email 전용 동적 렌더링 강제.
 * LoginView의 useSearchParams()가 빌드 타임 정적 생성 시 workUnitAsyncStorage
 * 에러를 유발하므로, 이 경로만 force-dynamic 적용.
 */
export const dynamic = "force-dynamic";

export default function LoginEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
