import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserIdentity } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

class GoogleLinkingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "GoogleLinkingError";
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

const getGoogleIdentity = async (): Promise<UserIdentity | null> => {
  const { data: identities, error } = await supabase.auth.getUserIdentities();

  if (error) {
    throw new GoogleLinkingError(
      error.message || "연동 정보를 불러오는데 실패했습니다."
    );
  }

  return (
    identities?.identities.find((identity) => identity.provider === "google") ||
    null
  );
};

const linkGoogleAccount = async (): Promise<void> => {
  const redirectTo = getRedirectBase();
  if (!redirectTo) {
    throw new GoogleLinkingError(
      "리디렉션 URL을 찾을 수 없습니다. 환경 변수를 확인해주세요."
    );
  }

  const { error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${redirectTo.replace(/\/$/, "")}/auth/callback?link=google`,
    },
  });

  if (error) {
    let errorMessage = error.message || "구글 계정 연동에 실패했습니다.";

    if (error.message?.includes("Manual linking is disabled")) {
      errorMessage =
        "계정 연동 기능을 사용하려면 Supabase 설정에서 'Manual Linking' 기능을 활성화해야 합니다. 관리자에게 문의해주세요.";
    } else if (
      error.message?.includes("identity_already_exists") ||
      error.code === "identity_already_exists"
    ) {
      errorMessage = "이미 사용 중인 계정입니다.";
    }

    console.error("[Google Linking Error]", {
      message: error.message,
      code: error.code || error.status,
      redirectTo: `${redirectTo}/auth/callback?link=google`,
    });

    throw new GoogleLinkingError(errorMessage, error.message || error.code);
  }
};

export const useGoogleIdentity = () => {
  return useQuery({
    queryKey: ["google-identity"],
    queryFn: getGoogleIdentity,
    retry: 1,
  });
};

export const useLinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkGoogleAccount,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["google-identity"] });
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
    onError: (error: GoogleLinkingError) => {
      console.error("구글 계정 연동 실패:", error.message);
    },
  });
};
