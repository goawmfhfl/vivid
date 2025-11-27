import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 이메일 찾기 데이터 타입 정의
export interface FindEmailData {
  email: string;
}

// 이메일 찾기 응답 타입 정의
export interface FindEmailResponse {
  exists: boolean;
  maskedEmail?: string;
}

// 커스텀 에러 클래스
class FindEmailError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "FindEmailError";
  }
}

// 이메일 마스킹 함수
const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  // 로컬 파트 마스킹 (앞 2자리만 보여주고 나머지는 *로)
  const visibleLength = Math.min(2, localPart.length);
  const maskedLocal = localPart.slice(0, visibleLength) + "*".repeat(Math.max(0, localPart.length - visibleLength));

  return `${maskedLocal}@${domain}`;
};

// 이메일 찾기 함수
// 주의: 보안상 실제로는 이메일 존재 여부를 확인하기 어렵습니다.
// Supabase는 보안상 이유로 존재하지 않는 이메일에 대한 정보를 제공하지 않습니다.
// 따라서 이 함수는 이메일 형식만 검증하고, 실제 존재 여부는 확인하지 않습니다.
const findEmail = async (data: FindEmailData): Promise<FindEmailResponse> => {
  const { email } = data;

  // 입력 데이터 검증
  if (!email) {
    throw new FindEmailError("이메일을 입력해주세요.");
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new FindEmailError("올바른 이메일 형식을 입력해주세요.");
  }

  try {
    // Supabase에서는 보안상 이유로 이메일 존재 여부를 직접 확인할 수 없습니다.
    // 대신 비밀번호 재설정을 시도하여 간접적으로 확인할 수 있지만,
    // 이것도 완벽하지 않습니다.
    
    // 실제로는 이메일 형식만 검증하고, 마스킹된 이메일을 반환합니다.
    // 사용자에게 입력한 이메일로 비밀번호 재설정 링크를 보낼 수 있다고 안내합니다.
    
    return {
      exists: true, // 보안상 항상 true로 반환
      maskedEmail: maskEmail(email),
    };
  } catch (error) {
    if (error instanceof FindEmailError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("이메일 찾기 중 예상치 못한 에러:", error);
    throw new FindEmailError(
      "이메일 찾기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};

// 이메일 찾기 훅
export const useFindEmail = () => {
  return useMutation({
    mutationFn: findEmail,
    onError: (error: FindEmailError) => {
      console.error("이메일 찾기 실패:", error.message);
    },
  });
};

