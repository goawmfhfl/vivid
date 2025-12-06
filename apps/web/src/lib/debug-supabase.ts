/**
 * Supabase CORS 디버깅 유틸리티
 *
 * 브라우저 콘솔에서 사용:
 * import { debugSupabaseConnection } from '@/lib/debug-supabase';
 * debugSupabaseConnection();
 */

export async function debugSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "unknown";

  console.log("🔍 Supabase 연결 디버깅 시작");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 1. 환경 변수 확인
  console.log("\n1️⃣ 환경 변수 확인:");
  console.log("  Supabase URL:", supabaseUrl || "❌ 설정되지 않음");
  console.log("  Origin:", origin);
  console.log(
    "  Anon Key:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 설정됨" : "❌ 설정되지 않음"
  );

  if (!supabaseUrl) {
    console.error("\n❌ Supabase URL이 설정되지 않았습니다!");
    return;
  }

  // 2. Health Check
  console.log("\n2️⃣ Health Check:");
  try {
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "HEAD",
    });
    console.log("  Status:", healthResponse.status);
    console.log("  Headers:", {
      "Access-Control-Allow-Origin": healthResponse.headers.get(
        "Access-Control-Allow-Origin"
      ),
    });
  } catch (error) {
    console.error("  ❌ Health check 실패:", error);
  }

  // 3. CORS Preflight 테스트
  console.log("\n3️⃣ CORS Preflight 테스트 (OPTIONS):");
  try {
    const optionsResponse = await fetch(`${supabaseUrl}/auth/v1/token`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,apikey,authorization",
      },
    });

    console.log("  Status:", optionsResponse.status);
    console.log("  CORS Headers:", {
      "Access-Control-Allow-Origin": optionsResponse.headers.get(
        "Access-Control-Allow-Origin"
      ),
      "Access-Control-Allow-Methods": optionsResponse.headers.get(
        "Access-Control-Allow-Methods"
      ),
      "Access-Control-Allow-Headers": optionsResponse.headers.get(
        "Access-Control-Allow-Headers"
      ),
      "Access-Control-Allow-Credentials": optionsResponse.headers.get(
        "Access-Control-Allow-Credentials"
      ),
    });

    const allowedOrigin = optionsResponse.headers.get(
      "Access-Control-Allow-Origin"
    );
    if (allowedOrigin === "*" || allowedOrigin === origin) {
      console.log("  ✅ CORS 설정 정상");
    } else {
      console.warn("  ⚠️ CORS 설정 문제:", {
        "요청 Origin": origin,
        "허용된 Origin": allowedOrigin || "없음",
        "권장 조치": "Supabase 대시보드에서 Site URL과 Redirect URLs 확인",
      });
    }
  } catch (error) {
    console.error("  ❌ Preflight 요청 실패:", error);
    console.error("  💡 네트워크 문제일 수 있습니다. VPN/프록시를 확인하세요.");
  }

  // 4. Supabase 클라이언트 테스트
  console.log("\n4️⃣ Supabase 클라이언트 테스트:");
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const testClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          flowType: "pkce",
        },
      }
    );

    // 세션 확인 (에러가 나도 정상 - 로그인 안 되어 있을 수 있음)
    const { data: sessionData, error: sessionError } =
      await testClient.auth.getSession();
    if (sessionError) {
      console.log("  세션 확인:", sessionError.message);
    } else {
      console.log("  세션:", sessionData.session ? "✅ 있음" : "❌ 없음");
    }
  } catch (error) {
    console.error("  ❌ 클라이언트 테스트 실패:", error);
  }

  // 5. 권장 조치사항
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 권장 조치사항:");
  console.log("  1. Supabase 대시보드 → Authentication → URL Configuration");
  console.log("     - Site URL: http://localhost:3000");
  console.log("     - Redirect URLs: http://localhost:3000/**");
  console.log("  2. 개발 서버 재시작 (Ctrl+C 후 npm run dev)");
  console.log("  3. 브라우저 캐시 삭제 (F12 → Application → Clear storage)");
  console.log("  4. 시크릿 모드에서 테스트");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// 브라우저 콘솔에서 직접 사용할 수 있도록 전역 함수로 등록
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugSupabase = debugSupabaseConnection;
}
