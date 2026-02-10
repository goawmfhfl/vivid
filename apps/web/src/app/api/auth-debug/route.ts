import { NextRequest, NextResponse } from "next/server";

/**
 * 개발용 OAuth 디버그 로그 수집.
 * Expo Go 등에서 디바이스의 WebView는 터미널에 접근할 수 없으므로,
 * 콜백 페이지에서 이 API로 로그를 보내면 npm run dev 터미널에 출력된다.
 * 사용법: 앱에서 애플 로그인 시도 후, 이 터미널을 확인하세요.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ts = new Date().toISOString();
    const line = `[auth-debug ${ts}] ${JSON.stringify(body)}`;
    console.log("\n" + "─".repeat(60));
    console.log(line);
    console.log("─".repeat(60) + "\n");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
