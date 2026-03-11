import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

class GoogleLoginError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "GoogleLoginError";
  }
}

const getRedirectUrl = () => {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV;
  const isProduction = runtimeEnv === "production";
  const isDevelopment = runtimeEnv === "development";

  let base: string;
  if (isProduction) {
    base = "https://vividlog.app";
  } else if (isDevelopment) {
    base = "http://localhost:3000";
  } else if (typeof window !== "undefined" && window.location?.origin) {
    base = window.location.origin;
  } else {
    base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  if (!base) {
    throw new GoogleLoginError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  // /auth/callback은 Redirect URLs에 등록되어 있음. /login은 프로덕션에 미등록됨.
  return `${base.replace(/\/$/, "")}/auth/callback`;
};

const isNativeAppWebView = () => {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const isEmbedded = params.get("embed") === "1" || params.get("source") === "app";
  const canPostMessage =
    typeof window.ReactNativeWebView?.postMessage === "function";

  return isEmbedded && canPostMessage;
};

const loginWithGoogle = async (): Promise<void> => {
  try {
    if (isNativeAppWebView()) {
      const reactNativeWebView = window.ReactNativeWebView;
      if (!reactNativeWebView?.postMessage) {
        throw new GoogleLoginError("앱과의 로그인 브리지를 찾을 수 없습니다.");
      }
      reactNativeWebView.postMessage(JSON.stringify({ type: "TRIGGER_GOOGLE_LOGIN" }));
      return;
    }

    const redirectTo = getRedirectUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[Google Login Error]", {
        error: error.message,
        code: error.code,
        status: error.status,
        redirectTo,
      });
      throw new GoogleLoginError("구글 로그인에 실패했습니다.", error.code);
    }
  } catch (error) {
    if (error instanceof GoogleLoginError) {
      throw error;
    }
    console.error("구글 로그인 중 예상치 못한 에러:", error);
    throw new GoogleLoginError("구글 로그인 중 오류가 발생했습니다.");
  }
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {},
    onError: (error: GoogleLoginError) => {
      console.error("구글 로그인 실패:", error.message);
    },
  });
};
