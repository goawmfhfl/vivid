import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface SocialOnboardingData {
  name: string;
  phone: string;
  birthYear: string;
  gender: string;
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
}

class SocialOnboardingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "SocialOnboardingError";
  }
}

const completeSocialOnboarding = async (
  data: SocialOnboardingData
): Promise<void> => {
  const {
    name,
    phone,
    birthYear,
    gender,
    agreeTerms,
    agreeAI,
    agreeMarketing,
  } = data;

  if (!name) throw new SocialOnboardingError("이름을 입력해주세요.");
  if (!phone) throw new SocialOnboardingError("전화번호를 입력해주세요.");
  if (!birthYear) throw new SocialOnboardingError("출생년도를 입력해주세요.");
  if (!gender) throw new SocialOnboardingError("성별을 선택해주세요.");
  if (!agreeTerms || !agreeAI)
    throw new SocialOnboardingError("필수 약관에 동의해주세요.");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new SocialOnboardingError(
      "로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.",
      error?.message
    );
  }

  const mergedMetadata = {
    ...(user.user_metadata || {}),
    name,
    phone,
    birthYear,
    gender,
    agreeTerms,
    agreeAI,
    agreeMarketing,
  };

  const { error: updateError } = await supabase.auth.updateUser({
    data: mergedMetadata,
  });

  if (updateError) {
    throw new SocialOnboardingError(
      updateError.message || "정보 저장에 실패했습니다.",
      updateError.code
    );
  }
};

export const useCompleteSocialSignUp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: completeSocialOnboarding,
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: SocialOnboardingError) => {
      console.error("소셜 온보딩 실패:", error.message);
    },
  });
};
