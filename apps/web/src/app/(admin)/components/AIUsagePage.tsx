"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { StatsCard } from "./StatsCard";
import type { AIUsageStats, AIUsageDetail } from "@/types/admin";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS_CHART = [
  COLORS.brand.primary,
  COLORS.brand.secondary,
  COLORS.brand.light,
  COLORS.section.emotion.primary,
  COLORS.section.insight.primary,
];

interface ExtendedAIUsageStats extends AIUsageStats {
  today: { requests: number; cost_usd: number; cost_krw: number };
  thisWeek: { requests: number; cost_usd: number; cost_krw: number };
  thisMonth: { requests: number; cost_usd: number; cost_krw: number };
  topUsers: Array<{
    userId: string;
    name: string;
    email: string;
    cost: number;
  }>;
}

interface OpenAICreditInfo {
  trackedUsage: {
    total: {
      cost_usd: number;
      cost_krw: number;
      tokens: number;
      requests: number;
    };
    today: {
      cost_usd: number;
      cost_krw: number;
      tokens: number;
      requests: number;
    };
    thisWeek: {
      cost_usd: number;
      cost_krw: number;
      tokens: number;
      requests: number;
    };
    thisMonth: {
      cost_usd: number;
      cost_krw: number;
      tokens: number;
      requests: number;
    };
    dailyTrend: Array<{ date: string; cost_usd: number }>;
  };
  openaiApiAccess: {
    available: boolean;
    reason: string;
    note: string;
  };
  apiKeyConfigured: boolean;
  apiKeyPrefix: string;
  error?: string;
}

export function AIUsagePage() {
  const router = useRouter();
  const [stats, setStats] = useState<ExtendedAIUsageStats | null>(null);
  const [creditInfo, setCreditInfo] = useState<OpenAICreditInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreditLoading, setIsCreditLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  // 전체 사용량 목록 관련 상태
  const [usageList, setUsageList] = useState<
    Array<AIUsageDetail & { user_name?: string; user_email?: string }>
  >([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listPagination, setListPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    model: "",
    requestType: "",
    userId: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await adminApiFetch(
          `/api/admin/ai-usage?days=${days}`
        );
        if (!response.ok) {
          throw new Error("AI 사용량 통계를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [days]);

  useEffect(() => {
    const fetchCreditInfo = async () => {
      setIsCreditLoading(true);
      try {
        const response = await adminApiFetch("/api/admin/openai-credit");
        if (response.ok) {
          const data = await response.json();
          setCreditInfo(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("크레딧 정보 조회 실패:", response.status, errorData);
          setCreditInfo({
            trackedUsage: {
              total: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
              today: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
              thisWeek: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
              thisMonth: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
              dailyTrend: [],
            },
            openaiApiAccess: {
              available: false,
              reason: "API 조회 실패",
              note: "",
            },
            apiKeyConfigured: false,
            apiKeyPrefix: "",
            error: errorData.error || "크레딧 정보를 불러올 수 없습니다.",
          });
        }
      } catch (err) {
        console.error("크레딧 정보 조회 실패:", err);
        setCreditInfo({
          trackedUsage: {
            total: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
            today: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
            thisWeek: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
            thisMonth: { cost_usd: 0, cost_krw: 0, tokens: 0, requests: 0 },
            dailyTrend: [],
          },
          openaiApiAccess: {
            available: false,
            reason: "API 조회 실패",
            note: "",
          },
          apiKeyConfigured: false,
          apiKeyPrefix: "",
          error: err instanceof Error ? err.message : "알 수 없는 오류",
        });
      } finally {
        setIsCreditLoading(false);
      }
    };

    fetchCreditInfo();
  }, []);

  // 전체 사용량 목록 조회
  useEffect(() => {
    const fetchUsageList = async () => {
      setIsLoadingList(true);
      try {
        const params = new URLSearchParams({
          page: listPagination.page.toString(),
          limit: listPagination.limit.toString(),
        });
        if (filters.model) params.append("model", filters.model);
        if (filters.requestType)
          params.append("requestType", filters.requestType);
        if (filters.userId) params.append("userId", filters.userId);
        if (filters.search) params.append("search", filters.search);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const response = await adminApiFetch(
          `/api/admin/ai-usage/list?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("AI 사용량 목록을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setUsageList(data.details || []);
        setListPagination((prev) => data.pagination || prev);
      } catch (err) {
        console.error("AI 사용량 목록 조회 실패:", err);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchUsageList();
  }, [listPagination.page, listPagination.limit, filters]);

  if (isLoading) {
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

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>
          {error || "통계를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            AI 사용량 관리
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            전체 AI 사용량 통계를 확인하세요.
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border"
          style={{
            borderColor: COLORS.border.input,
            backgroundColor: COLORS.background.card,
            color: COLORS.text.primary,
          }}
        >
          <option value="7">최근 7일</option>
          <option value="30">최근 30일</option>
          <option value="90">최근 90일</option>
        </select>
      </div>

      {/* AI 사용량 추적 정보 섹션 */}
      {creditInfo && (
        <div
          className="rounded-xl p-6"
          style={{
            ...CARD_STYLES.default,
            background: `linear-gradient(135deg, ${COLORS.brand.light}15 0%, ${COLORS.brand.primary}10 100%)`,
            border: `2px solid ${COLORS.brand.light}40`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: COLORS.text.primary }}
            >
              AI 사용량 추적 정보
            </h2>
            {isCreditLoading && (
              <div
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderColor: COLORS.brand.primary }}
              ></div>
            )}
          </div>

          {creditInfo.error ? (
            <div className="py-4">
              <p style={{ color: COLORS.status.error }} className="mb-2">
                {creditInfo.error}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    오늘 사용량
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.brand.primary }}
                  >
                    ₩
                    {Math.round(
                      creditInfo.trackedUsage.today.cost_krw
                    ).toLocaleString()}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    ${creditInfo.trackedUsage.today.cost_usd.toFixed(4)} ·{" "}
                    {creditInfo.trackedUsage.today.requests}개 요청
                  </p>
                </div>

                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    이번 주 사용량
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ₩
                    {Math.round(
                      creditInfo.trackedUsage.thisWeek.cost_krw
                    ).toLocaleString()}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    ${creditInfo.trackedUsage.thisWeek.cost_usd.toFixed(4)} ·{" "}
                    {creditInfo.trackedUsage.thisWeek.requests}개 요청
                  </p>
                </div>

                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    이번 달 사용량
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ₩
                    {Math.round(
                      creditInfo.trackedUsage.thisMonth.cost_krw
                    ).toLocaleString()}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    ${creditInfo.trackedUsage.thisMonth.cost_usd.toFixed(4)} ·{" "}
                    {creditInfo.trackedUsage.thisMonth.requests}개 요청
                  </p>
                </div>

                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    전체 사용량
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ₩
                    {Math.round(
                      creditInfo.trackedUsage.total.cost_krw
                    ).toLocaleString()}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    ${creditInfo.trackedUsage.total.cost_usd.toFixed(4)} ·{" "}
                    {creditInfo.trackedUsage.total.requests}개 요청
                  </p>
                </div>
              </div>

              {/* AI 사용량 정보 안내 */}
              {!creditInfo.openaiApiAccess.available && (
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    backgroundColor: COLORS.status.info + "15",
                    border: `1px solid ${COLORS.status.info}40`,
                  }}
                >
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.status.info }}
                  >
                    ℹ️ AI 사용량 정보
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {creditInfo.openaiApiAccess.reason}
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    {creditInfo.openaiApiAccess.note}
                  </p>
                </div>
              )}

              <div
                className="pt-4 border-t"
                style={{ borderColor: COLORS.border.light }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    API 키: {creditInfo.apiKeyPrefix}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    총 토큰:{" "}
                    {creditInfo.trackedUsage.total.tokens.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="오늘 AI 요청"
          value={stats.today.requests.toLocaleString()}
          description={`₩${Math.round(stats.today.cost_krw).toLocaleString()}`}
        />
        <StatsCard
          title="이번 주 AI 요청"
          value={stats.thisWeek.requests.toLocaleString()}
          description={`₩${Math.round(
            stats.thisWeek.cost_krw
          ).toLocaleString()}`}
        />
        <StatsCard
          title="이번 달 AI 요청"
          value={stats.thisMonth.requests.toLocaleString()}
          description={`₩${Math.round(
            stats.thisMonth.cost_krw
          ).toLocaleString()}`}
        />
        <StatsCard
          title="총 비용"
          value={`₩${Math.round(stats.total_cost_krw).toLocaleString()}`}
          description={`$${stats.total_cost_usd.toFixed(2)}`}
        />
        <StatsCard
          title="총 토큰"
          value={stats.total_tokens.toLocaleString()}
          description="전체 사용 토큰"
        />
        <StatsCard
          title="총 요청 수"
          value={stats.total_requests.toLocaleString()}
          description="전체 AI 요청"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* 모델별 사용량 */}
        {stats.by_model.length > 0 && (
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
              모델별 사용량
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <PieChart>
                <Pie
                  data={stats.by_model}
                  dataKey="cost_krw"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={false}
                >
                  {stats.by_model.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_CHART[index % COLORS_CHART.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: unknown) => {
                    const resolved =
                      Array.isArray(value) ? value[0] : value;
                    const numericValue =
                      typeof resolved === "number"
                        ? resolved
                        : Number(resolved ?? 0);
                    return `₩${Math.round(numericValue).toLocaleString()}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stats.by_model.map((model, index) => (
                <div
                  key={model.model}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS_CHART[index % COLORS_CHART.length],
                      }}
                    />
                    <span style={{ color: COLORS.text.primary }}>
                      {model.model}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span style={{ color: COLORS.text.secondary }}>
                      ₩{Math.round(model.cost_krw).toLocaleString()} (
                      {model.requests}회)
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      ${model.cost_usd.toFixed(2)}
                    </span>
                    {model.avg_duration_ms && model.avg_duration_ms > 0 && (
                      <span
                        className="text-xs"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        평균:{" "}
                        {model.avg_duration_ms < 1000
                          ? `${Math.round(model.avg_duration_ms)}밀리초`
                          : `${Math.round(model.avg_duration_ms / 1000)}초`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 타입별 사용량 */}
        {stats.by_type.length > 0 && (
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
              요청 타입별 사용량
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <BarChart data={stats.by_type}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border.light}
                />
                <XAxis
                  dataKey="request_type"
                  tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                  tickFormatter={(value) =>
                    `₩${Math.round(value).toLocaleString()}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | undefined) =>
                    `₩${Math.round(value ?? 0).toLocaleString()}`
                  }
                />
                <Bar dataKey="cost_krw" fill={COLORS.brand.primary} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stats.by_type.map((type) => (
                <div
                  key={type.request_type}
                  className="flex items-center justify-between text-sm"
                >
                  <span style={{ color: COLORS.text.primary }}>
                    {type.request_type === "daily_vivid"
                      ? "Daily Vivid"
                      : type.request_type === "weekly_vivid"
                      ? "Weekly Feedback"
                      : "Monthly Vivid"}
                  </span>
                  <div className="flex flex-col items-end">
                    <span style={{ color: COLORS.text.secondary }}>
                      ₩{Math.round(type.cost_krw).toLocaleString()} (
                      {type.requests}회)
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      ${type.cost_usd.toFixed(2)}
                    </span>
                    {type.avg_duration_ms && type.avg_duration_ms > 0 && (
                      <span
                        className="text-xs"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        평균:{" "}
                        {type.avg_duration_ms < 1000
                          ? `${Math.round(type.avg_duration_ms)}밀리초`
                          : `${Math.round(type.avg_duration_ms / 1000)}초`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 일별 트렌드 */}
      {stats.daily_trend.length > 0 && (
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
            일별 비용 추이
          </h2>
          <ResponsiveContainer
            width="100%"
            height={250}
            className="sm:h-[300px]"
          >
            <LineChart data={stats.daily_trend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border.light}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                tickFormatter={(value) =>
                  `₩${Math.round(value).toLocaleString()}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.background.card,
                  border: `1px solid ${COLORS.border.light}`,
                  borderRadius: "8px",
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("ko-KR")
                }
                formatter={(value: number | undefined) => [
                  `₩${Math.round(value ?? 0).toLocaleString()}`,
                  "비용",
                ]}
              />
              <Line
                type="monotone"
                dataKey="cost_krw"
                stroke={COLORS.brand.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.brand.primary, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 일간/주간/월간 사용량 시각화 */}
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
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.light} />
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
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.background.card,
                border: `1px solid ${COLORS.border.light}`,
                borderRadius: "8px",
              }}
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

      {/* 전체 사용량 목록 */}
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
          전체 사용량 내역
        </h2>

        {/* 필터 및 검색 영역 */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                검색
              </label>
              <input
                type="text"
                placeholder="사용자명, 이메일, 모델명..."
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
                페이지당 개수
              </label>
              <select
                value={listPagination.limit}
                onChange={(e) => {
                  setListPagination({
                    ...listPagination,
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
        {isLoadingList ? (
          <div className="text-center py-8">
            <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
          </div>
        ) : usageList.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: COLORS.text.muted }}>사용량 내역이 없습니다.</p>
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
                      날짜
                    </th>
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
                      className="px-4 py-3 text-center text-sm font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usageList.map((detail) => (
                    <tr
                      key={detail.id}
                      className="hover:bg-opacity-50 transition-colors cursor-pointer"
                      style={{
                        borderBottom: `1px solid ${COLORS.border.light}`,
                      }}
                      onClick={() =>
                        detail.user_id &&
                        router.push(`/admin/users/${detail.user_id}`)
                      }
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          {new Date(detail.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span
                            className="text-sm font-medium block"
                            style={{ color: COLORS.text.primary }}
                          >
                            {detail.user_name || "알 수 없음"}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.tertiary }}
                          >
                            {detail.user_email || ""}
                          </span>
                        </div>
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
                        <span
                          className="text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          {detail.total_tokens.toLocaleString()}
                        </span>
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
            {listPagination.totalPages > 1 && (
              <div
                className="flex items-center justify-between pt-4 border-t mt-4"
                style={{ borderColor: COLORS.border.light }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    페이지 {listPagination.page} / {listPagination.totalPages} (
                    {listPagination.total}개)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setListPagination({
                        ...listPagination,
                        page: Math.max(1, listPagination.page - 1),
                      })
                    }
                    disabled={listPagination.page === 1}
                    className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        listPagination.page === 1
                          ? COLORS.background.hover
                          : COLORS.brand.light,
                      color:
                        listPagination.page === 1
                          ? COLORS.text.muted
                          : COLORS.brand.primary,
                    }}
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setListPagination({
                        ...listPagination,
                        page: Math.min(
                          listPagination.totalPages,
                          listPagination.page + 1
                        ),
                      })
                    }
                    disabled={listPagination.page === listPagination.totalPages}
                    className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        listPagination.page === listPagination.totalPages
                          ? COLORS.background.hover
                          : COLORS.brand.light,
                      color:
                        listPagination.page === listPagination.totalPages
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

      {/* 상위 유저 */}
      {stats.topUsers.length > 0 && (
        <div
          className="rounded-xl p-4 sm:p-6"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            AI 사용량 상위 유저 (Top 10)
          </h2>

          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden md:block overflow-x-auto">
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
                    순위
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    이름
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    이메일
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    비용
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.map((user, index) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-opacity-50 transition-colors cursor-pointer"
                    style={{
                      borderBottom: `1px solid ${COLORS.border.light}`,
                    }}
                    onClick={() => router.push(`/admin/users/${user.userId}`)}
                  >
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.primary }}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.primary }}>
                        {user.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.secondary }}>
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span
                          className="font-semibold"
                          style={{ color: COLORS.text.primary }}
                        >
                          ₩{Math.round(user.cost * 1350).toLocaleString()}
                        </span>
                        <span
                          className="text-xs ml-2"
                          style={{ color: COLORS.text.tertiary }}
                        >
                          ${user.cost.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/ai-usage/${user.userId}`);
                        }}
                        className="text-sm px-3 py-1 rounded-lg"
                        style={{
                          backgroundColor: COLORS.brand.light,
                          color: COLORS.brand.primary,
                        }}
                      >
                        상세 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="md:hidden space-y-3">
            {stats.topUsers.map((user, index) => (
              <div
                key={user.userId}
                onClick={() => router.push(`/admin/users/${user.userId}`)}
                className="rounded-lg p-4 cursor-pointer transition-colors"
                style={{
                  backgroundColor: COLORS.background.hover,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-bold"
                      style={{ color: COLORS.brand.primary }}
                    >
                      #{index + 1}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      {user.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      ₩{Math.round(user.cost * 1350).toLocaleString()}
                    </span>
                    <span
                      className="text-xs ml-1"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      ${user.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/ai-usage/${user.userId}`);
                  }}
                  className="w-full text-sm px-3 py-2 rounded-lg text-center"
                  style={{
                    backgroundColor: COLORS.brand.light,
                    color: COLORS.brand.primary,
                  }}
                >
                  상세 보기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
