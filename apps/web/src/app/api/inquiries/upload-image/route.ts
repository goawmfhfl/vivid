import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "../../utils/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/inquiries/upload-image
 * 문의사항 이미지 업로드
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    // 사용자 ID 확인
    let userId: string;
    try {
      userId = await getAuthenticatedUserId(request);
    } catch {
      userId = await getAuthenticatedUserIdFromCookie();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    // 파일 크기 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 파일 타입 검사
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)" },
        { status: 400 }
      );
    }

    // 사용자 세션 토큰으로 Supabase 클라이언트 생성 (RLS 정책을 통과하기 위해)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // 파일명 생성 (userId/timestamp-random.extension)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${userId}/${timestamp}-${random}.${extension}`;

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Storage에 업로드
    const { data, error } = await supabase.storage
      .from("inquiries-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("이미지 업로드 실패:", error);
      return NextResponse.json(
        { error: `이미지 업로드에 실패했습니다: ${error.message}` },
        { status: 500 }
      );
    }

    // 공개 URL 생성 (버킷이 private이므로 signed URL 사용)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("inquiries-images")
      .createSignedUrl(fileName, 3600); // 1시간 유효

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL 생성 실패:", signedUrlError);
      // signed URL 실패 시 public URL 시도
      const {
        data: { publicUrl },
      } = supabase.storage.from("inquiries-images").getPublicUrl(fileName);
      
      return NextResponse.json({
        url: publicUrl,
        path: data.path,
      });
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      path: data.path,
    });
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `이미지 업로드 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
