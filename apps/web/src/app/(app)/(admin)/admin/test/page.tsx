"use client";

import { useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import {
  BUTTON_STYLES,
  CARD_STYLES,
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { TestTube, CreditCard } from "lucide-react";

type CronResult = Record<string, unknown>;

const SUBSCRIPTION_EVENT_TYPES = [
  "TEST",
  "INITIAL_PURCHASE",
  "RENEWAL",
  "CANCELLATION",
  "EXPIRATION",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
  "BILLING_ISSUE",
] as const;

const EVENT_TYPE_GUIDES: Record<(typeof SUBSCRIPTION_EVENT_TYPES)[number], string> = {
  TEST:
    "RevenueCat과의 연결 상태를 확인할 때 사용합니다. Edge Function은 200을 반환하며 DB에는 변경이 없습니다. 연결 테스트용으로 활용하세요.",
  INITIAL_PURCHASE:
    "사용자가 처음 구독을 시작할 때 발생합니다. plan=pro, status=active로 설정되고 started_at/expires_at가 초기화됩니다. Pro가 활성화됩니다.",
  RENEWAL:
    "기존 구독이 갱신될 때 발생합니다. plan=pro, status=active를 유지하면서 dates를 갱신합니다. Pro 기간이 연장됩니다.",
  CANCELLATION:
    "만료일 이전에 사용자가 구독을 취소할 때 발생합니다. status=canceled로 변경되지만 기존 dates는 유지됩니다. 만료 전까지 Pro 멤버십이 유지됩니다.",
  EXPIRATION:
    "구독 기간이 완전히 만료되었을 때 발생합니다. status=expired로 설정되며 Pro 기능 접근 권한이 상실됩니다.",
  UNCANCELLATION:
    "이전에 취소된 구독을 사용자가 다시 활성화할 때 발생합니다. plan=pro, status=active로 복구되어 Pro가 다시 활성화됩니다.",
  SUBSCRIPTION_EXTENDED:
    "구독 기간이 연장될 때 발생합니다. plan=pro, status=active를 유지하며 dates를 갱신합니다. Pro 기간이 추가로 연장됩니다.",
  BILLING_ISSUE:
    "결제 실패가 발생했지만 구독이 아직 유효할 때(예: 유예 기간) 발생합니다. 로그만 기록하고 DB에는 변경이 없습니다. 결제 정보 업데이트를 요청해야 할 수 있습니다.",
};

export default function AdminTestPage() {
  const [activeTab, setActiveTab] = useState<"cron" | "subscription">("cron");
  const [cronSecret, setCronSecret] = useState(
    () => process.env.NEXT_PUBLIC_CRON_SECRET ?? ""
  );
  const [baseDate, setBaseDate] = useState("");
  const [userId, setUserId] = useState("1bebb0d4-9908-4e98-817b-06e19331cd0f");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("25");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CronResult | null>(null);
  const [trendsResult, setTrendsResult] = useState<CronResult | null>(null);
  const [trendsMonthlyResult, setTrendsMonthlyResult] = useState<CronResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [trendsMonthlyError, setTrendsMonthlyError] = useState<string | null>(null);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [isTrendsMonthlyLoading, setIsTrendsMonthlyLoading] = useState(false);
  const [runSync, setRunSync] = useState(true);

  // User Persona 조회 상태
  const [personaResult, setPersonaResult] = useState<Record<string, unknown> | null>(null);
  const [isPersonaLoading, setIsPersonaLoading] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);

  // 구독 테스트 상태
  const [subscriptionUserId, setSubscriptionUserId] = useState("");
  const [subscriptionEventType, setSubscriptionEventType] = useState<string>("TEST");
  const [subscriptionPlanType, setSubscriptionPlanType] = useState<"monthly" | "annual">("annual");
  const [webhookAutoRefresh, setWebhookAutoRefresh] = useState(true);
  const [webhookResult, setWebhookResult] = useState<Record<string, unknown> | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Record<string, unknown> | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [subscriptionFetchError, setSubscriptionFetchError] = useState<string | null>(null);

  const EVENTS_WITH_PLAN =
    ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "SUBSCRIPTION_EXTENDED", "EXPIRATION"] as const;
  const showPlanTypeSelector = EVENTS_WITH_PLAN.includes(
    subscriptionEventType as (typeof EVENTS_WITH_PLAN)[number]
  );

  const executeCron = async (
    path: string,
    options?: { sync?: boolean; type?: "weekly" | "monthly" }
  ) => {
    const params = new URLSearchParams();
    if (baseDate.trim()) params.set("baseDate", baseDate.trim());
    if (userId.trim()) params.set("userId", userId.trim());
    if (page.trim()) params.set("page", page.trim());
    if (limit.trim()) params.set("limit", limit.trim());
    if (options?.sync) params.set("sync", "1");

    const query = params.toString();
    const fullUrl = query ? `${path}?${query}` : path;

    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(typeof data?.error === "string" ? data.error : "요청에 실패했습니다.");
    }
    return data as CronResult;
  };

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await executeCron("/api/cron/update-persona", {
        sync: runSync,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunUserTrendsWeekly = async () => {
    setIsTrendsLoading(true);
    setTrendsError(null);
    setTrendsResult(null);
    try {
      const data = await executeCron("/api/cron/update-user-trends/weekly", {
        sync: runSync && userId.trim().length > 0,
      });
      setTrendsResult(data);
    } catch (err) {
      setTrendsError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsTrendsLoading(false);
    }
  };

  const handleRunUserTrendsMonthly = async () => {
    setIsTrendsMonthlyLoading(true);
    setTrendsMonthlyError(null);
    setTrendsMonthlyResult(null);
    try {
      const data = await executeCron("/api/cron/update-user-trends/monthly", {
        sync: runSync && userId.trim().length > 0,
      });
      setTrendsMonthlyResult(data);
    } catch (err) {
      setTrendsMonthlyError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsTrendsMonthlyLoading(false);
    }
  };

  const handleFetchPersona = async () => {
    if (!userId.trim()) {
      setPersonaError("userId를 입력해주세요.");
      return;
    }
    setIsPersonaLoading(true);
    setPersonaError(null);
    setPersonaResult(null);
    try {
      const response = await adminApiFetch(`/api/admin/user-persona/${userId.trim()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to fetch user persona");
      }
      setPersonaResult(data);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsPersonaLoading(false);
    }
  };

  const handleWebhookTest = async () => {
    if (subscriptionEventType !== "TEST" && !subscriptionUserId.trim()) {
      setWebhookError("TEST 외 이벤트는 userId가 필요합니다.");
      return;
    }
    setIsWebhookLoading(true);
    setWebhookError(null);
    setWebhookResult(null);
    try {
      const body: Record<string, unknown> = {
        eventType: subscriptionEventType,
        userId: subscriptionUserId.trim() || undefined,
      };
      if (showPlanTypeSelector) {
        body.planType = subscriptionPlanType;
      }

      const res = await adminApiFetch("/api/admin/webhook-subscription-test", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "웹훅 전송 실패");
      }
      setWebhookResult(data);

      if (webhookAutoRefresh && data.success && subscriptionUserId.trim()) {
        setTimeout(() => handleFetchUserSubscription(), 800);
      }
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsWebhookLoading(false);
    }
  };

  const handleFetchUserSubscription = async () => {
    if (!subscriptionUserId.trim()) {
      setSubscriptionFetchError("userId를 입력해주세요.");
      return;
    }
    setIsSubscriptionLoading(true);
    setSubscriptionFetchError(null);
    setUserSubscription(null);
    try {
      const res = await adminApiFetch(`/api/admin/users/${subscriptionUserId.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "유저 조회 실패");
      }
      setUserSubscription(data);
    } catch (err) {
      setSubscriptionFetchError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1
          className={cn(
            TYPOGRAPHY.h2.fontSize,
            TYPOGRAPHY.h2.fontWeight,
            TYPOGRAPHY.h2.lineHeight
          )}
          style={{ color: TYPOGRAPHY.h2.color }}
        >
          테스트
        </h1>
        <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
          관리자용 테스트 도구입니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div
        className="flex gap-2 pb-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("cron")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === "cron" ? "font-semibold" : ""
          )}
          style={{
            backgroundColor: activeTab === "cron" ? COLORS.brand.light + "30" : "transparent",
            color: activeTab === "cron" ? COLORS.brand.primary : COLORS.text.secondary,
          }}
        >
          <TestTube className="w-4 h-4" />
          크론 테스트
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === "subscription" ? "font-semibold" : ""
          )}
          style={{
            backgroundColor: activeTab === "subscription" ? COLORS.brand.light + "30" : "transparent",
            color: activeTab === "subscription" ? COLORS.brand.primary : COLORS.text.secondary,
          }}
        >
          <CreditCard className="w-4 h-4" />
          구독 테스트
        </button>
      </div>

      {/* 구독 테스트 콘텐츠 */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              RevenueCat 웹훅 시뮬레이션
            </h2>
            <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
              Edge Function으로 테스트 페이로드를 전송하여 구독 웹훅 동작을 확인합니다.
              .env.local에 REVENUECAT_WEBHOOK_AUTH가 설정되어 있어야 합니다.
            </p>
          </div>

          <div
            className={cn("space-y-4", SPACING.card.padding, SPACING.card.borderRadius)}
            style={{ ...CARD_STYLES.default }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                  이벤트 타입
                </label>
                <select
                  value={subscriptionEventType}
                  onChange={(e) => setSubscriptionEventType(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                >
                  {SUBSCRIPTION_EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                  userId (Supabase User ID)
                </label>
                <input
                  type="text"
                  value={subscriptionUserId}
                  onChange={(e) => setSubscriptionUserId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                  placeholder="TEST 이벤트는 비워두고, 그 외에는 유저 UUID 입력"
                />
              </div>
              {showPlanTypeSelector && (
                <div className="space-y-2 sm:col-span-2">
                  <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                    구독 기간 (월간/연간)
                  </label>
                  <select
                    value={subscriptionPlanType}
                    onChange={(e) =>
                      setSubscriptionPlanType(e.target.value as "monthly" | "annual")
                    }
                    className="w-full max-w-xs rounded-lg px-3 py-2 text-sm"
                    style={{
                      border: `1px solid ${COLORS.border.input}`,
                      backgroundColor: COLORS.background.cardElevated,
                      color: COLORS.text.primary,
                    }}
                  >
                    <option value="monthly">월간 (1개월)</option>
                    <option value="annual">연간 (1년)</option>
                  </select>
                  <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
                    expires_at 계산: 월간 +30일, 연간 +365일. product_id도 함께 전송됩니다.
                  </p>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={webhookAutoRefresh}
                onChange={(e) => setWebhookAutoRefresh(e.target.checked)}
              />
              <span className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.secondary }}>
                웹훅 전송 성공 시 유저 구독 정보 자동 조회
              </span>
            </label>

            <div
              className={cn("rounded-lg px-4 py-3", SPACING.card.borderRadius)}
              style={{
                backgroundColor: COLORS.accent[50],
                border: `1px solid ${COLORS.accent[200]}`,
              }}
            >
              <p
                className={cn(TYPOGRAPHY.caption.fontSize, "font-medium mb-1")}
                style={{ color: COLORS.accent[700] }}
              >
                {subscriptionEventType} 가이드
              </p>
              <p
                className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                style={{ color: COLORS.text.primary }}
              >
                {EVENT_TYPE_GUIDES[subscriptionEventType as (typeof SUBSCRIPTION_EVENT_TYPES)[number]]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleWebhookTest}
                disabled={isWebhookLoading}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.primary.borderRadius,
                  BUTTON_STYLES.primary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.primary.background,
                  color: BUTTON_STYLES.primary.color,
                }}
              >
                {isWebhookLoading ? "전송 중..." : "웹훅 전송"}
              </button>
              <button
                type="button"
                onClick={handleFetchUserSubscription}
                disabled={isSubscriptionLoading || !subscriptionUserId.trim()}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.secondary.borderRadius,
                  BUTTON_STYLES.secondary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.secondary.background,
                  color: BUTTON_STYLES.secondary.color,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                {isSubscriptionLoading ? "조회 중..." : "유저 구독 정보 조회"}
              </button>
            </div>

            {webhookError && (
              <div
                className={cn("px-4 py-3 rounded-lg space-y-1", SPACING.card.borderRadius)}
                style={{ backgroundColor: COLORS.status.errorLight, color: COLORS.text.white }}
              >
                <p>{webhookError}</p>
                <p className={cn(TYPOGRAPHY.caption.fontSize, "opacity-90")}>
                  Edge Function 배포 여부, REVENUECAT_WEBHOOK_AUTH가 .env.local과 Supabase 시크릿에 동일하게 설정되었는지 확인하세요.
                </p>
              </div>
            )}

            {webhookResult && (
              <div
                className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
                style={{
                  ...CARD_STYLES.default,
                  borderLeft: `4px solid ${webhookResult.success ? COLORS.status.success : COLORS.status.error}`,
                }}
              >
                <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                  웹훅 전송 결과 {webhookResult.success ? "✓" : "✗"}
                </h3>
                <pre className="text-xs whitespace-pre-wrap overflow-x-auto" style={{ color: COLORS.text.secondary }}>
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>
            )}

            {subscriptionFetchError && (
              <div
                className={cn("px-4 py-3 rounded-lg", SPACING.card.borderRadius)}
                style={{ backgroundColor: COLORS.status.errorLight, color: COLORS.text.white }}
              >
                {subscriptionFetchError}
              </div>
            )}

            {userSubscription && (
              <div
                className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
                style={{ ...CARD_STYLES.default }}
              >
                <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                  유저 구독 정보 ({subscriptionUserId})
                </h3>
                <div className="space-y-1">
                  {userSubscription.subscription ? (
                    <div
                      className={cn("rounded-lg px-3 py-2")}
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
                        plan / status / started_at / expires_at
                      </p>
                      <p className={cn(TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.primary }}>
                        {(userSubscription.subscription as Record<string, unknown>).plan as string} /{" "}
                        {(userSubscription.subscription as Record<string, unknown>).status as string} /{" "}
                        {(userSubscription.subscription as Record<string, unknown>).started_at as string ?? "-"} /{" "}
                        {(userSubscription.subscription as Record<string, unknown>).expires_at as string ?? "-"}
                      </p>
                    </div>
                  ) : (
                    <p className={cn(TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.muted }}>
                      구독 정보 없음
                    </p>
                  )}
                </div>
                <details className="mt-2">
                  <summary className={cn(TYPOGRAPHY.caption.fontSize, "cursor-pointer")} style={{ color: COLORS.text.muted }}>
                    전체 응답 보기
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap overflow-x-auto" style={{ color: COLORS.text.secondary }}>
                    {JSON.stringify(userSubscription, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 크론 테스트 콘텐츠 */}
      {activeTab === "cron" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              크론 테스트: User Persona 업데이트
            </h2>
            <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
              원하는 날짜/유저 기준으로 크론을 수동 실행할 수 있습니다. 내 계정만 실행하려면 userId에 본인 계정의 userId를 입력하세요.
            </p>
          </div>

          <div
            className={cn("space-y-4", SPACING.card.padding, SPACING.card.borderRadius)}
            style={{ ...CARD_STYLES.default }}
          >
            <div className="space-y-2">
              <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                CRON_SECRET
              </label>
              <input
                type="password"
                value={cronSecret}
                onChange={(e) => setCronSecret(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  border: `1px solid ${COLORS.border.input}`,
                  backgroundColor: COLORS.background.cardElevated,
                  color: COLORS.text.primary,
                }}
                placeholder="Bearer 토큰 문자열"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                  baseDate (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
                  userId (옵션)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                  placeholder="내 계정만 테스트 시 본인 userId 입력"
                />
                <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
                  비워두면 Pro 전체 유저 대상. 특정 유저만 실행하려면 해당 유저의 userId를 입력하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>page</label>
                <input
                  type="number"
                  min="1"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>limit</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: `1px solid ${COLORS.border.input}`,
                    backgroundColor: COLORS.background.cardElevated,
                    color: COLORS.text.primary,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRun}
                disabled={isLoading || !cronSecret.trim()}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.primary.borderRadius,
                  BUTTON_STYLES.primary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.primary.background,
                  color: BUTTON_STYLES.primary.color,
                }}
              >
                {isLoading ? "실행 중..." : "크론 실행"}
              </button>
              <button
                type="button"
                onClick={handleFetchPersona}
                disabled={isPersonaLoading || !userId.trim()}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.secondary.borderRadius,
                  BUTTON_STYLES.secondary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.secondary.background,
                  color: BUTTON_STYLES.secondary.color,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                {isPersonaLoading ? "조회 중..." : "Persona 조회"}
              </button>
              <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
                baseDate 미입력 시 오늘(KST)을 기준으로 7일 계산합니다.
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={runSync} onChange={(e) => setRunSync(e.target.checked)} />
              <span className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.secondary }}>
                동기 실행(sync=1): Persona는 현재 서버에서 즉시 실행 (todo_analysis 포함). userId 없어도 전체 유저 배치 동기 실행.
              </span>
            </label>
          </div>

          {error && (
            <div
              className={cn("px-4 py-3 rounded-lg", SPACING.card.borderRadius)}
              style={{ backgroundColor: COLORS.status.errorLight, color: COLORS.text.white }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
              style={{ ...CARD_STYLES.default }}
            >
              <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                실행 결과
              </h3>
              <pre className="text-xs whitespace-pre-wrap" style={{ color: COLORS.text.secondary }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {personaError && (
            <div
              className={cn("px-4 py-3 rounded-lg", SPACING.card.borderRadius)}
              style={{ backgroundColor: COLORS.status.errorLight, color: COLORS.text.white }}
            >
              {personaError}
            </div>
          )}

          {personaResult && (
            <div
              className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
              style={{ ...CARD_STYLES.default }}
            >
              <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                User Persona 조회 결과 ({userId})
              </h3>
              <pre className="text-xs whitespace-pre-wrap" style={{ color: COLORS.text.secondary }}>
                {JSON.stringify(personaResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-y-2 pt-6 border-t" style={{ borderColor: COLORS.border.light }}>
            <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
              크론 테스트: User Trends (주간 / 월간)
            </h3>
            <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
              baseDate/userId/page/limit로 user_trends 크론을 실행합니다.
              주간: 이전 주(월~일) 성장 인사이트. 월간: 이전 달 성장 인사이트. 특정 유저만 테스트하려면 userId를 입력하세요.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRunUserTrendsWeekly}
                disabled={isTrendsLoading || !cronSecret.trim()}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.primary.borderRadius,
                  BUTTON_STYLES.primary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.primary.background,
                  color: BUTTON_STYLES.primary.color,
                }}
              >
                {isTrendsLoading ? "실행 중..." : "Weekly user_trends 실행"}
              </button>
              <button
                type="button"
                onClick={handleRunUserTrendsMonthly}
                disabled={isTrendsMonthlyLoading || !cronSecret.trim()}
                className={cn(
                  "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  BUTTON_STYLES.primary.borderRadius,
                  BUTTON_STYLES.primary.padding
                )}
                style={{
                  backgroundColor: BUTTON_STYLES.primary.background,
                  color: BUTTON_STYLES.primary.color,
                }}
              >
                {isTrendsMonthlyLoading ? "실행 중..." : "Monthly user_trends 실행"}
              </button>
            </div>
          </div>

          {(trendsError || trendsMonthlyError) && (
            <div
              className={cn("px-4 py-3 rounded-lg", SPACING.card.borderRadius)}
              style={{ backgroundColor: COLORS.status.errorLight, color: COLORS.text.white }}
            >
              {trendsError || trendsMonthlyError}
            </div>
          )}

          {trendsResult && (
            <div
              className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
              style={{ ...CARD_STYLES.default }}
            >
              <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                Weekly user_trends 실행 결과
              </h3>
              <pre className="text-xs whitespace-pre-wrap" style={{ color: COLORS.text.secondary }}>
                {JSON.stringify(trendsResult, null, 2)}
              </pre>
            </div>
          )}

          {trendsMonthlyResult && (
            <div
              className={cn("space-y-3", SPACING.card.padding, SPACING.card.borderRadius)}
              style={{ ...CARD_STYLES.default }}
            >
              <h3 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: TYPOGRAPHY.h3.color }}>
                Monthly user_trends 실행 결과
              </h3>
              <pre className="text-xs whitespace-pre-wrap" style={{ color: COLORS.text.secondary }}>
                {JSON.stringify(trendsMonthlyResult, null, 2)}
              </pre>
              {"latest" in trendsMonthlyResult && trendsMonthlyResult.latest ? (
                <div
                  className={cn("rounded-lg px-3 py-2")}
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.secondary }}>
                    trend 생성 체크
                  </p>
                  <p className={cn(TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.primary }}>
                    {(trendsMonthlyResult.latest as Record<string, unknown>).has_trend
                      ? "trend 생성됨"
                      : "trend 미생성"}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
