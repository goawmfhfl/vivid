"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { updateLastLoginAt } from "@/lib/profile-utils";

const isProfileCompleted = (user: User) => {
  const metadata = user.user_metadata || {};
  return Boolean(
    metadata.name &&
      metadata.phone &&
      metadata.birthYear &&
      metadata.gender &&
      metadata.agreeTerms &&
      metadata.agreeAI
  );
};

/**
 * 카카오 로그인 시 phone_verified를 true로 설정
 * 카카오 OAuth는 휴대폰 인증이 완료된 상태이므로 이를 반영
 */
const syncPhoneVerificationStatus = async (user: User) => {
  const metadata = user.user_metadata || {};
  
  // 이미 phone_verified가 true인 경우 스킵
  if (metadata.phone_verified === true) {
    return;
  }
  
  // phone_verified를 true로 업데이트
  try {
    await supabase.auth.updateUser({
      data: {
        ...metadata,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      },
    });
    console.log("[OAuth Callback] phone_verified 상태가 true로 업데이트되었습니다.");
  } catch (error) {
    console.error("[OAuth Callback] phone_verified 업데이트 실패:", error);
  }
};

// 환경에 따른 리다이렉션 URL 생성 헬퍼 함수
const getRedirectUrl = (path: string): string => {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  const isProduction = runtimeEnv === "production";
  const isDevelopment = runtimeEnv === "development";

  let baseUrl: string;

  if (isProduction) {
    baseUrl = "https://vividlog.app";
  } else if (isDevelopment) {
    baseUrl = "http://localhost:3000";
  } else {
    // test 환경 또는 기타 환경
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : null) ||
      "http://localhost:3000";
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 파라미터에서 에러 확인 (Supabase OAuth 에러)
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          // 에러 로깅 (더 자세한 정보)
          const allParams = Object.fromEntries(searchParams.entries());
          console.error("[OAuth Callback Error]", {
            error: errorParam,
            errorCode,
            errorDescription,
            allParams,
            url: window.location.href,
          });

          // identity_already_exists 에러 처리
          if (errorCode === "identity_already_exists" || errorParam === "identity_already_exists") {
            const isLinkingFlow = searchParams.get("link") === "kakao";
            if (isLinkingFlow) {
              // 연동 플로우에서 발생한 에러: 현재 페이지에 머물면서 에러 메시지 표시
              // router.replace를 사용하여 클라이언트 사이드 라우팅 (페이지 새로고침 없음)
              router.replace(
                "/user?error=kakao_already_linked&message=" +
                  encodeURIComponent(
                    "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다. 다른 카카오 계정을 사용하거나 관리자에게 문의해주세요."
                  ),
                { scroll: false }
              );
              return;
            } else {
              // 로그인 플로우에서 발생한 에러
              const redirectUrl = getRedirectUrl(
                "/login?error=" +
                  encodeURIComponent(
                    "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다."
                  )
              );
              window.location.href = redirectUrl;
              return;
            }
          }

          // OAuth 코드 교환 실패 에러 처리 (더 구체적으로)
          const isCodeExchangeError =
            errorDescription?.includes("Unable to exchange external code") ||
            errorDescription?.includes("exchange") ||
            errorCode === "server_error" ||
            errorCode === "unexpected_failure";

          if (isCodeExchangeError) {
            const currentUrl = window.location.href;
            const expectedCallbackUrl = getRedirectUrl("/auth/callback");
            
            console.error("[OAuth Code Exchange Error]", {
              errorParam,
              errorCode,
              errorDescription,
              currentUrl,
              expectedCallbackUrl,
              suggestion: `
다음을 확인하세요:
1. Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs에 정확히 '${expectedCallbackUrl}' 추가
   - 와일드카드 사용: 'http://localhost:3000/**'
2. 카카오 개발자 콘솔 → Redirect URI 설정
   - '${expectedCallbackUrl}' 정확히 등록
3. Supabase OAuth Provider 설정 (Client ID/Secret) 확인
   - 공백 없이 정확히 복사했는지 확인
4. 브라우저 캐시 및 쿠키 삭제 후 재시도
              `,
            });
            const redirectUrl = getRedirectUrl(
              "/login?error=" +
                encodeURIComponent(
                  "카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                )
            );
            window.location.href = redirectUrl;
            return;
          }

          // 기타 에러 처리
          const errorMessage =
            errorDescription ||
            (errorCode === "server_error"
              ? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
              : "인증 중 오류가 발생했습니다.");
          const redirectUrl = getRedirectUrl(`/login?error=${encodeURIComponent(errorMessage)}`);
          window.location.href = redirectUrl;
          return;
        }

        // 세션 확인 전에 URL 파라미터 확인 (code, state 등)
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        
        console.log("[OAuth Callback]", {
          hasCode: !!code,
          hasState: !!state,
          allParams: Object.fromEntries(searchParams.entries()),
        });

        // OAuth 코드가 있으면 명시적으로 교환 시도
        if (code) {
          console.log("[OAuth Code Exchange]", { code: code.substring(0, 20) + "..." });
          const { data: exchangeData, error: exchangeError } = 
            await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("[Code Exchange Error]", {
              error: exchangeError.message,
              code: exchangeError.code,
              status: exchangeError.status,
            });
            // exchangeCodeForSession 실패 시에도 getSession 시도
          } else if (exchangeData.session) {
            console.log("[Code Exchange Success]", {
              userId: exchangeData.session.user.id,
              hasAccessToken: !!exchangeData.session.access_token,
            });
            // 교환 성공 시 세션 사용
            const user = exchangeData.session.user;
            if (!user) {
              const redirectUrl = getRedirectUrl("/login");
              window.location.href = redirectUrl;
              return;
            }

            // 연동 플로우인지 확인
            const isLinkingFlow = searchParams.get("link") === "kakao";

            if (isLinkingFlow) {
              const redirectUrl = getRedirectUrl("/user?linked=kakao");
              window.location.href = redirectUrl;
              return;
            }

            // 일반 로그인 플로우
            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }

            // 카카오 로그인 시 phone_verified 상태 동기화
            await syncPhoneVerificationStatus(user);

            // 프로필의 last_login_at 업데이트
            await updateLastLoginAt(user.id);

            const redirectUrl = getRedirectUrl("/");
            window.location.href = redirectUrl;
            return;
          }
        }

        // 코드가 없거나 교환 실패 시 기존 방식으로 세션 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Session Error]", {
            error: error.message,
            code: error.code,
            status: error.status,
            allParams: Object.fromEntries(searchParams.entries()),
          });
          const redirectUrl = getRedirectUrl("/login?error=인증에 실패했습니다.");
          window.location.href = redirectUrl;
          return;
        }

        if (data.session) {
          const user = data.session.user;
          if (!user) {
            const redirectUrl = getRedirectUrl("/login");
            window.location.href = redirectUrl;
            return;
          }

          // 연동 플로우인지 확인 (프로필 설정에서 카카오 연동 버튼 클릭 시)
          const isLinkingFlow = searchParams.get("link") === "kakao";

          if (isLinkingFlow) {
            // 연동 플로우: 이미 로그인된 상태에서 카카오 연동
            // Supabase가 자동으로 연동을 처리했으므로 프로필 설정으로 리다이렉트
            // user_metadata는 자동으로 보존됨
            const redirectUrl = getRedirectUrl("/user?linked=kakao");
            window.location.href = redirectUrl;
            return;
          }

          // 일반 카카오 로그인 플로우
          // 카카오 identity가 이미 연동되어 있는지 확인
          const { data: identities } = await supabase.auth.getUserIdentities();
          const hasKakaoIdentity =
            identities?.identities.some(
              (identity) => identity.provider === "kakao"
            ) || false;

          // 카카오로 로그인했지만 이미 다른 identity로 연동되어 있는 경우
          // (예: 이메일/비밀번호 계정에 카카오가 이미 연동됨)
          if (hasKakaoIdentity && user.email) {
            // 이미 연동된 계정이므로 정상 로그인 처리
            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }
          } else {
            // 새로운 카카오 계정이거나 연동되지 않은 경우
            // 이메일이 같으면 자동 연동을 시도할 수 있지만,
            // Supabase의 manual linking 정책상 명시적 연동이 필요할 수 있음
            // 여기서는 기존 로직대로 진행
            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }
          }

          // 카카오 로그인 시 phone_verified 상태 동기화
          await syncPhoneVerificationStatus(user);

          // 프로필의 last_login_at 업데이트
          await updateLastLoginAt(user.id);

          // 카카오 로그인 시 user_metadata 보존
          // 구독 정보는 회원가입 시 이미 설정되므로 추가 작업 불필요

          const redirectUrl = getRedirectUrl("/");
          window.location.href = redirectUrl;
        } else {
          console.log("세션이 없습니다.");
          const redirectUrl = getRedirectUrl("/login");
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error("콜백 처리 중 에러:", error);
        const redirectUrl = getRedirectUrl("/login?error=로그인 중 오류가 발생했습니다.");
        window.location.href = redirectUrl;
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <LoadingSpinner message="로그인 중..." size="md" />
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center px-4 py-8"
          style={{ backgroundColor: "#FAFAF8" }}
        >
          <LoadingSpinner message="로그인 중..." size="md" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
