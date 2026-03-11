"use client";

import { useState, useEffect } from "react";

/**
 * 네이티브 앱 WebView 환경인지 여부.
 * ReactNativeWebView.postMessage 존재 시 네이티브 앱으로 판단.
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(
      typeof window !== "undefined" &&
        typeof (window as { ReactNativeWebView?: { postMessage?: unknown } })
          .ReactNativeWebView?.postMessage === "function"
    );
  }, []);

  return isNative;
}

/**
 * 네이티브 여부 + 마운트 완료 여부. 리다이렉트 등에서 사용.
 * isReady가 true일 때만 판단 결과를 신뢰.
 */
export function useIsNativeAppWithReady(): { isNative: boolean; isReady: boolean } {
  const [isNative, setIsNative] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsNative(
      typeof window !== "undefined" &&
        typeof (window as { ReactNativeWebView?: { postMessage?: unknown } })
          .ReactNativeWebView?.postMessage === "function"
    );
    setIsReady(true);
  }, []);

  return { isNative, isReady };
}
