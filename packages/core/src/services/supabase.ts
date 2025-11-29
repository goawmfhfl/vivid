import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트를 생성하는 팩토리 함수
 * 환경 변수에서 URL과 키를 읽어옵니다.
 *
 * @param supabaseUrl Supabase 프로젝트 URL
 * @param supabaseAnonKey Supabase Anon Key
 * @returns Supabase 클라이언트 인스턴스
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}
