"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDate, formatKSTTime } from "@/lib/date-utils";
import type { AIUsageDetail } from "@/types/admin";
import { ArrowLeft, RefreshCw } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

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
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  stats: {
    today: {
      requests: number;
      cost_krw: number;
    };
    thisWeek: {
      requests: number;
      cost_krw: number;
    };
    thisMonth: {
      requests: number;
      cost_krw: number;
    };
    byType: {
      daily: {
        requests: number;
        cost_krw: number;
      };
      weekly: {
        requests: number;
        cost_krw: number;
      };
      monthly: {
        requests: number;
        cost_krw: number;
      };
    };
  };
}

const COLORS_CHART = [
  COLORS.brand.primary,
  COLORS.brand.secondary,
  COLORS.brand.light,
  COLORS.section.emotion.primary,
  COLORS.section.insight.primary,
];

export function UserAIUsageDetail({ userId }: UserAIUsageDetailProps) {
  const router = useRouter();
  const [details, setDetails] = useState<AIUsageDetail[]>([]);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [stats, setStats] = useState<AIUsageDetailResponse["stats"] | null>(
    null
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    model: "",
    requestType: "",
    sectionName: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchDetails = useCallback(async (showLoading = true, refreshTableOnly = false) => {
    if (showLoading && !refreshTableOnly) {
      setIsLoading(true);
    } else if (refreshTableOnly) {
      setIsRefreshing(true);
    }
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (filters.model) params.append("model", filters.model);
      if (filters.requestType)
        params.append("requestType", filters.requestType);
      if (filters.sectionName)
        params.append("sectionName", filters.sectionName);
      if (filters.search) params.append("search", filters.search);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await adminApiFetch(
        `/api/admin/ai-usage/${userId}?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("AI 사용량 상세를 불러오는데 실패했습니다.");
      }
      const data: AIUsageDetailResponse = await response.json();
      
      // 테이블만 새로고침하는 경우 details와 pagination만 업데이트
      if (refreshTableOnly) {
        setDetails(data.details);
        setPagination(data.pagination);
      } else {
        // 전체 데이터 업데이트
        setDetails(data.details);
        setPagination(data.pagination);
        setUser(data.user);
        setStats(data.stats);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, pagination.page, pagination.limit, userId]);

  useEffect(() => {
    fetchDetails(true);
  }, [fetchDetails]);

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
    <div className="space-y-8">
      {/* 헤더 섹션 */}
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
        <div className="flex-1">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            {user?.name || "사용자"}의 AI 사용량
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            {user?.email || ""}
          </p>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p style={{ color: COLORS.status.error }}>{error}</p>
        </div>
      ) : (
        <>
          {/* 통계 카드 */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  ...CARD_STYLES.default,
                }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘 사용량
                </p>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: COLORS.text.primary }}
                >
                  {stats.today.requests.toLocaleString()}회
                </p>
                <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                  ₩{Math.round(stats.today.cost_krw).toLocaleString()}
                </p>
              </div>
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  ...CARD_STYLES.default,
                }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  이번 주 사용량
                </p>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: COLORS.text.primary }}
                >
                  {stats.thisWeek.requests.toLocaleString()}회
                </p>
                <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                  ₩{Math.round(stats.thisWeek.cost_krw).toLocaleString()}
                </p>
              </div>
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  ...CARD_STYLES.default,
                }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  이번 달 사용량
                </p>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: COLORS.text.primary }}
                >
                  {stats.thisMonth.requests.toLocaleString()}회
                </p>
                <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                  ₩{Math.round(stats.thisMonth.cost_krw).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* 일간/주간/월간 사용량 시각화 */}
          {stats && (
            <div
              className="rounded-xl p-6"
              style={{
                ...CARD_STYLES.default,
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                기간별 사용량 추이
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      period: "오늘",
                      requests: stats.today.requests,
                      cost_krw: stats.today.cost_krw,
                    },
                    {
                      period: "이번 주",
                      requests: stats.thisWeek.requests,
                      cost_krw: stats.thisWeek.cost_krw,
                    },
                    {
                      period: "이번 달",
                      requests: stats.thisMonth.requests,
                      cost_krw: stats.thisMonth.cost_krw,
                    },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.border.light}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                    tickFormatter={(value) =>
                      `₩${Math.round(value).toLocaleString()}`
                    }
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="requests"
                    fill={COLORS.brand.primary}
                    name="요청 수"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="cost_krw"
                    fill={COLORS.brand.secondary}
                    name="비용 (₩)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 타입별 사용 비중 */}
          {stats && (
            <div
              className="rounded-xl p-6"
              style={{
                ...CARD_STYLES.default,
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                타입별 사용 비중
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Daily",
                            value: stats.byType.daily.cost_krw,
                            requests: stats.byType.daily.requests,
                          },
                          {
                            name: "Weekly",
                            value: stats.byType.weekly.cost_krw,
                            requests: stats.byType.weekly.requests,
                          },
                          {
                            name: "Monthly",
                            value: stats.byType.monthly.cost_krw,
                            requests: stats.byType.monthly.requests,
                          },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={false}
                      >
                        {[
                          stats.byType.daily,
                          stats.byType.weekly,
                          stats.byType.monthly,
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS_CHART[index % COLORS_CHART.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS_CHART[0],
                        }}
                      />
                      <span style={{ color: COLORS.text.primary }}>
                        Daily Vivid
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        ₩
                        {Math.round(
                          stats.byType.daily.cost_krw
                        ).toLocaleString()}
                      </span>
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {stats.byType.daily.requests}회
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS_CHART[1],
                        }}
                      />
                      <span style={{ color: COLORS.text.primary }}>
                        Weekly Feedback
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        ₩
                        {Math.round(
                          stats.byType.weekly.cost_krw
                        ).toLocaleString()}
                      </span>
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {stats.byType.weekly.requests}회
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS_CHART[2],
                        }}
                      />
                      <span style={{ color: COLORS.text.primary }}>
                        Monthly Vivid
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        ₩
                        {Math.round(
                          stats.byType.monthly.cost_krw
                        ).toLocaleString()}
                      </span>
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        {stats.byType.monthly.requests}회
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 전체 사용량 목록 */}
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: COLORS.text.primary }}
              >
                사용량 상세 내역
              </h2>
              <button
                onClick={() => fetchDetails(false, true)}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: COLORS.background.hover }}
                title="새로고침"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                  style={{ color: COLORS.text.primary }}
                />
              </button>
            </div>

            {/* 필터 및 검색 영역 */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    검색
                  </label>
                  <input
                    type="text"
                    placeholder="모델명, 타입, 섹션명..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    모델
                  </label>
                  <select
                    value={filters.model}
                    onChange={(e) =>
                      setFilters({ ...filters, model: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  >
                    <option value="">전체</option>
                    <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    요청 타입
                  </label>
                  <select
                    value={filters.requestType}
                    onChange={(e) =>
                      setFilters({ ...filters, requestType: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  >
                    <option value="">전체</option>
                    <option value="daily_vivid">Daily Vivid</option>
                    <option value="weekly_vivid">Weekly Vivid</option>
                    <option value="monthly_vivid">Monthly Vivid</option>
                  </select>
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    섹션명
                  </label>
                  <input
                    type="text"
                    placeholder="섹션명 검색..."
                    value={filters.sectionName}
                    onChange={(e) =>
                      setFilters({ ...filters, sectionName: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    페이지당 개수
                  </label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination({
                        ...pagination,
                        limit: parseInt(e.target.value, 10),
                        page: 1,
                      });
                    }}
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  >
                    <option value="10">10개</option>
                    <option value="20">20개</option>
                    <option value="50">50개</option>
                    <option value="100">100개</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    시작일
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    종료일
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: COLORS.border.input,
                      backgroundColor: COLORS.background.card,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 테이블 */}
            {details.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: COLORS.text.muted }}>
                  사용량 내역이 없습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
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
                          className="px-4 py-3 text-right text-sm font-semibold"
                          style={{ color: COLORS.text.primary }}
                        >
                          토큰
                        </th>
                        <th
                          className="px-4 py-3 text-right text-sm font-semibold"
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
                          className="px-4 py-3 text-center text-sm font-semibold"
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
                          className="hover:bg-opacity-50 transition-colors"
                          style={{
                            borderBottom: `1px solid ${COLORS.border.light}`,
                          }}
                        >
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text.primary }}
                            >
                              {formatKSTDate(detail.created_at)}
                            </span>
                            <br />
                            <span
                              className="text-xs"
                              style={{ color: COLORS.text.tertiary }}
                            >
                              {formatKSTTime(detail.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text.primary }}
                            >
                              {detail.model}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {detail.request_type === "daily_vivid"
                                ? "Daily"
                                : detail.request_type === "weekly_vivid"
                                ? "Weekly"
                                : "Monthly"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {detail.section_name || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div>
                              <span
                                className="text-sm"
                                style={{ color: COLORS.text.primary }}
                              >
                                {detail.total_tokens.toLocaleString()}
                              </span>
                              {detail.cached_tokens > 0 && (
                                <span
                                  className="text-xs ml-1"
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  (캐시: {detail.cached_tokens.toLocaleString()}
                                  )
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div>
                              <span
                                className="text-sm font-semibold"
                                style={{ color: COLORS.text.primary }}
                              >
                                ₩{Math.round(detail.cost_krw).toLocaleString()}
                              </span>
                              <span
                                className="text-xs ml-2"
                                style={{ color: COLORS.text.tertiary }}
                              >
                                ${detail.cost_usd.toFixed(4)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {detail.duration_ms
                                ? detail.duration_ms < 1000
                                  ? `${Math.round(detail.duration_ms)}ms`
                                  : `${Math.round(detail.duration_ms / 1000)}초`
                                : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
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

                {/* 페이지네이션 */}
                {pagination.totalPages > 1 && (
                  <div
                    className="flex items-center justify-between pt-4 border-t mt-4"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        페이지 {pagination.page} / {pagination.totalPages} (
                        {pagination.total}개)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPagination({
                            ...pagination,
                            page: Math.max(1, pagination.page - 1),
                          })
                        }
                        disabled={pagination.page === 1}
                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            pagination.page === 1
                              ? COLORS.background.hover
                              : COLORS.brand.light,
                          color:
                            pagination.page === 1
                              ? COLORS.text.muted
                              : COLORS.brand.primary,
                        }}
                      >
                        이전
                      </button>
                      <button
                        onClick={() =>
                          setPagination({
                            ...pagination,
                            page: Math.min(
                              pagination.totalPages,
                              pagination.page + 1
                            ),
                          })
                        }
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            pagination.page === pagination.totalPages
                              ? COLORS.background.hover
                              : COLORS.brand.light,
                          color:
                            pagination.page === pagination.totalPages
                              ? COLORS.text.muted
                              : COLORS.brand.primary,
                        }}
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
