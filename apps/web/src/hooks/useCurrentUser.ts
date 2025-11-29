import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, ERROR_MESSAGES } from "@/constants";

// 현재 사용자 정보 타입
export interface CurrentUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

// 커스텀 에러 클래스
class UserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "UserError";
  }
}

// 현재 사용자 정보 가져오기 함수
const getCurrentUser = async (): Promise<CurrentUser> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new UserError(`사용자 정보 조회 실패: ${error.message}`);
  }

  if (!user) {
    throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED);
  }

  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };
};

// 현재 사용자 ID만 가져오기 함수
export const getCurrentUserId = async (): Promise<string> => {
  const user = await getCurrentUser();
  return user.id;
};

// 현재 사용자 정보 조회 훅
export const useCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    retry: false, // 로그인되지 않은 경우 재시도하지 않음
  });
};

// 현재 사용자 ID 조회 훅 (간단한 버전)
export const useCurrentUserId = () => {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    userId: user?.id,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
};
