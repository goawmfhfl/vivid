import { useMutation } from "@tanstack/react-query";

// 이메일 찾기 데이터 타입 정의
export interface FindEmailData {
  name: string;
  phone: string;
}

// 이메일 찾기 응답 타입 정의
export interface FindEmailResponse {
  success: boolean;
  emails: string[];
  count: number;
}

// 커스텀 에러 클래스
class FindEmailError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "FindEmailError";
  }
}

// 이메일 찾기 함수
// 서버 사이드 API를 통해 이름과 전화번호가 모두 일치하는 이메일을 찾습니다.
const findEmail = async (data: FindEmailData): Promise<FindEmailResponse> => {
  const { name, phone } = data;

  // 입력 데이터 검증
  if (!name || name.trim() === "") {
    throw new FindEmailError("이름을 입력해주세요.");
  }

  if (!phone || phone.trim() === "") {
    throw new FindEmailError("전화번호를 입력해주세요.");
  }

  try {
    // 서버 사이드 API 호출
    const response = await fetch("/api/auth/find-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new FindEmailError(
        result.error || "이메일 찾기 중 오류가 발생했습니다."
      );
    }

    return result;
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
