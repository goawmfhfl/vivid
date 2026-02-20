"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES, TYPOGRAPHY } from "@/lib/design-system";
import type {
  VividFeedback,
  FeedbackStats,
  FeedbackListResponse,
} from "@/types/vivid-feedback";
import { Search, Star, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSelect } from "./AdminSelect";

export function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState<VividFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // 필터 상태
  const [pageTypeFilter, setPageTypeFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchComment, setSearchComment] = useState<string>("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (pageTypeFilter) params.append("pageType", pageTypeFilter);
        if (ratingFilter) params.append("rating", ratingFilter);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await adminApiFetch(
          `/api/admin/feedback?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("피드백 목록을 불러오는데 실패했습니다.");
        }
        const data: FeedbackListResponse = await response.json();
        setFeedbacks(data.feedbacks);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, [page, pageTypeFilter, ratingFilter, startDate, endDate]);

  // 댓글 검색 필터링 (클라이언트 사이드)
  const filteredFeedbacks = searchComment
    ? feedbacks.filter((f) =>
        f.comment?.toLowerCase().includes(searchComment.toLowerCase())
      )
    : feedbacks;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPageTypeLabel = (feedback: VividFeedback) => {
    const labels: Record<string, string> = {
      daily: "데일리",
      weekly: "주간",
      monthly: "월간",
    };
    const base = labels[feedback.page_type] || feedback.page_type;
    if (feedback.page_type === "daily" && feedback.vivid_type) {
      const typeLabel = feedback.vivid_type === "vivid" ? "비전" : "회고";
      return `${base} (${typeLabel})`;
    }
    return base;
  };

  if (isLoading && feedbacks.length === 0) {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p style={{ color: COLORS.status.error }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          피드백 관리
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          사용자 피드백을 확인하고 분석하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: COLORS.background.card,
            }}
          >
            <div
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginBottom: "8px" }}
            >
              전체 피드백
            </div>
            <div
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              {stats.total.toLocaleString()}
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: COLORS.background.card,
            }}
          >
            <div
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginBottom: "8px" }}
            >
              평균 별점
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
                style={{ color: COLORS.brand.primary }}
              >
                {stats.averageRating.toFixed(1)}
              </div>
              <Star
                className="w-5 h-5"
                style={{ color: COLORS.brand.primary, fill: COLORS.brand.primary }}
              />
            </div>
            <div
              className={cn(TYPOGRAPHY.caption.fontSize, "mt-1")}
              style={{ color: COLORS.text.tertiary }}
            >
              {stats.total}개 중
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: COLORS.background.card,
            }}
          >
            <div
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginBottom: "8px" }}
            >
              5점
            </div>
            <div
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.brand.primary }}
            >
              {stats.byRating[5].toLocaleString()}
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: COLORS.background.card,
            }}
          >
            <div
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginBottom: "8px" }}
            >
              4점
            </div>
            <div
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.brand.primary }}
            >
              {stats.byRating[4].toLocaleString()}
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: COLORS.background.card,
            }}
          >
            <div
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginBottom: "8px" }}
            >
              1-3점
            </div>
            <div
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.secondary }}
            >
              {(stats.byRating[1] + stats.byRating[2] + stats.byRating[3]).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* 필터 섹션 */}
      <div
        className="rounded-xl p-6"
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.card,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: COLORS.text.secondary }} />
            <h3
              className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              필터
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminSelect
              label="페이지 타입"
              value={pageTypeFilter}
              onChange={(e) => {
                setPageTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "전체" },
                { value: "daily", label: "데일리" },
                { value: "weekly", label: "주간" },
                { value: "monthly", label: "월간" },
              ]}
            />
            <AdminSelect
              label="별점"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "전체" },
                { value: "5", label: "5점" },
                { value: "4", label: "4점" },
                { value: "3", label: "3점" },
                { value: "2", label: "2점" },
                { value: "1", label: "1점" },
              ]}
            />

            {/* 시작 날짜 */}
            <div>
              <label
                className={cn(TYPOGRAPHY.caption.fontSize, "block mb-2")}
                style={{ color: COLORS.text.secondary }}
              >
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              />
            </div>

            {/* 종료 날짜 */}
            <div>
              <label
                className={cn(TYPOGRAPHY.caption.fontSize, "block mb-2")}
                style={{ color: COLORS.text.secondary }}
              >
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              />
            </div>
          </div>

          {/* 댓글 검색 */}
          <div>
            <label
              className={cn(TYPOGRAPHY.caption.fontSize, "block mb-2")}
              style={{ color: COLORS.text.secondary }}
            >
              댓글 검색
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: COLORS.text.tertiary }}
              />
              <input
                type="text"
                value={searchComment}
                onChange={(e) => setSearchComment(e.target.value)}
                placeholder="댓글 내용으로 검색..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 피드백 목록 */}
      <div
        className="rounded-xl p-6"
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.card,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              피드백 목록 ({filteredFeedbacks.length}개)
            </h3>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: COLORS.text.tertiary }}>
                피드백이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((feedback) => {
                const rating = feedback.rating ?? 0;

                return (
                  <div
                    key={feedback.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: COLORS.background.cardElevated,
                      borderColor: COLORS.border.light,
                    }}
                  >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-semibold"
                          )}
                          style={{
                            backgroundColor: `${COLORS.brand.primary}20`,
                            color: COLORS.brand.primary,
                          }}
                        >
                          {getPageTypeLabel(feedback)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: COLORS.brand.primary }}
                          >
                            {rating}점
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <Star
                                key={starValue}
                                className="w-3 h-3"
                                style={{
                                  fill:
                                    starValue <= rating
                                      ? COLORS.brand.primary
                                      : "transparent",
                                  color:
                                    starValue <= rating
                                      ? COLORS.brand.primary
                                      : COLORS.border.light,
                                  strokeWidth: starValue <= rating ? 0 : 1,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {feedback.comment && (
                        <p
                          className={cn(TYPOGRAPHY.body.fontSize)}
                          style={{ color: COLORS.text.secondary }}
                        >
                          {feedback.comment}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <span style={{ color: COLORS.text.tertiary }}>
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border disabled:opacity-50"
                style={{
                  backgroundColor:
                    page === 1
                      ? COLORS.background.hoverLight
                      : COLORS.background.cardElevated,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              >
                이전
              </button>
              <span
                className="px-4 py-2"
                style={{ color: COLORS.text.secondary }}
              >
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-lg border disabled:opacity-50"
                style={{
                  backgroundColor:
                    page === pagination.totalPages
                      ? COLORS.background.hoverLight
                      : COLORS.background.cardElevated,
                  borderColor: COLORS.border.light,
                  color: COLORS.text.primary,
                }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
