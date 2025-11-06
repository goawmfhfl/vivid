"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

          router.push("/");
        } else {
          console.log("세션이 없습니다.");
          router.push("/login");
        }
      } catch (error) {
        console.error("콜백 처리 중 에러:", error);
        router.push("/login?error=로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
