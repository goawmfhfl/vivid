import { supabase } from "./supabase";
import type { Profile } from "@/types/profile";

/**
 * 현재 로그인한 사용자의 프로필 조회
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("프로필 조회 오류:", error);
    return null;
  }

  return profile;
}

/**
 * 로그인 시 last_login_at 업데이트
 * 클라이언트 사이드에서 직접 Supabase를 사용 (RLS 정책을 통해 자신의 프로필만 업데이트 가능)
 */
export async function updateLastLoginAt(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("last_login_at 업데이트 오류:", error);
      // 에러가 발생해도 로그인은 계속 진행
    }
  } catch (error) {
    console.error("last_login_at 업데이트 중 예상치 못한 오류:", error);
    // 에러가 발생해도 로그인은 계속 진행
  }
}
