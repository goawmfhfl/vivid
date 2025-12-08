"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import type { AIUsageDetail } from "@/types/admin";
import { ArrowLeft } from "lucide-react";

interface UserAIUsageDetailProps {
  userId: string;
}

interface AIUsageDetailResponse {
  details: AIUsageDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function UserAIUsageDetail({ userId }: UserAIUsageDetailProps) {
  const router = useRouter();
  const [details, setDetails] = useState<AIUsageDetail[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await adminApiFetch(
          `/api/admin/ai-usage/${userId}?page=${pagination.page}&limit=${pagination.limit}`
        );
        if (!response.ok) {
          throw new Error("AI 사용량 상세를 불러오는데 실패했습니다.");
        }
        const data: AIUsageDetailResponse = await response.json();
        setDetails(data.details);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [userId, pagination.page, pagination.limit]);

  if (isLoading && details.length === 0) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/ai-usage")}
          className="p-2 rounded-lg hover:bg-opacity-50"
          style={{ backgroundColor: COLORS.background.hover }}
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: COLORS.text.primary }}
          />
        </button>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            AI 사용량 상세 내역
          </h1>
          <p style={{ color: COLORS.text.tertiary }}>
            유저별 AI 요청 상세 내역을 확인하세요.
          </p>
        </div>
      </div>

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
                    날짜/시간
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    모델
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    타입
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    섹션
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    토큰
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    비용
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    소요 시간
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => (
                  <tr
                    key={detail.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-xs"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {new Date(detail.created_at).toLocaleString("ko-KR")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.primary }}>
                        {detail.model}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.secondary }}>
                        {detail.request_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.secondary }}>
                        {detail.section_name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div style={{ color: COLORS.text.primary }}>
                          {detail.total_tokens.toLocaleString()}
                        </div>
                        {detail.cached_tokens > 0 && (
                          <div style={{ color: COLORS.text.muted }}>
                            (캐시: {detail.cached_tokens.toLocaleString()})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: COLORS.text.primary }}
                        >
                          ₩{Math.round(detail.cost_krw).toLocaleString()}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: COLORS.text.tertiary }}
                        >
                          ${detail.cost_usd.toFixed(4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.secondary }}>
                        {detail.duration_ms
                          ? detail.duration_ms < 1000
                            ? `${Math.round(detail.duration_ms)}밀리초`
                            : `${Math.round(detail.duration_ms / 1000)}초`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: detail.success
                            ? COLORS.status.success + "20"
                            : COLORS.status.error + "20",
                          color: detail.success
                            ? COLORS.status.success
                            : COLORS.status.error,
                        }}
                      >
                        {detail.success ? "성공" : "실패"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일/태블릿 카드 뷰 */}
          <div className="lg:hidden space-y-3 p-4">
            {details.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.text.secondary }}>
                  사용 내역이 없습니다.
                </p>
              </div>
            ) : (
              details.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {new Date(detail.created_at).toLocaleString("ko-KR")}
                      </p>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: COLORS.text.primary }}
                      >
                        {detail.model}
                      </h3>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: detail.success
                          ? COLORS.status.success + "20"
                          : COLORS.status.error + "20",
                        color: detail.success
                          ? COLORS.status.success
                          : COLORS.status.error,
                      }}
                    >
                      {detail.success ? "성공" : "실패"}
                    </span>
                  </div>

                  <div
                    className="space-y-2 mb-3 pb-3 border-b"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>타입</span>
                      <span style={{ color: COLORS.text.primary }}>
                        {detail.request_type}
                      </span>
                    </div>
                    {detail.section_name && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: COLORS.text.secondary }}>
                          섹션
                        </span>
                        <span style={{ color: COLORS.text.primary }}>
                          {detail.section_name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        소요 시간
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {detail.duration_ms
                          ? detail.duration_ms < 1000
                            ? `${Math.round(detail.duration_ms)}밀리초`
                            : `${Math.round(detail.duration_ms / 1000)}초`
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        토큰
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {detail.total_tokens.toLocaleString()}
                      </p>
                      {detail.cached_tokens > 0 && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: COLORS.text.muted }}
                        >
                          캐시: {detail.cached_tokens.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        비용
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        ₩{Math.round(detail.cost_krw).toLocaleString()}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        ${detail.cost_usd.toFixed(4)}
                      </p>
                    </div>
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
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      page: Math.max(1, p.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
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
                    setPagination((p) => ({
                      ...p,
                      page: Math.min(pagination.totalPages, p.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
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
