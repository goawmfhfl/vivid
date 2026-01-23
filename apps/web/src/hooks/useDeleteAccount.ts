import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 커스텀 에러 클래스
class DeleteAccountError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DeleteAccountError";
  }
}

// 회원 탈퇴 데이터 타입
export interface DeleteAccountData {
  reasons?: string[];
  additionalComment?: string | null;
}

// 회원 탈퇴 함수
const deleteAccount = async (data?: DeleteAccountData): Promise<void> => {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  // Development 모드에서는 실제 API 호출 없이 시뮬레이션만
  if (!isProduction) {
    // 시뮬레이션: 약간의 지연 후 성공 처리
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Development 모드: 회원 탈퇴 테스트 완료 (실제 탈퇴는 되지 않음)");
    return;
  }

  try {
    // 세션 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new DeleteAccountError("로그인이 필요합니다.");
    }

    // API 라우트를 통해 회원 탈퇴 (Production에서만 실제 실행)
    const response = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reasons: data?.reasons || [],
        additionalComment: data?.additionalComment || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new DeleteAccountError(
        errorData.error || "회원 탈퇴에 실패했습니다."
      );
    }
  } catch (error) {
    if (error instanceof DeleteAccountError) {
      throw error;
    }
    console.error("회원 탈퇴 중 예상치 못한 에러:", error);
    throw new DeleteAccountError("회원 탈퇴 중 오류가 발생했습니다.");
  }
};

// 회원 탈퇴 훅
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
    onError: (error: DeleteAccountError) => {
      console.error("회원 탈퇴 실패:", error.message);
    },
  });
};
