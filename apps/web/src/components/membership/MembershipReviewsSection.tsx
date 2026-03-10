"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type MembershipReview = {
  id: string;
  pageType: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type MembershipReviewsResponse = {
  stats: {
    total: number;
    averageRating: number;
    byRating: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  pickedReviews: MembershipReview[];
};

const PAGE_TYPE_LABELS: Record<string, string> = {
  daily: "Daily Vivid",
  weekly: "Weekly Vivid",
  monthly: "Monthly Vivid",
};

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-current" : ""}`}
          style={{
            color:
              star <= rating ? COLORS.secondary[500] : COLORS.border.light,
          }}
        />
      ))}
    </div>
  );
}

const CARD_STYLE = {
  backgroundColor: COLORS.background.base,
  border: `1px solid ${COLORS.border.light}`,
  borderRadius: "12px",
} as const;

export function MembershipReviewsSection() {
  const [data, setData] = useState<MembershipReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (accessToken?: string | null) => {
      setIsLoading(true);
      setError(null);
      setRequiresAuth(false);

      if (!accessToken) {
        if (!cancelled) {
          setData(null);
          setRequiresAuth(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/membership/reviews", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          if (!cancelled) {
            setData(null);
            setRequiresAuth(true);
          }
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "리뷰 데이터를 불러오지 못했습니다.");
        }

        const json = (await response.json()) as MembershipReviewsResponse;
        if (!cancelled) {
          setData(json);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "리뷰 데이터를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void load(session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        void load(session?.access_token ?? null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const ratingRows = useMemo(() => {
    if (!data) return [];
    const total = Object.values(data.stats.byRating).reduce(
      (sum, count) => sum + count,
      0
    );

    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: data.stats.byRating[rating as keyof typeof data.stats.byRating],
      width:
        total > 0
          ? (data.stats.byRating[rating as keyof typeof data.stats.byRating] /
              total) *
            100
          : 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-8 text-center rounded-xl p-4" style={CARD_STYLE}>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{
            borderColor: COLORS.brand.primary,
            borderTopColor: "transparent",
          }}
        />
        <p style={{ color: COLORS.text.secondary }}>리뷰를 불러오는 중...</p>
      </div>
    );
  }

  if (requiresAuth) {
    return (
      <div className="py-8 text-center rounded-xl p-4" style={CARD_STYLE}>
        <p style={{ color: COLORS.text.secondary }}>
          로그인한 유저에게만 실제 리뷰와 만족도 데이터가 보여져요.
        </p>
        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-2")}
          style={{ color: COLORS.text.tertiary }}
        >
          로그인 후 다시 열면 관리자에게 선택된 리뷰와 평점 분포를 확인할 수 있어요.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center rounded-xl p-4" style={CARD_STYLE}>
        <p style={{ color: COLORS.text.secondary }}>
          리뷰 데이터를 잠시 불러오지 못하고 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <span
              className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.fontWeight)}
              style={{ color: COLORS.text.secondary }}
            >
              총 피드백
            </span>
          </div>
          <p
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            {data.stats.total.toLocaleString("ko-KR")}개
          </p>
        </div>

        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" style={{ color: COLORS.secondary[500] }} />
            <span
              className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.fontWeight)}
              style={{ color: COLORS.text.secondary }}
            >
              평균 평점
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              {data.stats.averageRating.toFixed(2)}
            </p>
            <span style={{ color: COLORS.text.tertiary }}>/ 5.00</span>
          </div>
        </div>

        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <span
            className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.fontWeight)}
            style={{ color: COLORS.text.secondary }}
          >
            평점 분포
          </span>
          <div className="mt-3 space-y-2.5">
            {ratingRows.map((row) => (
              <div key={row.rating} className="flex items-center gap-2">
                <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
                  {row.rating}점
                </span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.width}%`,
                      backgroundColor: COLORS.brand.primary,
                    }}
                  />
                </div>
                <span
                  className="text-sm"
                  style={{ color: COLORS.text.primary, minWidth: "24px" }}
                >
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.pickedReviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {data.pickedReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl p-4 h-full"
              style={CARD_STYLE}
            >
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: COLORS.primary[100],
                      color: COLORS.brand.primary,
                    }}
                  >
                    {PAGE_TYPE_LABELS[review.pageType] ?? review.pageType}
                  </span>
                  {renderStars(review.rating)}
                </div>

                <p
                  className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight, "flex-1")}
                  style={{ color: COLORS.text.primary }}
                >
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center rounded-xl p-4" style={CARD_STYLE}>
          <p style={{ color: COLORS.text.secondary }}>
            아직 멤버십 페이지에 노출 중인 리뷰가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
