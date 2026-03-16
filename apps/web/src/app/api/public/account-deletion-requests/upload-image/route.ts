import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "@/app/api/utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";

const INQUIRIES_BUCKET = "inquiries-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

type RateLimitStore = Map<string, number[]>;

function getRateLimitStore(): RateLimitStore {
  const key = "__publicAccountDeletionImageRateLimit__";
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

async function getOptionalAuthUserId(request: NextRequest): Promise<string | null> {
  try {
    return await getAuthenticatedUserId(request);
  } catch {
    try {
      return await getAuthenticatedUserIdFromCookie();
    } catch {
      return null;
    }
  }
}

/**
 * POST /api/public/account-deletion-requests/upload-image
 * 공개 계정삭제 요청 이미지 업로드
 */
export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: "이미지 업로드 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const honeypot = String(formData.get("website") || "");
    if (honeypot.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP)" },
        { status: 400 }
      );
    }

    const userId = await getOptionalAuthUserId(request);
    const ownerSegment = userId || "guest";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 12);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `public-account-deletion/${ownerSegment}/${timestamp}-${random}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getServiceSupabase();
    const { error: uploadError } = await supabase.storage
      .from(INQUIRIES_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("공개 이미지 업로드 실패:", uploadError);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from(INQUIRIES_BUCKET)
      .createSignedUrl(path, 3600);

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: "이미지 URL 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      path,
    });
  } catch (error) {
    console.error("공개 이미지 업로드 처리 실패:", error);
    return NextResponse.json(
      { error: "이미지 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
