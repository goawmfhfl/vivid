"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserError, useCurrentUser } from "@/hooks/useCurrentUser";
import { getLoginFullUrl } from "@/lib/navigation";

/**
 * 인증이 필요한 페이지를 보호하는 고차 컴포넌트 (HOC)
 * useSearchParams 사용으로 인해 Suspense 경계 내부에서 렌더링됩니다.
 *
 * 사용법:
 * ```tsx
 * export default withAuth(MyPageComponent);
 * ```
 *
 * @param Component - 보호할 컴포넌트
 * @returns 인증 확인 후 렌더링되는 컴포넌트
 */
function AuthenticatedInner<P extends object>({
  Component,
  props,
}: {
  Component: React.ComponentType<P>;
  props: P;
}) {
  const searchParams = useSearchParams();
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (error || !user) {
        const loginUrl = getLoginFullUrl(searchParams);
        const isInvalidRefreshToken =
          error instanceof UserError && error.code === "INVALID_REFRESH_TOKEN";
        if (isInvalidRefreshToken) {
          void supabase.auth.signOut();
        }
        window.location.href = loginUrl;
      }
    }
  }, [isLoading, error, user, searchParams]);

  if (isLoading || error || !user) {
    return null;
  }

  // 인증된 경우 원래 컴포넌트 렌더링
  return <Component {...props} />;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuthWrapper(props: P) {
    return (
      <Suspense fallback={null}>
        <AuthenticatedInner Component={Component} props={props} />
      </Suspense>
    );
  };
}
