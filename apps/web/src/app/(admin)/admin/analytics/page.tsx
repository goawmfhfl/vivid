"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, Loader2, Sparkles, Target, TrendingUp, Lightbulb, Rocket } from "lucide-react";
import { COLORS, TYPOGRAPHY, SPACING, CARD_STYLES } from "@/lib/design-system";
import { adminApiFetch } from "@/lib/admin-api-client";

interface AnalyticsData {
  summary: {
    totalRecords: number;
    totalDailyVivid: number;
    totalTodoItems: number;
    uniqueUsersWithRecords: number;
    uniqueUsersWithDaily: number;
  };
  recordTypeDistribution: Record<string, number>;
  dailyTypeDistribution: Record<string, number>;
  q1Q2Usage: {
    bothQ1Q2: number;
    q1Only: number;
    q2Only: number;
    q3Count: number;
    sampleSize: number;
  };
  metrics: {
    avgContentLength: number;
    avgAlignmentScore: number | null;
    avgRecordsPerUser: number;
    avgDailyPerUser: number;
    avgMaxStreakDays: number;
  };
  todoUsage: {
    total: number;
    checked: number;
    completionRate: number;
    withScheduled: number;
  };
  keywordSample: string[];
  aspiredTraitsSample: string[];
}

interface AnalyticsInsights {
  usagePatterns: string[];
  keyInsights: string[];
  recommendations: string[];
  suggestedFeatures?: string[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!data) return;
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await adminApiFetch("/api/admin/analytics/daily-vivid/insights", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);
      if (json.insights) {
        setInsights(json.insights);
      } else if (json.rawText) {
        setInsights({
          usagePatterns: [],
          keyInsights: [json.rawText],
          recommendations: [],
          suggestedFeatures: [],
        });
      }
    } catch (e) {
      setInsightsError(e instanceof Error ? e.message : "인사이트 생성 실패");
    } finally {
      setInsightsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    adminApiFetch("/api/admin/analytics/daily-vivid")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLORS.brand.primary }} />
        <span style={{ color: COLORS.text.secondary }}>분석 중...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="p-6 rounded-xl"
        style={{ ...CARD_STYLES.default, borderColor: COLORS.status.error }}
      >
        <p style={{ color: COLORS.text.primary }}>
          {error || "데이터를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  const { summary, recordTypeDistribution, dailyTypeDistribution, q1Q2Usage, metrics, todoUsage } = data;
  const totalRecords = summary.totalRecords || 1;
  const totalDaily = summary.totalDailyVivid || 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6" style={{ color: COLORS.brand.primary }} />
        <h1 className={TYPOGRAPHY.h2.fontSize} style={{ color: COLORS.text.primary, fontWeight: 600 }}>
          Daily Vivid 사용 분석
        </h1>
      </div>

      {/* 요약 */}
      <div
        className="p-6 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-4"
        style={{ ...CARD_STYLES.default }}
      >
        <StatCard label="총 기록" value={summary.totalRecords} unit="건" />
        <StatCard label="AI 리포트" value={summary.totalDailyVivid} unit="건" />
        <StatCard label="할 일 항목" value={summary.totalTodoItems} unit="건" />
        <StatCard label="기록 유저" value={summary.uniqueUsersWithRecords} unit="명" />
        <StatCard label="리포트 유저" value={summary.uniqueUsersWithDaily} unit="명" />
      </div>

      {/* 기록 타입 / Daily 타입 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ ...CARD_STYLES.default }}>
          <h2 className="font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            기록 타입 분포
          </h2>
          <div className="space-y-2">
            {Object.entries(recordTypeDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const label = type === "dream" || type === "vivid" ? "비비드" : type === "review" ? "회고" : type;
                const pct = ((count / totalRecords) * 100).toFixed(1);
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span style={{ color: COLORS.text.secondary }}>{label}</span>
                    <span style={{ color: COLORS.text.primary, fontWeight: 500 }}>
                      {count}건 ({pct}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="p-6 rounded-xl" style={{ ...CARD_STYLES.default }}>
          <h2 className="font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            AI 리포트 타입 분포
          </h2>
          <div className="space-y-2">
            {Object.entries(dailyTypeDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const label = type === "vivid" ? "비비드" : type === "review" ? "회고" : type;
                const pct = ((count / totalDaily) * 100).toFixed(1);
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span style={{ color: COLORS.text.secondary }}>{label}</span>
                    <span style={{ color: COLORS.text.primary, fontWeight: 500 }}>
                      {count}건 ({pct}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Q1/Q2 활용 / 핵심 지표 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ ...CARD_STYLES.default }}>
          <h2 className="font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            Q1/Q2/Q3 활용 (샘플 {q1Q2Usage.sampleSize}건)
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>Q1+Q2 둘 다</span>
              <span style={{ color: COLORS.text.primary }}>{q1Q2Usage.bothQ1Q2}건</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>Q1만</span>
              <span style={{ color: COLORS.text.primary }}>{q1Q2Usage.q1Only}건</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>Q2만</span>
              <span style={{ color: COLORS.text.primary }}>{q1Q2Usage.q2Only}건</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>Q3(회고)</span>
              <span style={{ color: COLORS.text.primary }}>{q1Q2Usage.q3Count}건</span>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl" style={{ ...CARD_STYLES.default }}>
          <h2 className="font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            핵심 지표
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>평균 기록 길이</span>
              <span style={{ color: COLORS.text.primary }}>{metrics.avgContentLength}자</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>평균 일치도</span>
              <span style={{ color: COLORS.text.primary }}>{metrics.avgAlignmentScore ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>유저당 평균 기록</span>
              <span style={{ color: COLORS.text.primary }}>{metrics.avgRecordsPerUser}건</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.text.secondary }}>평균 최대 연속일</span>
              <span style={{ color: COLORS.text.primary }}>{metrics.avgMaxStreakDays}일</span>
            </div>
          </div>
        </div>
      </div>

      {/* 할 일 완료율 */}
      <div className="p-6 rounded-xl" style={{ ...CARD_STYLES.default }}>
        <h2 className="font-semibold mb-4" style={{ color: COLORS.text.primary }}>
          할 일 활용
        </h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <span style={{ color: COLORS.text.tertiary, fontSize: "0.875rem" }}>총 항목</span>
            <p style={{ color: COLORS.text.primary, fontWeight: 600 }}>{todoUsage.total}건</p>
          </div>
          <div>
            <span style={{ color: COLORS.text.tertiary, fontSize: "0.875rem" }}>완료</span>
            <p style={{ color: COLORS.text.primary, fontWeight: 600 }}>{todoUsage.checked}건</p>
          </div>
          <div>
            <span style={{ color: COLORS.text.tertiary, fontSize: "0.875rem" }}>완료율</span>
            <p style={{ color: COLORS.text.primary, fontWeight: 600 }}>{todoUsage.completionRate}%</p>
          </div>
          <div>
            <span style={{ color: COLORS.text.tertiary, fontSize: "0.875rem" }}>미룬 항목</span>
            <p style={{ color: COLORS.text.primary, fontWeight: 600 }}>{todoUsage.withScheduled}건</p>
          </div>
        </div>
      </div>

      {/* AI 인사이트 */}
      <div
        className="p-6 rounded-xl"
        style={{ ...CARD_STYLES.default }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.brand.primary}20` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                AI 인사이트
              </h2>
              <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                Pro 모델로 심층 분석 · 사용 패턴·핵심 인사이트·권장사항
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            disabled={insightsLoading}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:opacity-90 shrink-0"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              boxShadow: "0 2px 8px rgba(127, 143, 122, 0.3)",
            }}
          >
            {insightsLoading ? "분석 중..." : "AI 인사이트 얻기"}
          </button>
        </div>

        {insightsError && (
          <p className="text-sm mb-4" style={{ color: COLORS.status.error }}>
            {insightsError}
          </p>
        )}

        {insights && (
          <div className="space-y-6">
            {/* 핵심 인사이트 */}
            {insights.keyInsights.length > 0 && (
              <div
                className="rounded-xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.brand.primary}15 0%, ${COLORS.brand.secondary}10 100%)`,
                  border: `1px solid ${COLORS.brand.primary}40`,
                  boxShadow: "0 2px 12px rgba(127, 143, 122, 0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.brand.primary}30` }}
                  >
                    <Target className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
                      핵심 인사이트
                    </h3>
                    <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      데이터 기반 핵심 발견
                    </p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {insights.keyInsights.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: COLORS.brand.primary,
                          color: COLORS.text.white,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed flex-1 pt-0.5" style={{ color: COLORS.text.primary }}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 사용 패턴 - 구체적 기능별 분석 */}
            {insights.usagePatterns.length > 0 && (
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.border.light}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.brand.primary}20` }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
                      사용 패턴
                    </h3>
                    <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      Q1/Q2/Q3·리포트·할 일 등 기능별 활용 현황
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-1">
                  {insights.usagePatterns.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        borderLeft: `4px solid ${COLORS.brand.primary}`,
                      }}
                    >
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: `${COLORS.brand.primary}25`,
                          color: COLORS.brand.primary,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: COLORS.text.primary }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 권장사항 */}
              {insights.recommendations.length > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.status.success}50`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.status.success}25` }}
                    >
                      <Lightbulb className="w-5 h-5" style={{ color: COLORS.status.success }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
                        권장사항
                      </h3>
                      <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        즉시 적용 가능한 개선 방향
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {insights.recommendations.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: COLORS.status.success,
                            color: COLORS.text.white,
                          }}
                        >
                          ✓
                        </span>
                        <p className="text-sm leading-relaxed flex-1" style={{ color: COLORS.text.primary }}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 추천 기능 */}
              {(insights.suggestedFeatures?.length ?? 0) > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.brand.secondary}12 0%, ${COLORS.brand.primary}10 100%)`,
                    border: `1px solid ${COLORS.brand.secondary}40`,
                    boxShadow: "0 2px 12px rgba(127, 143, 122, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.brand.secondary}30` }}
                    >
                      <Rocket className="w-5 h-5" style={{ color: COLORS.brand.secondary }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: COLORS.text.primary }}>
                        추천 기능
                      </h3>
                      <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        사용자가 좋아할 만한 신규 기능 제안
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {insights.suggestedFeatures!.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: COLORS.brand.secondary,
                            color: COLORS.text.white,
                          }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed flex-1" style={{ color: COLORS.text.primary }}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div>
      <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
        {value.toLocaleString()}
        {unit}
      </p>
    </div>
  );
}
