import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// 프로필 업데이트 데이터 타입 정의
export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

// 커스텀 에러 클래스
class UpdateProfileError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "UpdateProfileError";
  }
}

// 프로필 업데이트 함수
const updateProfile = async (data: UpdateProfileData): Promise<void> => {
  const { name, phone } = data;

  // 최소 하나는 입력되어야 함
  if (!name && !phone) {
    throw new UpdateProfileError("이름 또는 전화번호 중 하나는 입력해주세요.");
  }

  try {
    // 현재 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new UpdateProfileError("사용자 정보를 가져올 수 없습니다.");
    }

    // 기존 메타데이터 가져오기
    const currentMetadata = user.user_metadata || {};

    // 새로운 메타데이터 생성
    const newMetadata = {
      ...currentMetadata,
      ...(name && { name }),
      ...(phone && { phone }), // user_metadata에 저장
    };

    // 프로필 업데이트 - user_metadata에만 저장
    const { error: updateError } = await supabase.auth.updateUser({
      data: newMetadata,
    });

    if (updateError) {
      let errorMessage = updateError.message;

      if (updateError.message.includes("rate_limit_exceeded")) {
        errorMessage = "요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.";
      }

      throw new UpdateProfileError(errorMessage, updateError.message);
    }
  } catch (error) {
    if (error instanceof UpdateProfileError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("프로필 업데이트 중 예상치 못한 에러:", error);
    throw new UpdateProfileError(
      "프로필 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};

// 프로필 업데이트 훅
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: UpdateProfileError) => {
      console.error("프로필 업데이트 실패:", error.message);
    },
  });
};
