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
 * user_metadata에 저장 (profiles 테이블 대신)
 */
export async function updateLastLoginAt(userId: string): Promise<void> {
  try {
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user || user.id !== userId) {
      // 현재 사용자가 아니거나 가져오기 실패 시 무시
      return;
    }

    // 기존 user_metadata 가져오기
    const currentMetadata = user.user_metadata || {};

    // last_login_at 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        last_login_at: new Date().toISOString(),
      },
    });

    if (updateError) {
      console.error("last_login_at 업데이트 오류:", updateError);
      // 에러가 발생해도 로그인은 계속 진행
    }
  } catch (error) {
    console.error("last_login_at 업데이트 중 예상치 못한 오류:", error);
    // 에러가 발생해도 로그인은 계속 진행
  }
}
