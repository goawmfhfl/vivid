import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

const BUCKET = "admin-modal-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/**
 * POST /api/admin/announcements/upload-modal
 * 모달 대표 이미지 업로드 1024x1024 (관리자)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `modals/${timestamp}-${random}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("모달 이미지 업로드 실패:", error);
      return NextResponse.json(
        { error: `이미지 업로드에 실패했습니다: ${error.message}` },
        { status: 500 }
      );
    }

    const path = data.path ?? fileName;
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("모달 이미지 업로드 실패:", error);
    const msg = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `이미지 업로드 실패: ${msg}` },
      { status: 500 }
    );
  }
}
