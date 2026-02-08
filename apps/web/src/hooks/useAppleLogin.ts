import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

class AppleLoginError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AppleLoginError";
  }
}

// 리디렉션 URL 계산 (브라우저/앱 WebView 모두 동일 오리진 사용)
const getRedirectUrl = (): string => {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV;
  const isProduction = runtimeEnv === "production";

  let base: string;
  if (isProduction) {
    base = "https://vividlog.app";
  } else if (typeof window !== "undefined" && window.location?.origin) {
    base = window.location.origin;
  } else {
    base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
  }

  if (!base) {
    throw new AppleLoginError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  return `${base.replace(/\/$/, "")}/auth/callback`;
};

const loginWithApple = async (): Promise<void> => {
  try {
    const redirectTo = getRedirectUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[Apple Login Error]", {
        error: error.message,
        code: error.code,
        redirectTo,
      });
      throw new AppleLoginError("애플 로그인에 실패했습니다.");
    }
  } catch (err) {
    if (err instanceof AppleLoginError) throw err;
    console.error("애플 로그인 중 예상치 못한 에러:", err);
    throw new AppleLoginError("애플 로그인 중 오류가 발생했습니다.");
  }
};

export const useAppleLogin = () => {
  return useMutation({
    mutationFn: loginWithApple,
    onSuccess: () => {},
    onError: (error: AppleLoginError) => {
      console.error("애플 로그인 실패:", error.message);
    },
  });
};
