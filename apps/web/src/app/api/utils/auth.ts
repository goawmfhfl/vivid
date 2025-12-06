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

  // Supabase 인증 토큰 쿠키 찾기 (일반적인 쿠키 이름 패턴)
  // Supabase는 여러 쿠키를 사용하므로, access_token을 포함한 쿠키를 찾습니다
  const supabaseUrlMatch = supabaseUrl.match(/https?:\/\/([^.]+)/);
  const projectRef = supabaseUrlMatch ? supabaseUrlMatch[1].split('.')[0] : '';
  
  // Supabase 쿠키 이름 패턴: sb-<project-ref>-auth-token 또는 sb-<project-ref>-auth-token-code-verifier 등
  const authTokenCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
  
  if (!authTokenCookie?.value) {
    throw new Error("Unauthorized: Missing authentication cookie");
  }

  // 쿠키 값에서 access_token 추출 (JSON 파싱)
  let accessToken: string | null = null;
  try {
    const cookieData = JSON.parse(authTokenCookie.value);
    accessToken = cookieData?.access_token || null;
  } catch {
    // 쿠키가 JSON 형식이 아닌 경우, 직접 토큰 값일 수 있음
    accessToken = authTokenCookie.value;
  }

  if (!accessToken) {
    throw new Error("Unauthorized: Invalid authentication cookie format");
  }

  // Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 토큰으로 사용자 정보 가져오기
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Unauthorized: Invalid or expired authentication token");
  }

  return user.id;
}
