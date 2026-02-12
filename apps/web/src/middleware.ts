import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Chrome DevTools가 보내는 /.well-known 요청을 즉시 처리하여
 * 동시 컴파일로 인한 segment-explorer useContext null 버그 완화 (Next.js #79427)
 */
export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname ===
    "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/.well-known/appspecific/:path*"],
};
