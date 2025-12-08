"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { updateLastLoginAt } from "@/lib/profile-utils";

const isProfileCompleted = (user: User) => {
  const metadata = user.user_metadata || {};
  return Boolean(
    metadata.name &&
      metadata.phone &&
      metadata.birthYear &&
      metadata.gender &&
      metadata.agreeTerms &&
      metadata.agreeAI
  );
};

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("인증 에러:", error);
          router.push("/login?error=인증에 실패했습니다.");
          return;
        }

        if (data.session) {
          const user = data.session.user;
          if (!user) {
            router.push("/login");
            return;
          }

          if (!isProfileCompleted(user)) {
            const emailQuery = user.email
              ? `&email=${encodeURIComponent(user.email)}`
              : "";
            router.replace(`/signup?social=1${emailQuery}`);
            return;
          }

          // 프로필의 last_login_at 업데이트
          await updateLastLoginAt(user.id);

          // 구독이 없으면 기본 free 플랜 생성
          try {
            const subscriptionResponse = await fetch("/api/subscriptions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                plan: "free",
                status: "active",
                expires_at: null,
              }),
            });

            if (!subscriptionResponse.ok) {
              const errorData = await subscriptionResponse.json();
              // 구독이 이미 존재하는 경우는 정상 (409 에러 무시)
              if (subscriptionResponse.status !== 409) {
                console.error("구독 생성 실패:", errorData);
              }
            }
          } catch (subscriptionError) {
            console.error("구독 생성 중 오류:", subscriptionError);
            // 구독 생성 실패는 에러로 처리하지 않고 로그만 남김
          }

          router.replace("/");
        } else {
          console.log("세션이 없습니다.");
          router.replace("/login");
        }
      } catch (error) {
        console.error("콜백 처리 중 에러:", error);
        router.replace("/login?error=로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <LoadingSpinner message="로그인 처리 중..." size="md" />
    </div>
  );
}
