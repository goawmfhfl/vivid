"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { StatsCard } from "./StatsCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ContentStats {
  daily_vivid: {
    by_day: Array<{ date: string; count: number }>;
    by_week: Array<{ week: string; count: number }>;
    by_month: Array<{ month: string; count: number }>;
  };
  weekly_vivid: {
    by_week: Array<{ week: string; count: number }>;
    by_month: Array<{ month: string; count: number }>;
  };
  monthly_vivid: {
    by_month: Array<{ month: string; count: number }>;
  };
}

type PeriodType = "day" | "week" | "month";

export function ContentStatsPage() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodType>("day");
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await adminApiFetch(
          `/api/admin/content-stats?period=${period}&days=${days}`
        );
        if (!response.ok) {
          throw new Error("콘텐츠 통계를 불러오는데 실패했습니다.");
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
  }, [period, days]);

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

  // 통계 요약 계산
  const totalDaily = stats.daily_vivid.by_day.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalWeekly = stats.weekly_vivid.by_week.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalMonthly = stats.monthly_vivid.by_month.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // 차트 데이터 준비
  const getDailyChartData = () => {
    if (period === "day") {
      return stats.daily_vivid.by_day.map((item) => ({
        date: new Date(item.date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        count: item.count,
      }));
    } else if (period === "week") {
      return stats.daily_vivid.by_week.map((item) => ({
        week: item.week,
        count: item.count,
      }));
    } else {
      return stats.daily_vivid.by_month.map((item) => ({
        month: item.month,
        count: item.count,
      }));
    }
  };

  const getWeeklyChartData = () => {
    if (period === "week") {
      return stats.weekly_vivid.by_week.map((item) => ({
        week: item.week,
        count: item.count,
      }));
    } else {
      return stats.weekly_vivid.by_month.map((item) => ({
        month: item.month,
        count: item.count,
      }));
    }
  };

  const getMonthlyChartData = () => {
    return stats.monthly_vivid.by_month.map((item) => ({
      month: item.month,
      count: item.count,
    }));
  };

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            콘텐츠 통계
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            피드백 생성 통계를 확인하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.card,
              color: COLORS.text.primary,
            }}
          >
            <option value="day">일별</option>
            <option value="week">주별</option>
            <option value="month">월별</option>
          </select>
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
            <option value="180">최근 180일</option>
          </select>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="데일리 vivid"
          value={totalDaily.toLocaleString()}
          description={`${
            period === "day" ? "일별" : period === "week" ? "주별" : "월별"
          } 생성 건수`}
        />
        <StatsCard
          title="주간 vivid"
          value={totalWeekly.toLocaleString()}
          description={`${period === "week" ? "주별" : "월별"} 생성 건수`}
        />
        <StatsCard
          title="월간 vivid"
          value={totalMonthly.toLocaleString()}
          description="월별 생성 건수"
        />
      </div>

      {/* 일간 피드백 차트 */}
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
          데일리 vivid 생성 추이
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getDailyChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.light} />
            <XAxis
              dataKey={
                period === "day" ? "date" : period === "week" ? "week" : "month"
              }
              tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
            />
            <YAxis tick={{ fill: COLORS.text.secondary, fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={COLORS.brand.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.brand.primary, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 주간 피드백 차트 */}
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
          주간 vivid 생성 추이
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getWeeklyChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.light} />
            <XAxis
              dataKey={period === "week" ? "week" : "month"}
              tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
            />
            <YAxis tick={{ fill: COLORS.text.secondary, fontSize: 12 }} />
            <Bar dataKey="count" fill={COLORS.brand.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월간 비비드 차트 */}
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
          월간 vivid 생성 추이
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getMonthlyChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.light} />
            <XAxis
              dataKey="month"
              tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
            />
            <YAxis tick={{ fill: COLORS.text.secondary, fontSize: 12 }} />
            <Bar dataKey="count" fill={COLORS.brand.light} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
