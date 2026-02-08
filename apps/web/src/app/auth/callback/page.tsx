"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { updateLastLoginAt } from "@/lib/profile-utils";
import { getLoginPath } from "@/lib/navigation";
import { COLORS } from "@/lib/design-system";

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
 * OAuth 로그인 시 phone_verified 동기화
 * 카카오: 휴대폰 인증 완료 상태로 설정. 애플: 기존 메타데이터 유지(이미 true면 스킵)
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

// 환경에 따른 리다이렉션 URL 생성 (클라이언트에서는 현재 오리진 사용 → 앱 WebView/브라우저 동일)
function getRedirectUrl(path: string): string {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  const isProduction = runtimeEnv === "production";

  let baseUrl: string;
  if (isProduction) {
    baseUrl = "https://vividlog.app";
  } else if (typeof window !== "undefined" && window.location?.origin) {
    baseUrl = window.location.origin;
  } else {
    baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Expo Go 등에서 터미널을 볼 수 없을 때: 이 로그가 npm run dev 터미널에 찍힙니다 */
function sendAuthDebug(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const url = `${window.location.origin}/api/auth-debug`;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function AuthCallbackContent() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState<string>("콜백 확인 중...");
  const authExecutedRef = useRef(false);

  // 1. Hydration 방지: 브라우저 마운트 이후에만 콘텐츠 렌더
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. 클라이언트에서만, 딱 한 번만 Auth 처리 (URL은 마운트 시점의 window.location 사용)
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    if (authExecutedRef.current) return;
    authExecutedRef.current = true;

    const searchParams = new URLSearchParams(window.location.search);

    const handleAuthCallback = async () => {
      const errorParam = searchParams.get("error");
      const errorCode = searchParams.get("error_code");
      const errorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");
      sendAuthDebug({
        step: "callback_start",
        hasCode: !!code,
        hasError: !!errorParam,
        error: errorParam ?? undefined,
        error_code: errorCode ?? undefined,
        error_description: errorDescription ?? undefined,
        origin: window.location.origin,
      });

      try {
        // URL 파라미터에서 에러 확인 (Supabase OAuth 에러)
        if (errorParam) {
          sendAuthDebug({
            step: "oauth_error",
            error: errorParam,
            error_code: errorCode,
            error_description: errorDescription,
            allParams: Object.fromEntries(searchParams.entries()),
          });
          setStatus(
            `OAuth 에러: ${errorCode || errorParam} — ${errorDescription || "설명 없음"}`
          );
          const allParams = Object.fromEntries(searchParams.entries());
          console.error("[OAuth Callback Error]", {
            error: errorParam,
            errorCode,
            errorDescription,
            allParams,
            url: window.location.href,
          });

          if (errorCode === "identity_already_exists" || errorParam === "identity_already_exists") {
            const isLinkingFlow = searchParams.get("link") === "kakao" || searchParams.get("link") === "apple";
            if (isLinkingFlow) {
              router.replace(
                "/user?error=social_already_linked&message=" +
                  encodeURIComponent(
                    "이 소셜 계정은 이미 다른 사용자에게 연결되어 있습니다. 다른 계정을 사용하거나 관리자에게 문의해주세요."
                  ),
                { scroll: false }
              );
              return;
            }
            const redirectUrl = getRedirectUrl(
              "/login?error=" +
                encodeURIComponent(
                  "이 소셜 계정은 이미 다른 사용자에게 연결되어 있습니다."
                )
            );
            window.location.href = redirectUrl;
            return;
          }

          const isCodeExchangeError =
            errorDescription?.includes("Unable to exchange external code") ||
            errorDescription?.includes("exchange") ||
            errorCode === "server_error" ||
            errorCode === "unexpected_failure";

          if (isCodeExchangeError) {
            const expectedCallbackUrl = getRedirectUrl("/auth/callback");
            console.error("[OAuth Code Exchange Error]", {
              errorParam,
              errorCode,
              errorDescription,
              currentUrl: window.location.href,
              expectedCallbackUrl,
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

          const errorMessage =
            errorDescription ||
            (errorCode === "server_error"
              ? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
              : "인증 중 오류가 발생했습니다.");
          const redirectUrl = getRedirectUrl(getLoginPath(searchParams, { error: errorMessage }));
          window.location.href = redirectUrl;
          return;
        }

        const state = searchParams.get("state");
        sendAuthDebug({
          step: code ? "code_received" : "no_code",
          hasState: !!state,
        });
        setStatus(
          code
            ? "코드 수신됨. 세션으로 교환 중..."
            : "URL에 code 없음. 세션 확인 중..."
        );
        console.log("[OAuth Callback]", {
          hasCode: !!code,
          hasState: !!state,
          allParams: Object.fromEntries(searchParams.entries()),
        });

        // OAuth 코드가 있으면 클라이언트에서 한 번만 교환
        if (code) {
          setStatus("코드 교환 중...");
          console.log("[OAuth Code Exchange]", { code: code.substring(0, 20) + "..." });
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            sendAuthDebug({
              step: "exchange_failed",
              message: exchangeError.message,
              code: exchangeError.code,
              status: exchangeError.status,
            });
            setStatus(`교환 실패: ${exchangeError.message}`);
            console.error("[Code Exchange Error]", {
              error: exchangeError.message,
              code: exchangeError.code,
              status: exchangeError.status,
            });
            const msg =
              exchangeError.message ||
              "로그인 처리 중 오류가 발생했습니다. Redirect URL 설정을 확인해주세요.";
            const redirectUrl = getRedirectUrl(getLoginPath(searchParams, { error: msg }));
            window.location.href = redirectUrl;
            return;
          }
          if (exchangeData?.session) {
            sendAuthDebug({ step: "exchange_success", userId: exchangeData.session.user.id });
            setStatus("세션 생성됨. 이동 중...");
            console.log("[Code Exchange Success]", {
              userId: exchangeData.session.user.id,
              hasAccessToken: !!exchangeData.session.access_token,
            });
            const user = exchangeData.session.user;
            if (!user) {
              const redirectUrl = getRedirectUrl(getLoginPath(searchParams));
              window.location.href = redirectUrl;
              return;
            }

            const linkProvider = searchParams.get("link");
            if (linkProvider === "kakao" || linkProvider === "apple") {
              const redirectUrl = getRedirectUrl(`/user?linked=${linkProvider}`);
              window.location.href = redirectUrl;
              return;
            }

            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }

            await syncPhoneVerificationStatus(user);
            await updateLastLoginAt(user.id);

            const redirectUrl = getRedirectUrl("/");
            window.location.href = redirectUrl;
            return;
          }
        }

        // 코드 없을 때만 getSession으로 세션 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          sendAuthDebug({
            step: "session_error",
            message: error.message,
            code: error.code,
            status: error.status,
          });
          console.error("[Session Error]", {
            error: error.message,
            code: error.code,
            status: error.status,
            allParams: Object.fromEntries(searchParams.entries()),
          });
          const redirectUrl = getRedirectUrl(getLoginPath(searchParams, { error: "인증에 실패했습니다." }));
          window.location.href = redirectUrl;
          return;
        }

        if (data.session) {
          const user = data.session.user;
          if (!user) {
            const redirectUrl = getRedirectUrl(getLoginPath(searchParams));
            window.location.href = redirectUrl;
            return;
          }

          const linkProvider = searchParams.get("link");
          if (linkProvider === "kakao" || linkProvider === "apple") {
            const redirectUrl = getRedirectUrl(`/user?linked=${linkProvider}`);
            window.location.href = redirectUrl;
            return;
          }

          const { data: identities } = await supabase.auth.getUserIdentities();
          const hasKakaoIdentity =
            identities?.identities.some(
              (identity) => identity.provider === "kakao"
            ) || false;

          if (hasKakaoIdentity && user.email) {
            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }
          } else {
            if (!isProfileCompleted(user)) {
              const emailQuery = user.email
                ? `&email=${encodeURIComponent(user.email)}`
                : "";
              const redirectUrl = getRedirectUrl(`/signup?social=1${emailQuery}`);
              window.location.href = redirectUrl;
              return;
            }
          }

          await syncPhoneVerificationStatus(user);
          await updateLastLoginAt(user.id);

          const redirectUrl = getRedirectUrl("/");
          window.location.href = redirectUrl;
        } else {
          sendAuthDebug({ step: "no_session", message: "코드 없음 + getSession 세션 없음" });
          setStatus("세션 없음. 로그인으로 돌아갑니다.");
          console.log("세션이 없습니다.");
          const redirectUrl = getRedirectUrl(getLoginPath(searchParams));
          window.location.href = redirectUrl;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        sendAuthDebug({ step: "exception", message: errMsg });
        setStatus(`오류: ${errMsg}`);
        console.error("콜백 처리 중 에러:", error);
        const redirectUrl = getRedirectUrl(getLoginPath(searchParams, { error: "로그인 중 오류가 발생했습니다." }));
        window.location.href = redirectUrl;
      }
    };

    handleAuthCallback();
  }, [isMounted, router]);

  // 마운트 전에는 서버/클라이언트 동일하게 null → Hydration 불일치 방지
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-4"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <LoadingSpinner message="로그인 중..." size="md" />
      <p
        className="text-center text-sm max-w-md break-words"
        style={{ color: COLORS.text.tertiary }}
      >
        {status}
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center px-4 py-8"
          style={{ backgroundColor: COLORS.background.base }}
        >
          <LoadingSpinner message="로그인 중..." size="md" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
