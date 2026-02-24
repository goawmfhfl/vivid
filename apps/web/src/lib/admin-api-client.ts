import { supabase } from "@/lib/supabase";

/**
 * 관리자 API 호출을 위한 헬퍼 함수
 * Supabase 세션을 자동으로 가져와서 Authorization 헤더에 포함
 */
export async function adminApiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Supabase 세션 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  // FormData일 때 Content-Type 생략 (boundary 자동 설정)
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${session.access_token}`,
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
