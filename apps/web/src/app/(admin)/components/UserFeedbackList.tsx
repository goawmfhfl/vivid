"use client";

import { useState, useEffect, useCallback } from "react";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { Trash2, Star, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApiFetch } from "@/lib/admin-api-client";

interface UserFeedback {
  id: string;
  pageType: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface FeedbackStats {
  total: number;
  averageRating: string;
  byPageType: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  byRating: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface FeedbackListResponse {
  feedbacks: UserFeedback[];
  stats: FeedbackStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  daily: "Daily Vivid",
  weekly: "Weekly Vivid",
  monthly: "Monthly Vivid",
};

export function UserFeedbackList() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPageType, setSelectedPageType] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });
      if (selectedPageType !== "all") {
        params.append("pageType", selectedPageType);
      }
      if (selectedRating !== "all") {
        params.append("rating", selectedRating);
      }

      const response = await adminApiFetch(`/api/admin/user-feedbacks?${params}`);
      if (!response.ok) {
        throw new Error("피드백 목록을 불러오는데 실패했습니다.");
      }

      const data: FeedbackListResponse = await response.json();
      setFeedbacks(data.feedbacks);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [page, selectedPageType, selectedRating, sortBy, sortOrder]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 피드백을 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await adminApiFetch(`/api/admin/user-feedbacks?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      await fetchFeedbacks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-current" : ""}`}
            style={{
              color: star <= rating ? COLORS.status.warning : COLORS.border.light,
            }}
          />
        ))}
      </div>
    );
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.brand.primary }}
          ></div>
          <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>{error}</p>
        <Button
          onClick={fetchFeedbacks}
          className="mt-4"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          피드백 관리
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          유저들이 남긴 피드백을 확인하고 관리하세요.
        </p>
      </div>

      {/* 통계 요약 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-xl p-4"
            style={CARD_STYLES.default}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
              <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
                총 피드백
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              {stats.total}개
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={CARD_STYLES.default}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: COLORS.status.success }} />
              <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
                평균 평점
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats.averageRating}
              </p>
              <Star className="w-5 h-5 fill-current" style={{ color: COLORS.status.warning }} />
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={CARD_STYLES.default}
          >
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              페이지별 분포
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: COLORS.text.tertiary }}>Daily</span>
                <span style={{ color: COLORS.text.primary }}>{stats.byPageType.daily}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: COLORS.text.tertiary }}>Weekly</span>
                <span style={{ color: COLORS.text.primary }}>{stats.byPageType.weekly}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: COLORS.text.tertiary }}>Monthly</span>
                <span style={{ color: COLORS.text.primary }}>{stats.byPageType.monthly}</span>
              </div>
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={CARD_STYLES.default}
          >
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              평점 분포
            </span>
            <div className="mt-2 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span style={{ color: COLORS.text.tertiary }}>{rating}점</span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        width: `${stats.total > 0 ? (stats.byRating[rating as keyof typeof stats.byRating] / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span style={{ color: COLORS.text.primary, minWidth: "24px" }}>
                    {stats.byRating[rating as keyof typeof stats.byRating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div
        className="rounded-xl p-6"
        style={CARD_STYLES.default}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              페이지 타입
            </label>
            <select
              value={selectedPageType}
              onChange={(e) => {
                setSelectedPageType(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="all">전체</option>
              <option value="daily">Daily Vivid</option>
              <option value="weekly">Weekly Vivid</option>
              <option value="monthly">Monthly Vivid</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              평점
            </label>
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="all">전체</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r.toString()}>{r}점</option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              정렬 기준
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="created_at">작성일</option>
              <option value="rating">평점</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              정렬 순서
            </label>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 피드백 목록 */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.text.secondary }}>
              피드백이 없습니다.
            </p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-xl p-6"
              style={CARD_STYLES.default}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: COLORS.brand.light,
                        color: COLORS.brand.primary,
                      }}
                    >
                      {PAGE_TYPE_LABELS[feedback.pageType] || feedback.pageType}
                    </span>
                    {renderStars(feedback.rating)}
                    <span
                      className="text-sm"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      {new Date(feedback.createdAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  {feedback.comment ? (
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: COLORS.text.primary }}
                    >
                      {feedback.comment}
                    </p>
                  ) : (
                    <p
                      className="text-sm italic"
                      style={{ color: COLORS.text.muted }}
                    >
                      (코멘트 없음)
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(feedback.id)}
                  disabled={deletingId === feedback.id}
                  style={{ color: COLORS.status.error }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ color: COLORS.text.secondary }}
          >
            이전
          </Button>
          <span
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ color: COLORS.text.secondary }}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
