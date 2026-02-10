"use client";

import { useMemo } from "react";

/**
 * iOS 기기(iPhone, iPad, iPod)인지 여부.
 * navigator.userAgent 기반 (WebView 포함).
 */
export function useIsIOS(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined" || !navigator?.userAgent) return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua);
  }, []);
}
