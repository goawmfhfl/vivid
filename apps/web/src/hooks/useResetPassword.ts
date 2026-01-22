import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 비밀번호 재설정 데이터 타입 정의
export interface ResetPasswordData {
  email: string;
}

// 커스텀 에러 클래스
class ResetPasswordError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ResetPasswordError";
  }
}

// 환경에 따른 redirectTo URL 생성
const getRedirectToUrl = (): string => {
  // 환경 변수 확인
  const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV;
  const isProduction = nodeEnv === "production";
  const isDevelopment = nodeEnv === "development";

  let baseUrl: string;

  if (isProduction) {
    baseUrl = "https://vividlog.app";
  } else if (isDevelopment) {
    baseUrl = "http://localhost:3000";
  } else {
    // test 환경 또는 기타 환경
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : null) ||
      "http://localhost:3000";
  }

  return `${baseUrl}/auth/reset-password`;
};

// 비밀번호 재설정 함수
const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  const { email } = data;

  // 입력 데이터 검증
  if (!email) {
    throw new ResetPasswordError("이메일을 입력해주세요.");
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ResetPasswordError("올바른 이메일 형식을 입력해주세요.");
  }

  try {
    // 환경에 따른 redirectTo URL 사용
    const redirectTo = getRedirectToUrl();
    
    // Supabase Auth를 통한 비밀번호 재설정 이메일 전송
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      // Supabase 에러 메시지를 한국어로 변환
      let errorMessage = error.message;

      if (
        error.code === "over_email_send_rate_limit" ||
        error.message.includes("over_email_send_rate_limit")
      ) {
        // 메시지에서 시간 정보 추출 (예: "after 2 seconds" 또는 "after 60 seconds")
        const timeMatch = error.message.match(/(\d+)\s*(second|minute|hour)/i);
        if (timeMatch) {
          const timeValue = parseInt(timeMatch[1], 10);
          const timeUnit = timeMatch[2].toLowerCase();
          
          let timeUnitKorean = "초";
          if (timeUnit === "minute" || timeUnit === "minutes") {
            timeUnitKorean = "분";
          } else if (timeUnit === "hour" || timeUnit === "hours") {
            timeUnitKorean = "시간";
          }
          
          errorMessage = `${timeValue}${timeUnitKorean} 후에 다시 시도해주세요.`;
        } else {
          errorMessage = "잠시 후에 다시 시도해주세요.";
        }
      } else if (error.message.includes("rate_limit_exceeded")) {
        errorMessage =
          "이메일 전송이 너무 빈번합니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("email_not_confirmed")) {
        errorMessage = "이메일 인증이 필요합니다.";
      } else if (error.message.includes("user_not_found")) {
        // 보안을 위해 존재하지 않는 이메일이어도 성공 메시지 표시
        // 실제로는 이메일이 존재하지 않아도 성공 메시지를 보여줌 (보안상 이유)
        return;
      }

      throw new ResetPasswordError(errorMessage, error.code || error.message);
    }
  } catch (error) {
    if (error instanceof ResetPasswordError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("비밀번호 재설정 중 예상치 못한 에러:", error);
    throw new ResetPasswordError(
      "비밀번호 재설정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};

// 비밀번호 재설정 훅
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onError: (error: ResetPasswordError) => {
      console.error("비밀번호 재설정 실패:", error.message);
    },
  });
};
