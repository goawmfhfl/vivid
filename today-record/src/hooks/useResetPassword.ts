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
    // Supabase Auth를 통한 비밀번호 재설정 이메일 전송
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      // Supabase 에러 메시지를 한국어로 변환
      let errorMessage = error.message;

      if (error.message.includes("rate_limit_exceeded")) {
        errorMessage =
          "이메일 전송이 너무 빈번합니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("email_not_confirmed")) {
        errorMessage = "이메일 인증이 필요합니다.";
      } else if (error.message.includes("user_not_found")) {
        // 보안을 위해 존재하지 않는 이메일이어도 성공 메시지 표시
        // 실제로는 이메일이 존재하지 않아도 성공 메시지를 보여줌 (보안상 이유)
        return;
      }

      throw new ResetPasswordError(errorMessage, error.message);
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
