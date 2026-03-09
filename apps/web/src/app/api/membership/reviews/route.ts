import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";

type ReviewRow = {
  id: string;
  page_type: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  picked_for_membership: boolean | null;
};

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedUserIdFromRequest(request);

    const supabase = getServiceSupabase();

    const { data: statsRows, error: statsError } = await supabase
      .from("user_feedbacks")
      .select("page_type, rating")
      .in("page_type", ["daily", "weekly", "monthly"])
      .not("rating", "is", null);

    if (statsError) {
      throw new Error(`Failed to load feedback stats: ${statsError.message}`);
    }

    const { data: pickedRows, error: pickedError } = await supabase
      .from("user_feedbacks")
      .select("id, page_type, rating, comment, created_at, picked_for_membership")
      .eq("picked_for_membership", true)
      .in("page_type", ["daily", "weekly", "monthly"])
      .not("rating", "is", null)
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .limit(3);

    if (pickedError) {
      throw new Error(`Failed to load picked reviews: ${pickedError.message}`);
    }

    const rows = (statsRows ?? []) as Array<{ page_type: string; rating: number | null }>;
    const ratingCount = rows.length;
    const ratingSum = rows.reduce((sum, row) => sum + (row.rating ?? 0), 0);

    return NextResponse.json({
      stats: {
        total: ratingCount,
        averageRating:
          ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
        byRating: {
          1: rows.filter((row) => row.rating === 1).length,
          2: rows.filter((row) => row.rating === 2).length,
          3: rows.filter((row) => row.rating === 3).length,
          4: rows.filter((row) => row.rating === 4).length,
          5: rows.filter((row) => row.rating === 5).length,
        },
      },
      pickedReviews: ((pickedRows ?? []) as ReviewRow[]).map((row) => ({
        id: row.id,
        pageType: row.page_type,
        rating: row.rating ?? 0,
        comment: row.comment,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load membership reviews";
    const status = /Unauthorized/i.test(message) ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
