import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, ERROR_MESSAGES } from "@/constants";
import {
  isRefreshTokenError,
  clearSessionOnRefreshTokenError,
  getAuthErrorMessage,
} from "@/lib/auth-error";

// 현재 사용자 정보 타입
export interface CurrentUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

// 커스텀 에러 클래스
export class UserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "UserError";
  }
}

// 현재 사용자 정보 가져오기 함수
const getCurrentUser = async (): Promise<CurrentUser> => {
  try {
    // 1) 먼저 로컬 세션만 확인. 세션이 없으면 getUser() 호출 없이 로그인 필요 반환
    //    → 리프레시 시도를 트리거하지 않아 "Refresh Token Not Found" 발생 가능성 감소
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError && isRefreshTokenError(sessionError)) {
      await clearSessionOnRefreshTokenError();
      throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED, "INVALID_REFRESH_TOKEN");
    }
    if (sessionError) {
      throw new UserError(
        getAuthErrorMessage(sessionError) || ERROR_MESSAGES.LOGIN_REQUIRED
      );
    }
    if (!sessionData?.session?.user) {
      throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }

    // 2) 세션이 있으면 서버 검증 (getUser) — 이때 리프레시가 필요하면 시도됨
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (isRefreshTokenError(error)) {
        await clearSessionOnRefreshTokenError();
        throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED, "INVALID_REFRESH_TOKEN");
      }
      throw new UserError(
        getAuthErrorMessage(error) || "사용자 정보 조회에 실패했습니다."
      );
    }

    if (!user) {
      throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    };
  } catch (error) {
    if (error instanceof UserError) throw error;
    // Supabase가 예외를 던진 경우(예: 네트워크/리프레시 실패)
    if (isRefreshTokenError(error)) {
      await clearSessionOnRefreshTokenError();
      throw new UserError(ERROR_MESSAGES.LOGIN_REQUIRED, "INVALID_REFRESH_TOKEN");
    }
    throw new UserError(
      getAuthErrorMessage(error) || ERROR_MESSAGES.LOGIN_REQUIRED
    );
  }
};

export const getCurrentUserCacheContext = async (): Promise<{
  userId: string;
  cacheBust?: string;
}> => {
  const user = await getCurrentUser();
  const cacheBust =
    typeof user.user_metadata?.cache_bust === "string"
      ? user.user_metadata.cache_bust
      : undefined;

  return {
    userId: user.id,
    cacheBust,
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
