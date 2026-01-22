import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserIdentity } from "@supabase/supabase-js";

// 커스텀 에러 클래스
class KakaoLinkingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "KakaoLinkingError";
  }
}

// 카카오 연동 상태 조회
const getKakaoIdentity = async (): Promise<UserIdentity | null> => {
  const { data: identities, error } = await supabase.auth.getUserIdentities();

  if (error) {
    throw new KakaoLinkingError(
      error.message || "연동 정보를 불러오는데 실패했습니다."
    );
  }

  return (
    identities?.identities.find((identity) => identity.provider === "kakao") ||
    null
  );
};

// 카카오 계정 연동
const linkKakaoAccount = async (): Promise<void> => {
  // NEXT_PUBLIC_NODE_ENV에 따라 URL 설정
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  const isProduction = runtimeEnv === "production";
  const isDevelopment = runtimeEnv === "development";
  
  let redirectTo: string;
  
  if (isProduction) {
    redirectTo = "https://vividlog.app";
  } else if (isDevelopment) {
    redirectTo = "http://localhost:3000";
  } else {
    // test 환경 또는 기타 환경
    redirectTo = process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : null) ||
      "http://localhost:3000";
  }

  if (!redirectTo) {
    throw new KakaoLinkingError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  const { data, error } = await supabase.auth.linkIdentity({
    provider: "kakao",
    options: {
      redirectTo: `${redirectTo.replace(/\/$/, "")}/auth/callback?link=kakao`,
    },
  });

  if (error) {
    // Manual linking이 비활성화된 경우에 대한 명확한 메시지
    let errorMessage = error.message || "카카오 계정 연동에 실패했습니다.";
    
    if (error.message?.includes("Manual linking is disabled")) {
      errorMessage =
        "계정 연동 기능을 사용하려면 Supabase 설정에서 'Manual Linking' 기능을 활성화해야 합니다. 관리자에게 문의해주세요.";
    } else if (error.message?.includes("identity_already_exists") || error.code === "identity_already_exists") {
      errorMessage =
        "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다. 다른 카카오 계정을 사용하거나 관리자에게 문의해주세요.";
    }

    // 에러 로깅
    console.error("[Kakao Linking Error]", {
      message: error.message,
      code: error.code || error.status,
      redirectTo,
      runtimeEnv,
    });

    throw new KakaoLinkingError(errorMessage, error.message || error.code);
  }
};

// 카카오 계정 연동 해제
const unlinkKakaoAccount = async (identity: UserIdentity): Promise<void> => {
  const { data: identities } = await supabase.auth.getUserIdentities();

  if (!identities || identities.identities.length <= 1) {
    throw new KakaoLinkingError(
      "최소 하나의 로그인 방법은 유지해야 합니다."
    );
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    // Manual linking이 비활성화된 경우에 대한 명확한 메시지
    let errorMessage = error.message || "카카오 계정 연동 해제에 실패했습니다.";
    
    if (error.message?.includes("Manual linking is disabled")) {
      errorMessage =
        "계정 연동 해제 기능을 사용하려면 Supabase 설정에서 'Manual Linking' 기능을 활성화해야 합니다. 관리자에게 문의해주세요.";
    }

    throw new KakaoLinkingError(errorMessage, error.message);
  }
};

// 카카오 연동 상태 조회 훅
export const useKakaoIdentity = () => {
  return useQuery({
    queryKey: ["kakao-identity"],
    queryFn: getKakaoIdentity,
    retry: 1,
  });
};

// 카카오 계정 연동 훅
export const useLinkKakao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkKakaoAccount,
    onSuccess: async () => {
      // 연동 성공 후 상태 갱신
      queryClient.invalidateQueries({ queryKey: ["kakao-identity"] });
      // 구독 정보 동기화 (user_metadata 보존)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/subscriptions/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
          });
          // 사용자 정보 캐시 갱신
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }
      } catch (error) {
        console.error("구독 정보 동기화 실패:", error);
      }
    },
    onError: (error: KakaoLinkingError) => {
      console.error("카카오 계정 연동 실패:", error.message);
    },
  });
};

// 카카오 계정 연동 해제 훅
export const useUnlinkKakao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkKakaoAccount,
    onSuccess: async () => {
      // 해제 성공 후 상태 갱신
      queryClient.invalidateQueries({ queryKey: ["kakao-identity"] });
      // 구독 정보 동기화 (user_metadata 보존)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/subscriptions/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
          });
          // 사용자 정보 캐시 갱신
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }
      } catch (error) {
        console.error("구독 정보 동기화 실패:", error);
      }
    },
    onError: (error: KakaoLinkingError) => {
      console.error("카카오 계정 연동 해제 실패:", error.message);
    },
  });
};
