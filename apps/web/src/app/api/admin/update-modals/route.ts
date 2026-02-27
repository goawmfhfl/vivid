import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(app)/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/update-modals
 * 모달 목록 조회 (관리자)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("admin_update_modals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("모달 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "모달 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ modals: data ?? [] });
  } catch (error) {
    console.error("모달 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "모달 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/update-modals
 * 모달 생성 (관리자)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { title, image_path, destination_path, display_from, display_until } =
      body as {
        title: string;
        image_path: string;
        destination_path: string;
        display_from?: string;
        display_until?: string | null;
      };

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }
    if (!image_path?.trim()) {
      return NextResponse.json(
        { error: "이미지를 등록해주세요." },
        { status: 400 }
      );
    }
    if (!destination_path?.trim()) {
      return NextResponse.json(
        { error: "이동 경로를 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("admin_update_modals")
      .insert({
        title: title.trim(),
        image_path: image_path.trim(),
        destination_path: destination_path.trim().startsWith("/")
          ? destination_path.trim()
          : `/${destination_path.trim()}`,
        is_displayed: false,
        display_from: display_from
          ? new Date(display_from).toISOString()
          : new Date().toISOString(),
        display_until: display_until
          ? new Date(display_until).toISOString()
          : null,
      })
      .select()
      .single();

    if (error) {
      console.error("모달 생성 실패:", error);
      return NextResponse.json(
        { error: "모달 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ modal: data });
  } catch (error) {
    console.error("모달 생성 실패:", error);
    return NextResponse.json(
      { error: "모달 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
