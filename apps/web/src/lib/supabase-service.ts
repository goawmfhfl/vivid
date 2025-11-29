import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서비스 키 Supabase 클라이언트 지연 생성 (환경변수 미주입 시 초기화 오류 방지)
let cachedServiceClient: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient {
  if (cachedServiceClient) return cachedServiceClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("supabaseUrl is required (NEXT_PUBLIC_SUPABASE_URL)");
  }

  if (!serviceRoleKey) {
    throw new Error("supabaseKey is required (SUPABASE_SERVICE_ROLE_KEY)");
  }

  cachedServiceClient = createClient(supabaseUrl, serviceRoleKey);
  return cachedServiceClient;
}
