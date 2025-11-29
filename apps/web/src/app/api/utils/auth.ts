import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
