import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Next.js API 라우트에서 인증된 사용자 ID를 가져오는 함수
 * Authorization 헤더에서 토큰을 추출하여 검증
 */
export async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string> {
  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  // Supabase 클라이언트 생성 (익명 키 사용)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 토큰으로 사용자 정보 가져오기
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized: Invalid token");
  }

  return user.id;
}

/**
 * 쿠키에서 인증된 사용자 ID를 가져오는 함수
 * 클라이언트에서 쿠키를 통해 자동으로 인증 정보를 전달받는 경우 사용
 */
export async function getAuthenticatedUserIdFromCookie(): Promise<string> {
  // Next.js의 cookies()를 통해 클라이언트의 쿠키 읽기
  const cookieStore = await cookies();

  // Supabase 클라이언트 생성 (쿠키 기반 인증)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  // 쿠키에서 사용자 정보 가져오기
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Invalid or missing authentication cookie");
  }

  return user.id;
}
