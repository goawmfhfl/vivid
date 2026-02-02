import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// 회원가입 데이터 타입 정의
export interface SignUpData {
  email?: string; // 소셜 로그인 케이스에서는 optional
  password?: string; // 소셜 로그인 케이스에서는 optional
  name: string;
  phone: string;
  birthYear: string;
  gender: string;
  agreeTerms: boolean;
  agreeAI: boolean;
  agreeMarketing: boolean;
  isSocialOnboarding?: boolean; // 소셜 로그인 완료 플래그
  couponCode?: string; // 쿠폰 코드 (선택)
}

// 회원가입 응답 타입 정의
export interface SignUpResponse {
  user: User | null;
  session: Session | null;
}

// 커스텀 에러 클래스
class SignUpError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "SignUpError";
  }
}

// 회원가입 함수
const signUpUser = async (data: SignUpData): Promise<SignUpResponse> => {
  const {
    email,
    password,
    name,
    phone,
    birthYear,
    gender,
    agreeTerms,
    agreeAI,
    agreeMarketing,
    isSocialOnboarding = false,
    couponCode,
  } = data;

  // 공통 필드 검증
  if (!name) {
    throw new SignUpError("이름을 입력해주세요.");
  }

  if (!phone) {
    throw new SignUpError("전화번호를 입력해주세요.");
  }

  if (!birthYear) {
    throw new SignUpError("출생년도를 입력해주세요.");
  }

  if (!gender) {
    throw new SignUpError("성별을 선택해주세요.");
  }

  if (!agreeTerms || !agreeAI) {
    throw new SignUpError("필수 약관에 동의해주세요.");
  }

  try {
    let user: User | null = null;
    let session: Session | null = null;

    if (isSocialOnboarding) {
      // 소셜 로그인 완료 케이스: 이미 로그인된 사용자 정보 및 세션 가져오기
      const [userResult, sessionResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      if (userResult.error || !userResult.data.user) {
        throw new SignUpError(
          "로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.",
          userResult.error?.message
        );
      }

      user = userResult.data.user;
      session = sessionResult.data.session; // 세션도 가져와서 쿠폰 적용 시 사용

      // 현재 시간 (서버 시간 기준)
      const now = new Date().toISOString();

      // 사용자 메타데이터 업데이트
      const mergedMetadata = {
        ...(user.user_metadata || {}),
        name,
        phone: phone.replace(/[\s-]/g, ""), // 정규화된 전화번호
        birthYear,
        gender,
        agreeTerms,
        agreeAI,
        agreeMarketing,
        phone_verified: true, // 핸드폰 인증 완료
        phone_verified_at: now,
        role: "user", // 기본 역할
        subscription: {
          plan: "free",
          status: "none",
          started_at: null,
          expires_at: null,
          updated_at: now,
        },
      };

      const { error: updateError } = await supabase.auth.updateUser({
        data: mergedMetadata,
      });

      if (updateError) {
        throw new SignUpError(
          updateError.message || "정보 저장에 실패했습니다.",
          updateError.code
        );
      }
    } else {
      // 일반 회원가입 케이스
      if (!email || !password) {
        throw new SignUpError("이메일과 비밀번호를 입력해주세요.");
      }

      // 1. Supabase Auth를 통한 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            agreeTerms,
            agreeAI,
            agreeMarketing,
            name,
            phone: phone.replace(/[\s-]/g, ""), // 정규화된 전화번호
            birthYear,
            gender,
            phone_verified: true, // 핸드폰 인증 완료
            phone_verified_at: new Date().toISOString(),
            role: "user", // 기본 역할
            subscription: {
              plan: "free",
              status: "none",
              started_at: null,
              expires_at: null,
              updated_at: new Date().toISOString(),
            },
          },
        },
      });

      if (authError) {
        // Supabase 에러 메시지를 한국어로 변환
        let errorMessage = authError.message;

        if (authError.message.includes("already registered")) {
          errorMessage = "이미 가입된 이메일입니다.";
        } else if (authError.message.includes("Invalid email")) {
          errorMessage = "올바른 이메일 형식을 입력해주세요.";
        } else if (authError.message.includes("Password should be")) {
          errorMessage = "비밀번호는 6자 이상이어야 합니다.";
        } else if (authError.message.includes("over_email_send_rate_limit")) {
          errorMessage =
            "이메일 전송이 너무 빈번합니다. 잠시 후 다시 시도해주세요.";
        } else if (authError.message.includes("signup_disabled")) {
          errorMessage = "현재 회원가입이 일시적으로 중단되었습니다.";
        } else if (authError.message.includes("email_not_confirmed")) {
          errorMessage = "이메일 인증이 필요합니다. 이메일을 확인해주세요.";
        }

        throw new SignUpError(errorMessage, authError.message);
      }

      if (!authData.user) {
        throw new SignUpError("회원가입에 실패했습니다.");
      }

      user = authData.user;
      session = authData.session;
    }

    if (!user) {
      throw new SignUpError("사용자 정보를 가져올 수 없습니다.");
    }

    // 2. 쿠폰 적용 (쿠폰 코드가 있는 경우)
    if (couponCode) {
      try {
        // 세션이 있으면 Authorization 헤더 사용
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        console.log("[Signup] 쿠폰 적용 시도:", {
          couponCode,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
        });

        const couponResponse = await fetch("/api/coupons/apply", {
          method: "POST",
          headers,
          credentials: "include", // 쿠키 인증을 위해 credentials 포함
          body: JSON.stringify({ code: couponCode }),
        });

        if (!couponResponse.ok) {
          const errorData = await couponResponse.json();
          console.error("[Signup] 쿠폰 적용 실패:", errorData);
          // 쿠폰 적용 실패는 에러로 처리하지 않고 로그만 남김
          // (회원가입은 성공했으므로)
        } else {
          const successData = await couponResponse.json();
          console.log("[Signup] 쿠폰 적용 성공:", {
            couponCode,
            expiresAt: successData.expiresAt,
          });
        }
      } catch (couponError) {
        console.error("[Signup] 쿠폰 처리 중 오류:", couponError);
        // 쿠폰 처리 실패는 에러로 처리하지 않고 로그만 남김
        // (회원가입은 성공했으므로)
      }
    }

    return { user, session };
  } catch (error) {
    if (error instanceof SignUpError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("회원가입 중 예상치 못한 에러:", error);
    throw new SignUpError(
      "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};

// 회원가입 훅
export const useSignUp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: SignUpError) => {
      console.error("회원가입 실패:", error.message);
    },
  });
};
