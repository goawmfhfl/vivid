"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { AdminSelect } from "./AdminSelect";
import type { AIUsageStats, AIUsageDetail } from "@/types/admin";
import {
  BarChart3,
  Zap,
  Calendar,
  DollarSign,
  List,
  ChevronRight,
  Search,
  X,
  Copy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const GEMINI_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",
  "gemini-3.0-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-3.1-pro-preview",
];

const REQUEST_TYPE_LABELS: Record<string, string> = {
  // Daily Vivid 세부 타입
  daily_vivid_report: "비비드 리포트",
  daily_vivid_trend: "최근 동향",
  daily_vivid_integrated: "통합 리포트",
  daily_vivid_insight: "인사이트",
  daily_vivid_todo_list: "투두 리스트",
  daily_vivid_review: "회고",
  daily_vivid: "Daily Vivid (레거시)",
  // 기타
  weekly_vivid: "Weekly Vivid",
  monthly_vivid: "Monthly Vivid",
  user_persona: "User Persona",
  user_trends: "User Trends",
  user_trends_weekly: "Cron 주간 성장",
  user_trends_monthly: "Cron 월간 성장",
};

interface ExtendedStats extends AIUsageStats {
  today: { requests: number; cost_usd: number; cost_krw: number };
  thisMonth: { requests: number; cost_usd: number; cost_krw: number };
}

type ErrorDetailsPayload = {
  source?: string;
  flow?: string;
  status?: string;
  reason_code?: string;
  failed_step?: string;
  user_id?: string;
  period_start?: string;
  period_end?: string;
  is_pro_snapshot?: boolean;
  model?: string;
  duration_ms?: number;
  input_count?: number;
  aux_count?: number | null;
  error?: {
    name?: string;
    message?: string;
    code?: string;
    status?: number;
  };
  stack_top?: string[];
  trace_id?: string;
  created_at?: string;
};

function parseErrorDetails(errorMessage: string | null | undefined): ErrorDetailsPayload | null {
  if (!errorMessage) return null;
  try {
    const parsed = JSON.parse(errorMessage);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ErrorDetailsPayload;
  } catch {
    return null;
  }
}

export function AIUsagePage() {
  const router = useRouter();
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [list, setList] = useState<(AIUsageDetail & { user_name?: string; user_email?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [modelFilter, setModelFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [selectedErrorRow, setSelectedErrorRow] = useState<(AIUsageDetail & {
    user_name?: string;
    user_email?: string;
  }) | null>(null);
  const [copiedError, setCopiedError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchInput]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApiFetch(`/api/admin/ai-usage?days=${days}`);
        if (!res.ok) throw new Error("AI 사용량을 불러오는데 실패했습니다.");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [days]);

  useEffect(() => {
    const fetchList = async () => {
      setListLoading(true);
      try {
        const params = new URLSearchParams({
          page: listPage.toString(),
          limit: "20",
        });
        if (modelFilter) params.append("model", modelFilter);
        if (requestTypeFilter) params.append("requestType", requestTypeFilter);
        if (debouncedUserSearch) params.append("search", debouncedUserSearch);
        const res = await adminApiFetch(`/api/admin/ai-usage/list?${params}`);
        if (!res.ok) throw new Error("목록을 불러오는데 실패했습니다.");
        const data = await res.json();
        setList(data.details || []);
        setListPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } catch {
        setList([]);
      } finally {
        setListLoading(false);
      }
    };
    fetchList();
  }, [listPage, modelFilter, requestTypeFilter, debouncedUserSearch]);

  if (loading && !stats) {
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

  const s = stats!;
  const usedModels = s.by_model.map((x) => x.model);
  const modelOptions = [
    { value: "", label: "전체 모델" },
    ...GEMINI_MODELS.filter((m) => usedModels.includes(m)).map((m) => ({
      value: m,
      label: m.replace("gemini-", "Gemini "),
    })),
  ];
  if (modelOptions.length === 1) {
    modelOptions.push(
      { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash-Lite Preview" },
      { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" }
    );
  }

  const requestTypeOptions = [
    { value: "", label: "전체 타입" },
    ...Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const selectedParsedError = parseErrorDetails(selectedErrorRow?.error_message);
  const selectedRawError = selectedErrorRow?.error_message || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            AI 사용량
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Gemini 3.0 기준 요청·비용을 확인하세요.
          </p>
        </div>
        <AdminSelect
          value={days.toString()}
          onChange={(e) => setDays(parseInt(e.target.value, 10))}
          options={[
            { value: "7", label: "최근 7일" },
            { value: "30", label: "최근 30일" },
            { value: "90", label: "최근 90일" },
          ]}
          containerClassName="w-40"
        />
      </div>

      {/* 요약 카드: 오늘 / 이번 달 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-5"
          style={{
            ...CARD_STYLES.default,
            borderLeft: `4px solid ${COLORS.brand.primary}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              오늘 요청
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {s.today?.requests?.toLocaleString() ?? 0}회
          </p>
          <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
            ₩{Math.round(s.today?.cost_krw ?? 0).toLocaleString()}
          </p>
        </div>
        <div
          className="rounded-xl p-5"
          style={{
            ...CARD_STYLES.default,
            borderLeft: `4px solid ${COLORS.brand.secondary}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" style={{ color: COLORS.brand.secondary }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              이번 달 요청
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {s.thisMonth?.requests?.toLocaleString() ?? 0}회
          </p>
          <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
            ₩{Math.round(s.thisMonth?.cost_krw ?? 0).toLocaleString()}
          </p>
        </div>
        <div
          className="rounded-xl p-5"
          style={CARD_STYLES.default}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              기간 총 비용
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ₩{Math.round(s.total_cost_krw).toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
            ${s.total_cost_usd.toFixed(2)} · {s.total_requests.toLocaleString()}회
          </p>
        </div>
        <div
          className="rounded-xl p-5"
          style={CARD_STYLES.default}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              총 토큰
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {s.total_tokens.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 비용 시각화 */}
      {s.daily_trend.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={CARD_STYLES.default}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            일별 비용 추이
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.light} />
              <XAxis
                dataKey="date"
                tick={{ fill: COLORS.text.secondary, fontSize: 11 }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
                }
              />
              <YAxis
                tick={{ fill: COLORS.text.secondary, fontSize: 11 }}
                tickFormatter={(v) => `₩${Math.round(v).toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.border.light}`,
                  borderRadius: "8px",
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString("ko-KR")}
                formatter={(value: number | undefined) => [`₩${Math.round(value ?? 0).toLocaleString()}`, "비용"]}
              />
              <Bar
                dataKey="cost_krw"
                fill={COLORS.brand.primary}
                radius={[4, 4, 0, 0]}
                name="비용"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 모델별 요금 */}
      {s.by_model.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={CARD_STYLES.default}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            모델별 사용량 (Gemini 3.0 포함)
          </h3>
          <div className="space-y-3">
            {s.by_model.map((m) => (
              <div
                key={m.model}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              >
                <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                  {m.model.replace("gemini-", "Gemini ")}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span style={{ color: COLORS.text.secondary }}>{m.requests}회</span>
                  <span style={{ color: COLORS.text.tertiary }}>
                    {(m.tokens ?? 0).toLocaleString()} 토큰
                  </span>
                  <span className="font-semibold" style={{ color: COLORS.brand.primary }}>
                    ₩{Math.round(m.cost_krw).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 요청 리스트 */}
      <div
        className="rounded-xl p-6"
        style={CARD_STYLES.default}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
              전체 요청 리스트
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              className="relative w-full sm:w-64"
              style={{ minWidth: "220px" }}
            >
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: COLORS.text.tertiary }}
              />
              <input
                type="text"
                value={userSearchInput}
                onChange={(e) => {
                  setUserSearchInput(e.target.value);
                  setListPage(1);
                }}
                placeholder="사용자 이름/이메일 검색"
                className="w-full h-10 pl-9 pr-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${COLORS.border.light}`,
                  color: COLORS.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.brand.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border.light;
                }}
              />
            </div>
            <AdminSelect
              value={requestTypeFilter}
              onChange={(e) => {
                setRequestTypeFilter(e.target.value);
                setListPage(1);
              }}
              options={requestTypeOptions}
              containerClassName="w-40"
            />
            <AdminSelect
              value={modelFilter}
              onChange={(e) => {
                setModelFilter(e.target.value);
                setListPage(1);
              }}
              options={modelOptions}
              containerClassName="w-48"
            />
          </div>
        </div>

        {listLoading ? (
          <div className="text-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
              style={{ borderColor: COLORS.brand.primary }}
            />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.text.tertiary }}>요청 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      backgroundColor: COLORS.background.hover,
                      borderBottom: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: COLORS.text.primary }}>
                      날짜
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: COLORS.text.primary }}>
                      사용자
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: COLORS.text.primary }}>
                      모델
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: COLORS.text.primary }}>
                      타입
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: COLORS.text.primary }}>
                      상태
                    </th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: COLORS.text.primary }}>
                      토큰
                    </th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: COLORS.text.primary }}>
                      비용
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
                      onClick={() => {
                        if (row.user_id) router.push(`/admin/users/${row.user_id}`);
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: COLORS.text.secondary }}>
                        {new Date(row.created_at).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium block" style={{ color: COLORS.text.primary }}>
                            {row.user_name || "알 수 없음"}
                          </span>
                          <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                            {row.user_email || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: COLORS.text.primary }}>
                        {row.model.replace("gemini-", "Gemini ")}
                      </td>
                      <td className="px-4 py-3" style={{ color: COLORS.text.secondary }}>
                        {REQUEST_TYPE_LABELS[row.request_type] || row.request_type}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!row.success) {
                              setSelectedErrorRow(row);
                              setCopiedError(false);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: row.success
                              ? `${COLORS.status.success}22`
                              : `${COLORS.status.error}22`,
                            color: row.success
                              ? COLORS.status.success
                              : COLORS.status.error,
                            cursor: row.success ? "default" : "pointer",
                          }}
                          disabled={row.success}
                          title={row.success ? "성공" : "실패 상세 보기"}
                        >
                          {row.success ? "성공" : "실패"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: COLORS.text.primary }}>
                        {row.total_tokens?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: COLORS.brand.primary }}>
                        ₩{Math.round(row.cost_krw).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {listPagination.totalPages > 1 && (
              <div
                className="flex items-center justify-center gap-2 pt-4 mt-4 border-t"
                style={{ borderColor: COLORS.border.light }}
              >
                <button
                  type="button"
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  disabled={listPage === 1}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    color: COLORS.text.primary,
                  }}
                >
                  이전
                </button>
                <span className="px-4 text-sm" style={{ color: COLORS.text.secondary }}>
                  {listPage} / {listPagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setListPage((p) => Math.min(listPagination.totalPages, p + 1))
                  }
                  disabled={listPage === listPagination.totalPages}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    color: COLORS.text.primary,
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedErrorRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          onClick={() => setSelectedErrorRow(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl p-5 max-h-[85vh] overflow-hidden"
            style={CARD_STYLES.default}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                  실패 상세 정보
                </h4>
                <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
                  요청 ID: {selectedErrorRow.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedErrorRow(null)}
                className="p-2 rounded-lg"
                style={{ color: COLORS.text.tertiary, backgroundColor: COLORS.background.hover }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh] pr-1 space-y-4">
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.secondary }}
              >
                <div>사용자: {selectedErrorRow.user_name || "알 수 없음"} ({selectedErrorRow.user_email || "-"})</div>
                <div>생성 시각: {new Date(selectedErrorRow.created_at).toLocaleString("ko-KR")}</div>
                <div>타입: {REQUEST_TYPE_LABELS[selectedErrorRow.request_type] || selectedErrorRow.request_type}</div>
                <div>모델: {selectedErrorRow.model}</div>
              </div>

              {selectedParsedError ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div style={{ color: COLORS.text.secondary }}>flow: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.flow || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>reason_code: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.reason_code || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>failed_step: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.failed_step || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>status: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.status || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>error.status: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.error?.status ?? "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>error.code: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.error?.code || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>period_start: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.period_start || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>period_end: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.period_end || "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>duration_ms: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.duration_ms ?? "-"}</span></div>
                    <div style={{ color: COLORS.text.secondary }}>trace_id: <span style={{ color: COLORS.text.primary }}>{selectedParsedError.trace_id || "-"}</span></div>
                  </div>

                  <div
                    className="rounded-lg p-3 text-sm whitespace-pre-wrap break-words"
                    style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.primary }}
                  >
                    {selectedParsedError.error?.name ? `${selectedParsedError.error.name}: ` : ""}
                    {selectedParsedError.error?.message || "(에러 메시지 없음)"}
                  </div>

                  {Array.isArray(selectedParsedError.stack_top) && selectedParsedError.stack_top.length > 0 && (
                    <div>
                      <p className="text-sm mb-2" style={{ color: COLORS.text.secondary }}>
                        stack_top
                      </p>
                      <pre
                        className="rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words"
                        style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.primary }}
                      >
{selectedParsedError.stack_top.join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-2" style={{ color: COLORS.text.secondary }}>
                    raw error_message
                  </p>
                  <pre
                    className="rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words"
                    style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.primary }}
                  >
{selectedRawError || "(빈 에러 메시지)"}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.border.light}` }}>
              <button
                type="button"
                onClick={async () => {
                  const textToCopy = selectedRawError || JSON.stringify(selectedParsedError || {}, null, 2);
                  try {
                    await navigator.clipboard.writeText(textToCopy);
                    setCopiedError(true);
                    setTimeout(() => setCopiedError(false), 1500);
                  } catch {
                    setCopiedError(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: COLORS.background.hover,
                  color: COLORS.text.primary,
                }}
              >
                <Copy className="w-4 h-4" />
                {copiedError ? "복사됨" : "에러 복사"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedErrorRow(null)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
