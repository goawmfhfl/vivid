"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

/**
 * 브라우저(일반 Safari/Chrome 등)인지, WebView/임베드(앱 내 웹)인지 구분.
 * - true: 일반 브라우저 → 카카오/이메일 로그인 노출
 * - false: WebView/임베드 → 애플 로그인만 노출
 */
export function useIsBrowser(): boolean {
  const searchParams = useSearchParams();

  return useMemo(() => {
    if (typeof window === "undefined") return true;

    const embed = searchParams.get("embed");
    const source = searchParams.get("source");
    if (embed === "1" || source === "app") return false;

    const ua = navigator.userAgent;
    if (/; wv\)/.test(ua)) return false;
    if (/WebView/i.test(ua)) return false;

    return true;
  }, [searchParams]);
}
