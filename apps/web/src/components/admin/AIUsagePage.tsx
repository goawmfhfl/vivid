"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { StatsCard } from "./StatsCard";
import type { AIUsageStats } from "@/types/admin";
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
  subscription: {
    hasPaymentMethod: boolean;
    softLimit: number;
    hardLimit: number;
    systemHardLimit: number;
  } | null;
  creditGrants: {
    totalAvailable: number;
    grants: Array<any>;
  } | null;
  usage: {
    totalUsage: number;
    dailyCosts: Array<any>;
  } | null;
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
          console.log("OpenAI 크레딧 정보 응답:", data);
          setCreditInfo(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("크레딧 정보 조회 실패:", response.status, errorData);
          setCreditInfo({
            subscription: null,
            creditGrants: null,
            usage: null,
            apiKeyConfigured: false,
            apiKeyPrefix: "",
            error: errorData.error || "크레딧 정보를 불러올 수 없습니다.",
          });
        }
      } catch (err) {
        console.error("크레딧 정보 조회 실패:", err);
        setCreditInfo({
          subscription: null,
          creditGrants: null,
          usage: null,
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

      {/* OpenAI 크레딧 정보 섹션 */}
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
              OpenAI 크레딧 정보
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
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                OpenAI API 키에 billing API 접근 권한이 필요합니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditInfo.creditGrants && (
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    크레딧 잔액
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.brand.primary }}
                  >
                    ${creditInfo.creditGrants.totalAvailable.toFixed(2)}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    {creditInfo.creditGrants.grants.length}개의 크레딧
                  </p>
                </div>
              )}

              {creditInfo.usage && (
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
                    ${(creditInfo.usage.totalUsage / 100).toFixed(2)}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    실제 OpenAI 사용량
                  </p>
                </div>
              )}

              {creditInfo.subscription && (
                <>
                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      소프트 리밋
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: COLORS.text.primary }}
                    >
                      ${creditInfo.subscription.softLimit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      하드 리밋
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: COLORS.text.primary }}
                    >
                      ${creditInfo.subscription.hardLimit.toFixed(2)}
                    </p>
                  </div>
                </>
              )}

              {creditInfo.creditGrants && creditInfo.usage && (
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    예상 잔액
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color:
                        creditInfo.creditGrants.totalAvailable -
                          creditInfo.usage.totalUsage / 100 >
                        0
                          ? COLORS.status.success
                          : COLORS.status.warning,
                    }}
                  >
                    $
                    {(
                      creditInfo.creditGrants.totalAvailable -
                      creditInfo.usage.totalUsage / 100
                    ).toFixed(2)}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    크레딧 - 사용량
                  </p>
                </div>
              )}

              {/* 데이터가 없을 때 메시지 */}
              {!creditInfo.creditGrants &&
                !creditInfo.usage &&
                !creditInfo.subscription && (
                  <div className="col-span-full py-4 text-center">
                    <p
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      크레딧 정보를 불러올 수 없습니다.
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      OpenAI API 키에 billing API 접근 권한이 필요합니다.
                    </p>
                  </div>
                )}
            </div>
          )}

          {creditInfo.apiKeyPrefix && (
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: COLORS.border.light }}
            >
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                API 키: {creditInfo.apiKeyPrefix}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="오늘 AI 요청"
          value={stats.today.requests.toLocaleString()}
          description={`$${stats.today.cost_usd.toFixed(2)}`}
        />
        <StatsCard
          title="이번 주 AI 요청"
          value={stats.thisWeek.requests.toLocaleString()}
          description={`$${stats.thisWeek.cost_usd.toFixed(2)}`}
        />
        <StatsCard
          title="이번 달 AI 요청"
          value={stats.thisMonth.requests.toLocaleString()}
          description={`$${stats.thisMonth.cost_usd.toFixed(2)}`}
        />
        <StatsCard
          title="총 비용 (USD)"
          value={`$${stats.total_cost_usd.toFixed(2)}`}
          description={`₩${stats.total_cost_krw.toLocaleString()}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.by_model}
                  dataKey="cost_usd"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }: { name: string }) => name}
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
                  formatter={(value: number) => `$${value.toFixed(2)}`}
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
                  <span style={{ color: COLORS.text.secondary }}>
                    ${model.cost_usd.toFixed(2)} ({model.requests}회)
                  </span>
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
            <ResponsiveContainer width="100%" height={300}>
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
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="cost_usd" fill={COLORS.brand.primary} />
              </BarChart>
            </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={300}>
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
                tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                formatter={(value: number) => [`$${value.toFixed(2)}`, "비용"]}
              />
              <Line
                type="monotone"
                dataKey="cost_usd"
                stroke={COLORS.brand.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.brand.primary, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 상위 유저 */}
      {stats.topUsers.length > 0 && (
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
            AI 사용량 상위 유저 (Top 10)
          </h2>
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
                    비용 (USD)
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
                      <span style={{ color: COLORS.text.primary }}>
                        ${user.cost.toFixed(2)}
                      </span>
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
        </div>
      )}
    </div>
  );
}
