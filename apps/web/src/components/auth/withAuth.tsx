"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserError, useCurrentUser } from "@/hooks/useCurrentUser";
import { getLoginFullUrl } from "@/lib/navigation";

/**
 * 인증이 필요한 페이지를 보호하는 고차 컴포넌트 (HOC)
 *
 * 사용법:
 * ```tsx
 * export default withAuth(MyPageComponent);
 * ```
 *
 * @param Component - 보호할 컴포넌트
 * @returns 인증 확인 후 렌더링되는 컴포넌트
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const searchParams = useSearchParams();
    const { data: user, isLoading, error } = useCurrentUser();

    useEffect(() => {
      // 로딩 중이 아닐 때만 인증 상태 확인
      if (!isLoading) {
        // 에러가 있거나 사용자가 없으면 로그인 페이지로 리다이렉트 (embed=1 유지로 앱에서 애플 로그인 노출)
        if (error || !user) {
          const loginUrl = getLoginFullUrl(searchParams);
          const isInvalidRefreshToken =
            error instanceof UserError && error.code === "INVALID_REFRESH_TOKEN";
          if (isInvalidRefreshToken) {
            void supabase.auth.signOut();
          }
          // 현재 오리진으로 이동해 Expo Go에서 프로덕션으로 튕기지 않도록 함
          window.location.href = loginUrl;
        }
      }
    }, [isLoading, error, user, searchParams]);

    // 로딩 중이거나 인증되지 않은 경우 아무것도 렌더링하지 않음
    if (isLoading || error || !user) {
      return null;
    }

    // 인증된 경우 원래 컴포넌트 렌더링
    return <Component {...props} />;
  };
}
