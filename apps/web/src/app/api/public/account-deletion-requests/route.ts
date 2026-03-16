import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "@/app/api/utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";

const INQUIRIES_BUCKET = "inquiries-images";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestKind = "inquiry" | "deletion";
type PublicRequestBody = {
  requestKind: RequestKind;
  requesterEmail: string;
  requesterName?: string | null;
  title: string;
  content: string;
  images?: string[];
  consentChecked: boolean;
  honeypot?: string;
};

type RateLimitStore = Map<string, number[]>;

function getRateLimitStore(): RateLimitStore {
  const key = "__publicAccountDeletionRateLimit__";
  const globalObject = globalThis as typeof globalThis & {
    [key: string]: RateLimitStore | undefined;
  };

  if (!globalObject[key]) {
    globalObject[key] = new Map<string, number[]>();
  }
  return globalObject[key];
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function isRateLimited(request: NextRequest): boolean {
  const store = getRateLimitStore();
  const now = Date.now();
  const ip = getClientIp(request);
  const recent = (store.get(ip) || []).filter(
    (timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    store.set(ip, recent);
    return true;
  }

  recent.push(now);
  store.set(ip, recent);
  return false;
}

function extractInquiriesImagePath(value: string): string {
  if (!value) return value;
  if (!value.startsWith("http")) return value;

  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const objectIdx = segments.findIndex((s) => s === "object");
    if (objectIdx === -1) return value;
    const mode = segments[objectIdx + 1];
    const bucket = segments[objectIdx + 2];
    if ((mode !== "sign" && mode !== "public") || bucket !== INQUIRIES_BUCKET) {
      return value;
    }
    const pathSegments = segments.slice(objectIdx + 3);
    const path = decodeURIComponent(pathSegments.join("/"));
    return path || value;
  } catch {
    return value;
  }
}

async function getOptionalAuthContext(request: NextRequest) {
  let userId: string | null = null;
  try {
    userId = await getAuthenticatedUserId(request);
  } catch {
    try {
      userId = await getAuthenticatedUserIdFromCookie();
    } catch {
      userId = null;
    }
  }

  if (!userId) {
    return {
      isAuthenticatedRequest: false,
      userId: null,
      authEmail: null,
    };
  }

  const supabase = getServiceSupabase();
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(userId);

  return {
    isAuthenticatedRequest: true,
    userId,
    authEmail: user?.email ?? null,
  };
}

/**
 * POST /api/public/account-deletion-requests
 * 공개 계정 삭제 요청 제출
 */
export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as PublicRequestBody;
    const {
      requestKind,
      requesterEmail,
      requesterName,
      title,
      content,
      images = [],
      consentChecked,
      honeypot = "",
    } = body;

    if (honeypot.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!consentChecked) {
      return NextResponse.json(
        { error: "본인 요청 확인 동의가 필요합니다." },
        { status: 400 }
      );
    }

    if (requestKind !== "inquiry" && requestKind !== "deletion") {
      return NextResponse.json(
        { error: "요청 유형이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "제목과 내용을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const authContext = await getOptionalAuthContext(request);
    const normalizedRequesterEmail = (
      authContext.authEmail || requesterEmail || ""
    ).trim();

    if (!normalizedRequesterEmail || !emailRegex.test(normalizedRequesterEmail)) {
      return NextResponse.json(
        { error: "유효한 이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "이미지는 최대 5개까지 첨부할 수 있습니다." },
        { status: 400 }
      );
    }

    const normalizedImages = images.map(extractInquiriesImagePath);
    const prefixedTitle =
      requestKind === "deletion"
        ? `[계정 삭제 요청] ${title.trim()}`
        : `[계정 문의] ${title.trim()}`;
    const enrichedContent = [
      `요청 유형: ${requestKind === "deletion" ? "계정 삭제 요청" : "문의 남기기"}`,
      `요청 이메일: ${normalizedRequesterEmail}`,
      "",
      content.trim(),
    ].join("\n");

    const supabase = getServiceSupabase();
    const { error } = await supabase.from("inquiries").insert({
      user_id: authContext.userId,
      type: "account",
      title: prefixedTitle,
      content: enrichedContent,
      images: normalizedImages,
      status: "pending",
      requester_email: normalizedRequesterEmail,
      requester_name: requesterName?.trim() || null,
      request_source: "public_account_deletion",
      is_authenticated_request: authContext.isAuthenticatedRequest,
    });

    if (error) {
      console.error("공개 계정삭제 요청 저장 실패:", error);
      return NextResponse.json(
        { error: "요청을 저장하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "요청이 접수되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    console.error("공개 계정삭제 요청 처리 실패:", error);
    return NextResponse.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
