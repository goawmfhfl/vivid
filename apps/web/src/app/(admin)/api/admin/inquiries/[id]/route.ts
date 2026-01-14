import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UpdateInquiryRequest, Inquiry } from "@/types/inquiry";

const INQUIRIES_BUCKET = "inquiries-images";

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

/**
 * PUT /api/admin/inquiries/[id]
 * 문의사항 수정 (관리자 전용)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body: UpdateInquiryRequest = await request.json();
    const { status, admin_response, admin_response_images } = body;

    const supabase = getServiceSupabase();

    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (admin_response !== undefined) {
      updateData.admin_response = admin_response;
    }
    if (admin_response_images !== undefined) {
      // UI에서는 signed url을 들고 있을 수 있어 path로 정규화해서 저장
      updateData.admin_response_images = (admin_response_images || []).map(
        extractInquiriesImagePath
      );
    }

    // 문의사항 수정
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("문의사항 수정 실패:", error);
      return NextResponse.json(
        { error: "문의사항을 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    if (!inquiry) {
      return NextResponse.json(
        { error: "문의사항을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "문의사항이 성공적으로 수정되었습니다.",
      inquiry: inquiry as Inquiry,
    });
  } catch (error) {
    console.error("문의사항 수정 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `문의사항 수정 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/inquiries/[id]
 * 문의사항 삭제 (관리자 전용)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    const supabase = getServiceSupabase();

    // 문의사항의 이미지 URL 가져오기
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("images")
      .eq("id", id)
      .single();

    // 문의사항 삭제
    const { error } = await supabase.from("inquiries").delete().eq("id", id);

    if (error) {
      console.error("문의사항 삭제 실패:", error);
      return NextResponse.json(
        { error: "문의사항을 삭제하는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 이미지 삭제 (선택적 - 필요시 구현)
    if (inquiry?.images && inquiry.images.length > 0) {
      // Storage에서 이미지 삭제는 별도로 처리하거나
      // 자동 정리 스크립트로 처리할 수 있습니다.
    }

    return NextResponse.json({
      message: "문의사항이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("문의사항 삭제 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `문의사항 삭제 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
