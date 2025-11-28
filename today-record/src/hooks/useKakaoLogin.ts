import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 커스텀 에러 클래스
class KakaoLoginError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "KakaoLoginError";
  }
}

// 리디렉션 URL 계산

const getRedirectUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : null);

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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("카카오 로그인 에러:", error);
      throw new KakaoLoginError("카카오 로그인에 실패했습니다.");
    }

    console.log("카카오 로그인 입니다용:", data);
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
