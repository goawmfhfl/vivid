import type { CreateProfileRequest } from "@/types/profile";

/**
 * 프로필 생성 공통 함수
 */
export async function createUserProfile(
  profileData: CreateProfileRequest
): Promise<void> {
  const profileResponse = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!profileResponse.ok) {
    const errorData = await profileResponse.json();
    console.error("프로필 생성 실패:", errorData);

    // 프로필이 이미 존재하는 경우는 무시 (중복 가입 방지)
    if (profileResponse.status === 409) {
      console.log("프로필이 이미 존재합니다.");
      return;
    }

    throw new Error(
      errorData.error || "프로필 생성에 실패했습니다. 관리자에게 문의해주세요."
    );
  }
}
