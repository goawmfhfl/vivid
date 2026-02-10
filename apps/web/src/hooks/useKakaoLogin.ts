import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 커스텀 에러 클래스
class KakaoLoginError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "KakaoLoginError";
  }
}

// 리디렉션 URL 계산 (브라우저/앱 WebView 모두 동일 오리진 사용)
const getRedirectUrl = () => {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV;
  const isProduction = runtimeEnv === "production";

  let base: string;
  if (isProduction) {
    base = "https://vividlog.app";
  } else if (typeof window !== "undefined" && window.location?.origin) {
    // 개발/테스트: 현재 오리진 사용 → 앱 WebView(예: 172.30.1.59:3000)에서도 콜백이 같은 주소로 돌아감
    base = window.location.origin;
  } else {
    base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
  }

  if (!base) {
    throw new KakaoLoginError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  return `${base.replace(/\/$/, "")}/auth/callback`;
};

// 카카오 로그인 함수
const loginWithKakao = async (): Promise<void> => {
  try {
    const redirectTo = getRedirectUrl();
    const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV;
    
    // 디버깅 정보 로깅
    console.log("[Kakao Login Debug]", {
      redirectTo,
      runtimeEnv,
      windowOrigin: typeof window !== "undefined" ? window.location.origin : null,
      expectedCallbackUrl: redirectTo,
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[Kakao Login Error]", {
        error: error.message,
        code: error.code,
        status: error.status,
        redirectTo,
      });
      throw new KakaoLoginError("카카오 로그인에 실패했습니다.");
    }

    // 실제 리다이렉션 URL 확인
    console.log("[Kakao Login Success]", {
      redirectTo,
      actualRedirectUrl: data?.url,
      note: "Supabase Redirect URLs에 다음이 등록되어 있어야 합니다: " + redirectTo,
    });
  } catch (error) {
    if (error instanceof KakaoLoginError) {
      throw error;
    }
    console.error("카카오 로그인 중 예상치 못한 에러:", error);
    throw new KakaoLoginError("카카오 로그인 중 오류가 발생했습니다.");
  }
};

// 카카오 로그인 훅
export const useKakaoLogin = () => {
  return useMutation({
    mutationFn: loginWithKakao,
    onSuccess: () => {},
    onError: (error: KakaoLoginError) => {
      console.error("카카오 로그인 실패:", error.message);
    },
  });
};
