"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import type { SurveySubmission, SurveyStats, SurveyInsights } from "@/types/survey";
import {
  BarChart3,
  Users,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  ListChecks,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";
import { SURVEY_SECTIONS, getQuestionTextById } from "@/constants/survey";

const SECTION_LABELS: Record<string, string> = {
  "1": "나를 이해해주는 경험",
  "2": "기록을 성장으로 정리",
  "3": "비전 중심의 자기 설계",
  "4": "앱 사용 경험",
};

function maskPhone(phone: string | null): string {
  if (!phone) return "-";
  if (phone.length <= 4) return "****";
  return phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4);
}

export function SurveyResultsView() {
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<SurveyInsights | null>(null);
  const [insightsRawText, setInsightsRawText] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "submissions">("overview");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiFetch(
        `/api/admin/survey-results?page=${pagination.page}&limit=${pagination.limit}`
      );
      if (!res.ok) throw new Error("설문 결과를 불러오는데 실패했습니다.");
      const data = await res.json();
      setSubmissions(data.submissions);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);
    setInsightsRawText(null);
    try {
      const res = await adminApiFetch("/api/admin/survey-results/insights", {
        method: "POST",
      });
      if (!res.ok) throw new Error("인사이트 생성에 실패했습니다.");
      const data = await res.json();
      setInsights(data.insights ?? null);
      setInsightsRawText(data.rawText ?? null);
    } catch (err) {
      setInsightsRawText(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setInsightsLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.brand.primary }}
          />
          <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          설문 결과
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          VIVID 한 달 사용자 설문 응답을 확인하세요.
        </p>
      </div>

      {/* 요약 카드 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            className="rounded-xl p-4"
            style={CARD_STYLES.default}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
              <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
                총 참여자
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              {stats.total}명
            </p>
          </div>
          {(["1", "2", "3", "4"] as const).map((key) => (
            <div
              key={key}
              className="rounded-xl p-4"
              style={CARD_STYLES.default}
            >
              <span className="text-xs font-medium block mb-2" style={{ color: COLORS.text.tertiary }}>
                {SECTION_LABELS[key]}
              </span>
              <p className="text-2xl font-bold" style={{ color: COLORS.brand.primary }}>
                {stats.sectionAverages[key].toFixed(1)}점
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 섹션별 시각화 */}
      {stats && stats.total > 0 && (
        <div
          className="rounded-xl p-6"
          style={CARD_STYLES.default}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
              섹션별 평균 점수
            </h3>
          </div>
          <div className="space-y-4">
            {(["1", "2", "3", "4"] as const).map((key) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: COLORS.text.secondary }}>{SECTION_LABELS[key]}</span>
                  <span style={{ color: COLORS.text.primary }}>
                    {stats.sectionAverages[key].toFixed(1)} / 5
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(stats.sectionAverages[key] / 5) * 100}%`,
                      backgroundColor: COLORS.chart.alignment,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 인사이트 */}
      <div
        className="rounded-xl p-6"
        style={CARD_STYLES.default}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.brand.primary}20` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                AI 인사이트
              </h3>
              <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                강점·취약점·핵심 인사이트를 한눈에
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            disabled={insightsLoading || stats?.total === 0}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:opacity-90"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              boxShadow: "0 2px 8px rgba(127, 143, 122, 0.3)",
            }}
          >
            {insightsLoading ? "생성 중..." : "인사이트 생성"}
          </button>
        </div>

        {insights ? (
          <div className="space-y-5">
            {/* 핵심 인사이트 - 최상단 강조 */}
            {insights.keyInsights.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.brand.primary}15 0%, ${COLORS.brand.secondary}10 100%)`,
                  border: `1px solid ${COLORS.brand.primary}40`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" style={{ color: COLORS.brand.secondary }} />
                  <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: COLORS.brand.secondary }}>
                    핵심 인사이트
                  </h4>
                </div>
                <ul className="space-y-3">
                  {insights.keyInsights.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: COLORS.brand.primary,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 강점 */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.status.success}40`,
                  boxShadow: "0 2px 12px rgba(127, 143, 122, 0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.status.success}25` }}
                  >
                    <TrendingUp className="w-4 h-4" style={{ color: COLORS.status.success }} />
                  </div>
                  <h4 className="text-sm font-bold" style={{ color: COLORS.status.success }}>
                    강점
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {insights.strengths.length > 0 ? (
                    insights.strengths.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: COLORS.status.success }} />
                        <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                          {item}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs italic" style={{ color: COLORS.text.tertiary }}>
                      분석된 강점이 없습니다.
                    </p>
                  )}
                </ul>
              </div>

              {/* 취약점 */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.status.warning}40`,
                  boxShadow: "0 2px 12px rgba(179, 142, 58, 0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.status.warning}25` }}
                  >
                    <AlertTriangle className="w-4 h-4" style={{ color: COLORS.status.warning }} />
                  </div>
                  <h4 className="text-sm font-bold" style={{ color: COLORS.status.warning }}>
                    취약점
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {insights.weaknesses.length > 0 ? (
                    insights.weaknesses.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: COLORS.status.warning }} />
                        <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                          {item}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs italic" style={{ color: COLORS.text.tertiary }}>
                      분석된 취약점이 없습니다.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : insightsRawText ? (
          <div
            className="rounded-xl p-5 whitespace-pre-wrap text-sm leading-relaxed"
            style={{
              backgroundColor: COLORS.background.hover,
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            {insightsRawText}
          </div>
        ) : null}
      </div>

      {/* 탭: 개요 / 질문별 / 제출 목록 */}
      <div
        className="flex flex-wrap gap-2 p-1.5 rounded-xl"
        style={{ backgroundColor: COLORS.background.hover }}
      >
        {[
          { id: "overview" as const, label: "자유의견" },
          { id: "questions" as const, label: "질문별 결과" },
          { id: "submissions" as const, label: "제출 목록" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              backgroundColor: activeTab === tab.id ? COLORS.background.cardElevated : "transparent",
              color: activeTab === tab.id ? COLORS.brand.primary : COLORS.text.secondary,
              boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "questions" && stats && stats.total > 0 && (
        <div
          className="rounded-xl p-6"
          style={CARD_STYLES.default}
        >
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
              질문별 평균 점수
            </h3>
          </div>
          <div className="space-y-6">
            {SURVEY_SECTIONS.filter((s) => s.id !== "5").map((section) => (
              <div key={section.id}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.brand.primary }}>
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.questions.map((q) => {
                    const avg = stats.questionAverages?.[q.id] ?? 0;
                    return (
                      <div key={q.id} className="pl-2 border-l-2" style={{ borderColor: COLORS.border.light }}>
                        <p className="text-xs text-ellipsis line-clamp-2 mb-1" style={{ color: COLORS.text.secondary }}>
                          {q.text}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                            {q.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: COLORS.brand.primary }}>
                              {avg.toFixed(1)}점
                            </span>
                            <div
                              className="w-16 h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: COLORS.background.hover }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(avg / 5) * 100}%`,
                                  backgroundColor: COLORS.chart.alignment,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div
          className="rounded-xl p-6"
          style={CARD_STYLES.default}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
              자유의견 ({submissions.filter((s) => s.free_comment).length}건)
            </h3>
          </div>
          <div className="space-y-3">
            {submissions
              .filter((s) => s.free_comment)
              .slice(0, 20)
              .map((s, i) => (
                <div
                  key={s.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    borderColor: COLORS.border.light,
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap" style={{ color: COLORS.text.primary }}>
                    {s.free_comment}
                  </p>
                  <p className="text-xs mt-2" style={{ color: COLORS.text.tertiary }}>
                    {formatDate(s.created_at)}
                  </p>
                </div>
              ))}
            {submissions.filter((s) => s.free_comment).length === 0 && (
              <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                자유의견이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-4">
          {submissions.map((s, index) => {
            const isExpanded = expandedId === s.id;
            const scores = s.section_scores as Record<string, number>;
            return (
              <div
                key={s.id}
                className="rounded-xl p-6 transition-all duration-300"
                style={{
                  ...CARD_STYLES.default,
                  ...(isExpanded ? { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } : {}),
                }}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div>
                    <span
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: COLORS.brand.light,
                        color: COLORS.brand.primary,
                      }}
                    >
                      응답자 #{(pagination.page - 1) * pagination.limit + index + 1}
                    </span>
                    <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
                      <Calendar className="w-4 h-4 shrink-0" />
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 shrink-0" style={{ color: COLORS.text.tertiary }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 shrink-0" style={{ color: COLORS.text.tertiary }} />
                  )}
                </div>
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t space-y-6" style={{ borderColor: COLORS.border.light }}>
                    {SURVEY_SECTIONS.filter((sec) => sec.id !== "5").map((section) => {
                      const sectionQuestions = section.questions.filter((q) => scores?.[q.id] !== undefined);
                      if (sectionQuestions.length === 0) return null;
                      return (
                        <div key={section.id}>
                          <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.brand.primary }}>
                            {section.title}
                          </h4>
                          <div className="space-y-3">
                            {sectionQuestions.map((q) => (
                              <div
                                key={q.id}
                                className="pl-3 border-l-2"
                                style={{ borderColor: COLORS.border.light }}
                              >
                                <p className="text-xs text-ellipsis line-clamp-2 mb-1.5" style={{ color: COLORS.text.secondary }}>
                                  {q.text}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                                    {q.id}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold" style={{ color: COLORS.brand.primary }}>
                                      {scores[q.id]}점
                                    </span>
                                    <div
                                      className="w-16 h-1.5 rounded-full overflow-hidden"
                                      style={{ backgroundColor: COLORS.background.hover }}
                                    >
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                          width: `${((scores[q.id] ?? 0) / 5) * 100}%`,
                                          backgroundColor: COLORS.chart.alignment,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {s.free_comment && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: COLORS.background.hover,
                          borderColor: COLORS.border.light,
                          border: "1px solid",
                        }}
                      >
                        <p className="text-xs font-semibold mb-2" style={{ color: COLORS.text.tertiary }}>
                          자유의견
                        </p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.text.primary }}>
                          {s.free_comment}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: COLORS.text.secondary }}>
                      <Phone className="w-4 h-4 shrink-0" />
                      {maskPhone(s.phone)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.background.hover,
                  color: COLORS.text.primary,
                }}
              >
                이전
              </button>
              <span className="px-4 py-2" style={{ color: COLORS.text.secondary }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.min(pagination.totalPages, p.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-lg disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.background.hover,
                  color: COLORS.text.primary,
                }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
