import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { Coupon } from "@/types/coupon";

/**
 * GET /api/admin/coupons
 * 쿠폰 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const isActive = searchParams.get("is_active");
    const codeSearch = searchParams.get("code") || "";

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 기본 쿼리 구성
    let query = supabase
      .from("coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (isActive !== null && isActive !== "") {
      query = query.eq("is_active", isActive === "true");
    }

    if (codeSearch) {
      query = query.ilike("code", `%${codeSearch}%`);
    }

    const { data: coupons, error, count } = await query;

    if (error) {
      console.error("쿠폰 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "쿠폰 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      coupons: (coupons as Coupon[]) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("쿠폰 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "쿠폰 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * 쿠폰 생성 (관리자 전용)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { code, name, duration_days, is_active = true, max_uses } = body;

    if (!code || !name || !duration_days) {
      return NextResponse.json(
        { error: "code, name, duration_days는 필수입니다." },
        { status: 400 }
      );
    }

    if (duration_days <= 0) {
      return NextResponse.json(
        { error: "duration_days는 1 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 코드 중복 확인
    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "이미 존재하는 쿠폰 코드입니다." },
        { status: 400 }
      );
    }

    // 쿠폰 생성
    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code: code.toUpperCase(),
        name,
        duration_days,
        is_active,
        max_uses: max_uses || null,
        current_uses: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("쿠폰 생성 실패:", error);
      return NextResponse.json(
        { error: "쿠폰을 생성하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "쿠폰이 성공적으로 생성되었습니다.",
      coupon: coupon as Coupon,
    });
  } catch (error) {
    console.error("쿠폰 생성 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `쿠폰 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/coupons
 * 쿠폰 수정 (관리자 전용)
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { id, code, name, duration_days, is_active, max_uses } = body;

    if (!id) {
      return NextResponse.json(
        { error: "쿠폰 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 기존 쿠폰 조회
    const { data: existing } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "쿠폰을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updateData: {
      code?: string;
      name?: string;
      duration_days?: number;
      is_active?: boolean;
      max_uses?: number | null;
      updated_at?: string;
    } = {};

    if (code !== undefined) {
      // 코드 변경 시 중복 확인
      if (code.toUpperCase() !== existing.code) {
        const { data: duplicate } = await supabase
          .from("coupons")
          .select("id")
          .eq("code", code.toUpperCase())
          .single();

        if (duplicate) {
          return NextResponse.json(
            { error: "이미 존재하는 쿠폰 코드입니다." },
            { status: 400 }
          );
        }
      }
      updateData.code = code.toUpperCase();
    }

    if (name !== undefined) updateData.name = name;
    if (duration_days !== undefined) {
      if (duration_days <= 0) {
        return NextResponse.json(
          { error: "duration_days는 1 이상이어야 합니다." },
          { status: 400 }
        );
      }
      updateData.duration_days = duration_days;
    }
    if (is_active !== undefined) updateData.is_active = is_active;
    if (max_uses !== undefined) updateData.max_uses = max_uses || null;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("쿠폰 수정 실패:", error);
      return NextResponse.json(
        { error: "쿠폰을 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "쿠폰이 성공적으로 수정되었습니다.",
      coupon: updated as Coupon,
    });
  } catch (error) {
    console.error("쿠폰 수정 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `쿠폰 수정 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons
 * 쿠폰 삭제 (관리자 전용)
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "쿠폰 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 쿠폰 삭제
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      console.error("쿠폰 삭제 실패:", error);
      return NextResponse.json(
        { error: "쿠폰을 삭제하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "쿠폰이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("쿠폰 삭제 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `쿠폰 삭제 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
