"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES, TYPOGRAPHY } from "@/lib/design-system";
import { Search, Calendar, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountDeletion {
  id: string;
  anonymized_user_id: string;
  reasons: string[];
  additional_comment: string | null;
  deleted_at: string;
  created_at: string;
}

interface AccountDeletionsResponse {
  deletions: AccountDeletion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AccountDeletionsPage() {
  const [deletions, setDeletions] = useState<AccountDeletion[]>([]);
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
  const [reasonFilter, setReasonFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchComment, setSearchComment] = useState<string>("");

  useEffect(() => {
    const fetchDeletions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (reasonFilter) params.append("reason", reasonFilter);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await adminApiFetch(
          `/api/admin/account-deletions?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("탈퇴 사유 목록을 불러오는데 실패했습니다.");
        }
        const data: AccountDeletionsResponse = await response.json();
        setDeletions(data.deletions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletions();
  }, [page, reasonFilter, startDate, endDate]);

  // 댓글 검색 필터링 (클라이언트 사이드)
  const filteredDeletions = searchComment
    ? deletions.filter((d) =>
        d.additional_comment
          ?.toLowerCase()
          .includes(searchComment.toLowerCase())
      )
    : deletions;

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

  const clearFilters = () => {
    setReasonFilter("");
    setStartDate("");
    setEndDate("");
    setSearchComment("");
    setPage(1);
  };

  if (isLoading && deletions.length === 0) {
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
      {/* 헤더 */}
      <div className="space-y-2">
        <h1
          className={cn(TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          회원 탈퇴 사유 관리
        </h1>
        <p className={TYPOGRAPHY.body.fontSize} style={{ color: COLORS.text.secondary }}>
          회원 탈퇴 시 수집된 사유를 확인할 수 있습니다.
        </p>
      </div>

      {/* 필터 섹션 */}
      <div
        className="p-4 sm:p-6 rounded-xl"
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.card,
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 탈퇴 사유 필터 */}
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.primary }}
            >
              탈퇴 사유
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-md border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            >
              <option value="">전체</option>
              <option value="사용 빈도가 낮아서">사용 빈도가 낮아서</option>
              <option value="기대했던 기능/효과와 달라서">기대했던 기능/효과와 달라서</option>
              <option value="사용 방법이 어렵거나 복잡해서">사용 방법이 어렵거나 복잡해서</option>
              <option value="콘텐츠/기능이 부족해서">콘텐츠/기능이 부족해서</option>
              <option value="가격이 부담돼서">가격이 부담돼서</option>
              <option value="다른 서비스를 이용하게 돼서">다른 서비스를 이용하게 돼서</option>
              <option value="기술적 오류가 잦아서">기술적 오류가 잦아서</option>
              <option value="개인적인 사정으로 잠시 중단">개인적인 사정으로 잠시 중단</option>
              <option value="개인정보/보안이 걱정돼서">개인정보/보안이 걱정돼서</option>
            </select>
          </div>

          {/* 날짜 필터 */}
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.primary }}
            >
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-md border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            />
          </div>

          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.primary }}
            >
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-md border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            />
          </div>

          {/* 필터 초기화 버튼 */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: COLORS.background.hover,
                color: COLORS.text.secondary,
                border: `1px solid ${COLORS.border.light}`,
              }}
            >
              <X className="w-4 h-4 inline mr-1" />
              초기화
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="mt-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: COLORS.text.tertiary }}
            />
            <input
              type="text"
              placeholder="추가 의견 검색..."
              value={searchComment}
              onChange={(e) => setSearchComment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl"
          style={{
            ...CARD_STYLES.default,
            backgroundColor: COLORS.background.card,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            총 탈퇴 건수
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: COLORS.text.primary }}>
            {pagination.total.toLocaleString()}
          </p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            ...CARD_STYLES.default,
            backgroundColor: COLORS.background.card,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            이번 달 탈퇴
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: COLORS.text.primary }}>
            {deletions.filter((d) => {
              const deletedDate = new Date(d.deleted_at);
              const now = new Date();
              return (
                deletedDate.getMonth() === now.getMonth() &&
                deletedDate.getFullYear() === now.getFullYear()
              );
            }).length}
          </p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            ...CARD_STYLES.default,
            backgroundColor: COLORS.background.card,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            사유 제공률
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: COLORS.text.primary }}>
            {pagination.total > 0
              ? Math.round(
                  (deletions.filter((d) => d.reasons.length > 0 || d.additional_comment).length /
                    deletions.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* 탈퇴 사유 목록 */}
      <div
        className="p-4 sm:p-6 rounded-xl"
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.card,
        }}
      >
        <h2
          className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight, "mb-4")}
          style={{ color: COLORS.text.primary }}
        >
          탈퇴 사유 목록
        </h2>

        {filteredDeletions.length === 0 ? (
          <p className="text-center py-8" style={{ color: COLORS.text.tertiary }}>
            탈퇴 사유가 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredDeletions.map((deletion) => (
              <div
                key={deletion.id}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: COLORS.border.light,
                  backgroundColor: COLORS.background.base,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      탈퇴일: {formatDate(deletion.deleted_at)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                      ID: {deletion.anonymized_user_id.substring(0, 16)}...
                    </p>
                  </div>
                </div>

                {deletion.reasons.length > 0 && (
                  <div className="mb-3">
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      선택한 사유:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {deletion.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: COLORS.brand.light + "30",
                            color: COLORS.brand.primary,
                          }}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {deletion.additional_comment && (
                  <div>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      추가 의견:
                    </p>
                    <p
                      className="text-sm p-3 rounded-md"
                      style={{
                        backgroundColor: COLORS.background.hoverLight,
                        color: COLORS.text.secondary,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {deletion.additional_comment}
                    </p>
                  </div>
                )}

                {deletion.reasons.length === 0 && !deletion.additional_comment && (
                  <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                    사유가 제공되지 않았습니다.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: page === 1 ? COLORS.background.hover : COLORS.brand.primary,
                color: page === 1 ? COLORS.text.tertiary : COLORS.text.white,
              }}
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm" style={{ color: COLORS.text.secondary }}>
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  page === pagination.totalPages ? COLORS.background.hover : COLORS.brand.primary,
                color:
                  page === pagination.totalPages ? COLORS.text.tertiary : COLORS.text.white,
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
