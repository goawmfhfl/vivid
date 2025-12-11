import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/constants";
import type { CurrentUser } from "./useCurrentUser";

// 프로필 업데이트 데이터 타입 정의
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  birthYear?: string;
  gender?: string;
  agreeMarketing?: boolean;
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
  const { name, phone, birthYear, gender, agreeMarketing } = data;

  if (
    !name &&
    !phone &&
    !birthYear &&
    !gender &&
    agreeMarketing === undefined
  ) {
    throw new UpdateProfileError("변경할 정보를 입력해주세요.");
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
      ...(phone && { phone }),
      ...(birthYear && { birthYear }),
      ...(gender && { gender }),
      ...(agreeMarketing !== undefined && { agreeMarketing }),
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
    onSuccess: async () => {
      // 업데이트 후 최신 사용자 정보 가져오기
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const updatedUser: CurrentUser = {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          };

          // CURRENT_USER 쿼리 캐시 업데이트
          queryClient.setQueryData<CurrentUser>(
            [QUERY_KEYS.CURRENT_USER],
            updatedUser
          );

          // currentUser 쿼리도 업데이트 (하위 호환성)
          queryClient.setQueryData<CurrentUser>(["currentUser"], updatedUser);
        }
      } catch (error) {
        // 사용자 정보 가져오기 실패 시 무효화로 폴백
        console.error("프로필 업데이트 후 사용자 정보 가져오기 실패:", error);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
    onError: (error: UpdateProfileError) => {
      console.error("프로필 업데이트 실패:", error.message);
    },
  });
};
