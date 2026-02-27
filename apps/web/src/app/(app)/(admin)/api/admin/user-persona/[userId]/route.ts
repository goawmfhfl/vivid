import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields } from "@/lib/jsonb-encryption";
import type { JsonbValue } from "@/lib/jsonb-encryption";

/**
 * GET /api/admin/user-persona/[userId]
 * 특정 유저의 user_persona 조회 (admin 전용, 복호화 포함)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { userId } = await params;
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("user_persona")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ persona: null, message: "User persona not found" });
      }
      throw error;
    }

    // Decrypt persona field
    const decryptedPersona = data.persona
      ? decryptJsonbFields(data.persona as JsonbValue)
      : null;

    return NextResponse.json({
      ...data,
      persona: decryptedPersona,
    });
  } catch (error) {
    console.error("User persona fetch error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch user persona", details: message },
      { status: 500 }
    );
  }
}
