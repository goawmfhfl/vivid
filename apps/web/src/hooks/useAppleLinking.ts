import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserIdentity } from "@supabase/supabase-js";

class AppleLinkingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AppleLinkingError";
  }
}

const getRedirectBase = (): string => {
  const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  const isProduction = runtimeEnv === "production";
  const isDevelopment = runtimeEnv === "development";

  if (isProduction) return "https://vividlog.app";
  if (isDevelopment) return "http://localhost:3000";
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : null) ||
    "http://localhost:3000"
  );
};

// 애플 연동 상태 조회
const getAppleIdentity = async (): Promise<UserIdentity | null> => {
  const { data: identities, error } = await supabase.auth.getUserIdentities();

  if (error) {
    throw new AppleLinkingError(
      error.message || "연동 정보를 불러오는데 실패했습니다."
    );
  }

  return (
    identities?.identities.find((identity) => identity.provider === "apple") ||
    null
  );
};

// 애플 계정 연동
const linkAppleAccount = async (): Promise<void> => {
  const redirectTo = getRedirectBase();
  if (!redirectTo) {
    throw new AppleLinkingError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  const { error } = await supabase.auth.linkIdentity({
    provider: "apple",
    options: {
      redirectTo: `${redirectTo.replace(/\/$/, "")}/auth/callback?link=apple`,
    },
  });

  if (error) {
    let errorMessage = error.message || "Apple 계정 연동에 실패했습니다.";

    if (error.message?.includes("Manual linking is disabled")) {
      errorMessage =
        "계정 연동 기능을 사용하려면 Supabase 설정에서 'Manual Linking' 기능을 활성화해야 합니다. 관리자에게 문의해주세요.";
    } else if (
      error.message?.includes("identity_already_exists") ||
      error.code === "identity_already_exists"
    ) {
      errorMessage = "이미 사용 중인 계정입니다.";
    }

    console.error("[Apple Linking Error]", {
      message: error.message,
      code: error.code || error.status,
      redirectTo: `${redirectTo}/auth/callback?link=apple`,
    });

    throw new AppleLinkingError(errorMessage, error.message || error.code);
  }
};

// 애플 계정 연동 해제
const unlinkAppleAccount = async (identity: UserIdentity): Promise<void> => {
  const { data: identities } = await supabase.auth.getUserIdentities();

  if (!identities || identities.identities.length <= 1) {
    throw new AppleLinkingError(
      "최소 하나의 로그인 방법은 유지해야 합니다."
    );
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    let errorMessage = error.message || "Apple 계정 연동 해제에 실패했습니다.";

    if (error.message?.includes("Manual linking is disabled")) {
      errorMessage =
        "계정 연동 해제 기능을 사용하려면 Supabase 설정에서 'Manual Linking' 기능을 활성화해야 합니다. 관리자에게 문의해주세요.";
    }

    throw new AppleLinkingError(errorMessage, error.message);
  }
};

export const useAppleIdentity = () => {
  return useQuery({
    queryKey: ["apple-identity"],
    queryFn: getAppleIdentity,
    retry: 1,
  });
};

export const useLinkApple = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkAppleAccount,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["apple-identity"] });
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/subscriptions/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
          });
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }
      } catch (error) {
        console.error("구독 정보 동기화 실패:", error);
      }
    },
    onError: (error: AppleLinkingError) => {
      console.error("Apple 계정 연동 실패:", error.message);
    },
  });
};

export const useUnlinkApple = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkAppleAccount,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["apple-identity"] });
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/subscriptions/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
          });
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }
      } catch (error) {
        console.error("구독 정보 동기화 실패:", error);
      }
    },
    onError: (error: AppleLinkingError) => {
      console.error("Apple 계정 연동 해제 실패:", error.message);
    },
  });
};
