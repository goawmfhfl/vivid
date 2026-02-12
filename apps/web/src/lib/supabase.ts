import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseStorageKey(): string | null {
  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * 손상된/부분 저장된 로컬 세션을 선제 제거해
 * 초기 로드 시 Invalid Refresh Token 콘솔 에러 반복을 방지합니다.
 */
function sanitizePersistedSession(): void {
  if (typeof window === "undefined") return;

  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as
      | { currentSession?: { access_token?: string; refresh_token?: string } }
      | { access_token?: string; refresh_token?: string }
      | null;

    type SessionShape = { access_token?: string; refresh_token?: string };
    const session = (parsed && "currentSession" in parsed
      ? parsed.currentSession
      : parsed) as SessionShape | null | undefined;
    const hasAccessToken = Boolean(session?.access_token);
    const hasRefreshToken = Boolean(session?.refresh_token);

    // access token만 있고 refresh token이 없으면 세션이 깨진 상태로 간주
    if (hasAccessToken && !hasRefreshToken) {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // 파싱 불가한 세션 캐시도 깨진 상태로 간주하고 제거
    window.localStorage.removeItem(storageKey);
  }
}

sanitizePersistedSession();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
});
