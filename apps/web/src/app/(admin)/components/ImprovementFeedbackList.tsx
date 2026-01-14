"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDate, formatKSTTime } from "@/lib/date-utils";
import { Trash2 } from "lucide-react";
interface ImprovementFeedbackWithUser {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

interface ImprovementFeedbackListResponse {
  feedbacks: ImprovementFeedbackWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ImprovementFeedbackList() {
  const [feedbacks, setFeedbacks] = useState<ImprovementFeedbackWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        const response = await adminApiFetch(
          `/api/admin/improvement-feedback?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("피드백 목록을 불러오는데 실패했습니다.");
        }
        const data: ImprovementFeedbackListResponse = await response.json();
        setFeedbacks(data.feedbacks);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, [page]);

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("정말 이 피드백을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await adminApiFetch(
        `/api/admin/improvement-feedback?id=${feedbackId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("피드백을 삭제하는데 실패했습니다.");
      }

      // 목록 새로고침
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      const refreshResponse = await adminApiFetch(
        `/api/admin/improvement-feedback?${params.toString()}`
      );
      if (refreshResponse.ok) {
        const data: ImprovementFeedbackListResponse =
          await refreshResponse.json();
        setFeedbacks(data.feedbacks);
        setPagination(data.pagination);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
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

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          개선점 피드백 관리
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          사용자들이 제출한 개선점 피드백을 확인하고 관리하세요.
        </p>
      </div>

      {/* 피드백 목록 */}
      {error ? (
        <div className="text-center py-8">
          <p style={{ color: COLORS.status.error }}>{error}</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: COLORS.background.hover,
                    borderBottom: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    사용자
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    내용
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    작성일
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <p className="mb-2">피드백 데이터가 없습니다.</p>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        아직 제출된 피드백이 없습니다.
                      </p>
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div style={{ color: COLORS.text.primary }}>
                            {feedback.user?.name || "알 수 없음"}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: COLORS.text.muted }}
                          >
                            {feedback.user?.email || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          {feedback.content}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {formatKSTDate(feedback.created_at)}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.tertiary }}
                          >
                            {formatKSTTime(feedback.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="p-1 rounded hover:bg-opacity-50"
                          style={{ backgroundColor: COLORS.background.hover }}
                        >
                          <Trash2
                            className="w-4 h-4"
                            style={{ color: COLORS.status.error }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일/태블릿 카드 뷰 */}
          <div className="lg:hidden space-y-3 p-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.text.secondary }} className="mb-2">
                  피드백 데이터가 없습니다.
                </p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  아직 제출된 피드백이 없습니다.
                </p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="mb-3">
                    <h3
                      className="font-semibold text-base mb-1"
                      style={{ color: COLORS.text.primary }}
                    >
                      {feedback.user?.name || "알 수 없음"}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {feedback.user?.email || "-"}
                    </p>
                  </div>

                  <div
                    className="mb-3 pb-3 border-b"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: COLORS.text.primary }}
                    >
                      {feedback.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      {formatKSTDate(feedback.created_at)} {formatKSTTime(feedback.created_at)}
                    </div>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="p-2 rounded border"
                      style={{
                        borderColor: COLORS.status.error,
                        color: COLORS.status.error,
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div
              className="px-4 py-3 flex items-center justify-between border-t"
              style={{ borderColor: COLORS.border.light }}
            >
              <div style={{ color: COLORS.text.secondary }}>
                총 {pagination.total.toLocaleString()}건 중{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                건 표시
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  이전
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
