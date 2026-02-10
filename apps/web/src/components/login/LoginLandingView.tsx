"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useKakaoLogin } from "@/hooks/useKakaoLogin";
import { useAppleLogin } from "@/hooks/useAppleLogin";
import { useIsBrowser } from "@/hooks/useIsBrowser";
import { useIsIOS } from "@/hooks/useIsIOS";
import { useModalStore } from "@/store/useModalStore";
import { useToast } from "@/hooks/useToast";

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

export function LoginLandingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const isBrowser = useIsBrowser();
  const isIOS = useIsIOS();
  // SSR/CSR 초기 마크업을 맞추기 위해 첫 렌더에서는 버튼을 유지하고,
  // 마운트 후 실제 환경(isBrowser/isIOS)에 맞게 최종 노출 여부를 결정한다.
  const shouldShowAppleLogin = mounted ? isBrowser || isIOS : true;
  const kakaoLoginMutation = useKakaoLogin();
  const appleLoginMutation = useAppleLogin();
  const openSuccessModal = useModalStore((state) => state.openSuccessModal);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      openSuccessModal(message);
      router.replace(getLoginPath(searchParams));
      return;
    }
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      showToast(errorMessage, 6000);
      router.replace(getLoginPath(searchParams));
      return;
    }
    const isDeleted = searchParams.get("deleted");
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

        {/* 하단: 로그인 버튼. 카카오/이메일은 항상, 애플은 앱(WebView)+iOS에서만 */}
        <div
          className={cn(
            "w-full mt-10 sm:mt-12 flex flex-col",
            SPACING.element.gap
          )}
        >
          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={() => kakaoLoginMutation.mutate()}
            disabled={kakaoLoginMutation.isPending}
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
            <span className="flex-1 flex justify-center">카카오 로그인</span>
          </button>

          {/* 애플 로그인: 브라우저(PC 테스트용) + 앱(WebView) iOS에서 표시 */}
          {shouldShowAppleLogin && (
          <button
            type="button"
            onClick={() => appleLoginMutation.mutate()}
            disabled={appleLoginMutation.isPending}
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
            <span className="flex-1 flex justify-center">애플 로그인</span>
          </button>
          )}

          {!shouldShowAppleLogin && (
            <p
              className={cn("text-center py-4", TYPOGRAPHY.bodySmall.fontSize)}
              style={{ color: COLORS.text.tertiary }}
            >
              애플 로그인은 iOS에서만 이용할 수 있습니다.
            </p>
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
