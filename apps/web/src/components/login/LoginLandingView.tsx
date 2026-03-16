"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { getLoginPath, getLoginEmailPath } from "@/lib/navigation";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BUTTON_STYLES,
  GRADIENT_UTILS,
  SHADOWS,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { useKakaoLogin } from "@/hooks/useKakaoLogin";
import { useAppleLogin } from "@/hooks/useAppleLogin";
import { useModalStore } from "@/store/useModalStore";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { updateLastLoginAt } from "@/lib/profile-utils";

const TAGLINE = `기록을

통해 나다운 삶을 선명하게`

const loginButtonTextureBase = {
  borderRadius: "12px",
  border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
  boxShadow: SHADOWS.default,
  backgroundImage: `
    linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.08) 100%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(127, 143, 122, 0.012) 2px,
      rgba(127, 143, 122, 0.012) 4px
    )
  `,
  backgroundSize: "100% 100%, 8px 8px",
  backgroundBlendMode: "soft-light, normal" as const,
};

const isProfileCompleted = (user: User) => {
  const metadata = user.user_metadata || {};
  return Boolean(metadata.name && metadata.agreeTerms && metadata.agreeAI);
};

const syncPhoneVerificationStatus = async (user: User) => {
  const metadata = user.user_metadata || {};
  if (metadata.phone_verified === true) return;

  try {
    await supabase.auth.updateUser({
      data: {
        ...metadata,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Social Login] phone_verified 동기화 실패:", error);
  }
};

export function LoginLandingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<
    "google" | "kakao" | "apple" | null
  >(null);
  const shouldShowAppleLogin = useMemo(() => {
    if (!mounted || typeof window === "undefined") {
      return false;
    }

    const nativePlatform = searchParams?.get("native_platform");
    const isEmbeddedApp = searchParams?.get("embed") === "1";
    const isAndroidNativeApp = isEmbeddedApp && nativePlatform === "android";
    const isAndroidDevice = /Android/i.test(window.navigator.userAgent || "");

    return !isAndroidNativeApp && !isAndroidDevice;
  }, [mounted, searchParams]);
  const googleLoginMutation = useGoogleLogin();
  const kakaoLoginMutation = useKakaoLogin();
  const appleLoginMutation = useAppleLogin();
  const processingProvider = searchParams?.get("oauth_provider");
  const googleLoading =
    googleLoginMutation.isPending ||
    activeSocialProvider === "google" ||
    (isOAuthProcessing && processingProvider === "google");
  const kakaoLoading =
    kakaoLoginMutation.isPending ||
    activeSocialProvider === "kakao" ||
    (isOAuthProcessing && processingProvider === "kakao");
  const appleLoading =
    appleLoginMutation.isPending ||
    activeSocialProvider === "apple" ||
    (isOAuthProcessing && processingProvider === "apple");
  const disableSocialButtons =
    googleLoading || kakaoLoading || appleLoading || isOAuthProcessing;
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const completeAuthenticatedLogin = useCallback(
    async (params: URLSearchParams) => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        showToast("로그인 세션 확인에 실패했습니다. 다시 시도해주세요.", 5000);
        router.replace(getLoginPath(params));
        return;
      }

      const user = session.user;
      if (!isProfileCompleted(user)) {
        const emailQuery = user.email ? `&email=${encodeURIComponent(user.email)}` : "";
        router.replace(`/signup?social=1${emailQuery}`);
        return;
      }

      await syncPhoneVerificationStatus(user);
      await updateLastLoginAt(user.id);
      router.replace("/");
    },
    [router, showToast]
  );

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || "";
    const hasOAuthSignal =
      params.get("oauth") === "1" ||
      params.has("code") ||
      /access_token=|refresh_token=/.test(hash);

    if (!hasOAuthSignal) return;

    let cancelled = false;

    const completeOAuthLogin = async () => {
      setIsOAuthProcessing(true);
      try {
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");

        if (errorParam || errorDescription) {
          const message = errorDescription || errorParam || "소셜 로그인에 실패했습니다.";
          showToast(message, 5000);
          router.replace(getLoginPath(params));
          return;
        }

        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            showToast(
              exchangeError.message || "소셜 로그인 처리 중 오류가 발생했습니다.",
              5000
            );
            router.replace(getLoginPath(params));
            return;
          }
        }

        await completeAuthenticatedLogin(params);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "소셜 로그인 중 오류가 발생했습니다.";
        showToast(message, 5000);
        router.replace(getLoginPath(params));
      } finally {
        if (!cancelled) {
          setIsOAuthProcessing(false);
          setActiveSocialProvider(null);
        }
      }
    };

    completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [completeAuthenticatedLogin, mounted, router, showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const handleNativeGoogleLoginComplete = async () => {
      setIsOAuthProcessing(true);
      try {
        const params = new URLSearchParams(window.location.search);
        await completeAuthenticatedLogin(params);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "구글 로그인 중 오류가 발생했습니다.";
        showToast(message, 5000);
      } finally {
        if (!cancelled) {
          setIsOAuthProcessing(false);
          setActiveSocialProvider(null);
        }
      }
    };

    const handleNativeGoogleLoginError = (event: Event) => {
      const message =
        event instanceof CustomEvent && typeof event.detail === "string"
          ? event.detail
          : "구글 로그인 중 오류가 발생했습니다.";
      showToast(message, 5000);
      if (!cancelled) {
        setIsOAuthProcessing(false);
        setActiveSocialProvider(null);
      }
    };

    window.addEventListener(
      "native-google-auth-complete",
      handleNativeGoogleLoginComplete
    );
    window.addEventListener(
      "native-google-auth-error",
      handleNativeGoogleLoginError
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        "native-google-auth-complete",
        handleNativeGoogleLoginComplete
      );
      window.removeEventListener(
        "native-google-auth-error",
        handleNativeGoogleLoginError
      );
    };
  }, [completeAuthenticatedLogin, showToast]);

  useEffect(() => {
    if (searchParams?.get("oauth") === "1") return;

    const message = searchParams?.get("message");
    if (message) {
      openSuccessModal(message);
      router.replace(getLoginPath(searchParams));
      return;
    }
    const errorMessage = searchParams?.get("error");
    if (errorMessage) {
      showToast(errorMessage, 6000);
      router.replace(getLoginPath(searchParams));
      return;
    }
    const isDeleted = searchParams?.get("deleted");
    if (isDeleted === "true") {
      showToast("회원 탈퇴가 완료되었습니다.", 4000);
      router.replace(getLoginPath(searchParams));
    }
  }, [openSuccessModal, router, searchParams, showToast]);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        SPACING.page.padding
      )}
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* 상단: VIVID 텍스트 로고 */}
        <Image
          src="/logos/title-200x60.svg"
          alt="VIVID"
          width={200}
          height={60}
          priority
          className="shrink-0"
        />

        {/* 태그라인 */}
        <p
          className={cn(
            "text-center mt-4",
            TYPOGRAPHY.bodyLarge.fontSize,
            TYPOGRAPHY.bodyLarge.fontWeight
          )}
          style={{
            color: COLORS.text.secondary,
            lineHeight: 1.6,
          }}
        >
          {TAGLINE}
        </p>

        {/* 비비드 로고 이미지 */}
        <div className="mt-8 sm:mt-10">
          <Image
            src="/logos/icon-512x512.svg"
            alt=""
            width={240}
            height={240}
            priority
            className="shrink-0 w-60 h-60"
            aria-hidden
          />
        </div>

        {/* 하단: 카카오/구글/이메일은 항상, 애플은 웹 또는 iOS 앱에서만 */}
        <div
          className={cn(
            "w-full mt-10 sm:mt-12 flex flex-col",
            SPACING.element.gap
          )}
        >
          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={() => {
              setActiveSocialProvider("kakao");
              kakaoLoginMutation.mutate();
            }}
            disabled={disableSocialButtons}
            className={cn(
              "w-full flex items-center rounded-xl py-3.5 px-4 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70",
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.fontWeight
            )}
            style={{
              ...loginButtonTextureBase,
              background: GRADIENT_UTILS.cardBackground("#FEE500", 0.86, "#FEE500"),
              color: "#191919",
              border: "1.5px solid rgba(254, 229, 0, 0.55)",
              boxShadow: "0 2px 12px rgba(254, 229, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            <span className="flex-shrink-0 w-6 flex items-center justify-center" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3C5.58172 3 2 5.89543 2 9.5C2 11.6484 3.23828 13.5391 5.17188 14.6953L4.30469 17.8359C4.25781 18.0078 4.42969 18.1641 4.59375 18.0781L8.35938 15.8203C8.89844 15.9141 9.44531 15.9766 10 15.9766C14.4183 15.9766 18 13.0811 18 9.47656C18 5.87201 14.4183 3 10 3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="flex-1 flex justify-center">
              {kakaoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "카카오 로그인"
              )}
            </span>
          </button>

          {/* 구글 로그인 */}
          <button
            type="button"
            onClick={() => {
              setActiveSocialProvider("google");
              googleLoginMutation.mutate(undefined, {
                onError: (error) => {
                  setActiveSocialProvider(null);
                  showToast(error.message, 5000);
                },
              });
            }}
            disabled={disableSocialButtons}
            className={cn(
              "w-full flex items-center rounded-xl py-3.5 px-4 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70",
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.fontWeight
            )}
            style={{
              ...loginButtonTextureBase,
              background: GRADIENT_UTILS.cardBackground(
                COLORS.text.white,
                0.96,
                COLORS.text.white
              ),
              color: COLORS.text.primary,
              border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.text.primary, "20")}`,
              boxShadow: SHADOWS.default,
            }}
          >
            <span className="flex-shrink-0 w-6 flex items-center justify-center" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.805 12.23c0-.68-.061-1.334-.175-1.961H12v3.71h5.5a4.704 4.704 0 0 1-2.04 3.088v2.565h3.3c1.93-1.776 3.045-4.395 3.045-7.402Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.76 0 5.074-.915 6.765-2.468l-3.3-2.565c-.915.614-2.084.978-3.465.978-2.66 0-4.913-1.797-5.718-4.213H2.87v2.646A9.997 9.997 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.282 13.732A5.995 5.995 0 0 1 5.962 12c0-.601.109-1.184.32-1.732V7.622H2.87A9.998 9.998 0 0 0 2 12c0 1.61.386 3.134 1.07 4.378l3.212-2.646Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.055c1.5 0 2.848.516 3.91 1.53l2.93-2.93C17.069 2.99 14.756 2 12 2A9.997 9.997 0 0 0 2.87 7.622l3.412 2.646C7.087 7.852 9.34 6.055 12 6.055Z"
                />
              </svg>
            </span>
            <span className="flex-1 flex justify-center">
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "구글 로그인"
              )}
            </span>
          </button>

          {/* 애플 로그인: 웹 또는 iOS 앱에서만 표시 */}
          {shouldShowAppleLogin && (
          <button
            type="button"
            onClick={() => {
              setActiveSocialProvider("apple");
              appleLoginMutation.mutate();
            }}
            disabled={disableSocialButtons}
            className={cn(
              "w-full flex items-center rounded-xl py-3.5 px-4 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70",
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.fontWeight
            )}
            style={{
              ...loginButtonTextureBase,
              background: GRADIENT_UTILS.cardBackground(COLORS.text.primary, 0.92, "#353535"),
              color: COLORS.text.white,
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <span className="flex-shrink-0 w-6 flex items-center justify-center" aria-hidden>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.2 2.33-2.71 4.66-4.45 6.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </span>
            <span className="flex-1 flex justify-center">
              {appleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "애플 로그인"
              )}
            </span>
          </button>
          )}

          {/* 이메일 로그인 */}
          <button
            type="button"
            onClick={() => router.push(getLoginEmailPath(searchParams))}
            className={cn(
              "w-full flex items-center rounded-xl py-3.5 px-4 transition-all hover:opacity-90 active:scale-[0.99]",
              BUTTON_STYLES.primary.borderRadius,
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.fontWeight
            )}
            style={{
              ...loginButtonTextureBase,
              background: GRADIENT_UTILS.cardBackground(
                COLORS.brand.primary,
                0.88,
                COLORS.brand.primary
              ),
              color: BUTTON_STYLES.primary.color,
              border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.primary, "55")}`,
            }}
          >
            <span className="flex-shrink-0 w-6 flex items-center justify-center" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <span className="flex-1 flex justify-center">이메일 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}
