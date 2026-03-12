"use client";

import { useMemo } from "react";

/**
 * iOS 기기(iPhone, iPad, iPod)인지 여부.
 * navigator.userAgent 기반 (WebView 포함).
 */
export function useIsIOS(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }

    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    const isiPhoneOrIPadOrIPod = /iPhone|iPad|iPod/i.test(ua);
    // iPadOS 13+는 UA에 "Macintosh"가 포함될 수 있어 touch point로 보완
    const isiPadOSDesktopUA = /Macintosh/i.test(ua) && maxTouchPoints > 1;
    const isAppleMobilePlatform = /iPhone|iPad|iPod/i.test(platform);

    return isiPhoneOrIPadOrIPod || isiPadOSDesktopUA || isAppleMobilePlatform;
  }, []);
}
