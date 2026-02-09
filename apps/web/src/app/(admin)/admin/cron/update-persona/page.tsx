"use client";

import { useState } from "react";
import {
  BUTTON_STYLES,
  CARD_STYLES,
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

type CronResult = Record<string, unknown>;

export default function UpdatePersonaCronTestPage() {
  const [cronSecret, setCronSecret] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("25");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CronResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (baseDate.trim()) params.set("baseDate", baseDate.trim());
      if (userId.trim()) params.set("userId", userId.trim());
      if (page.trim()) params.set("page", page.trim());
      if (limit.trim()) params.set("limit", limit.trim());

      const response = await fetch(
        `/api/cron/update-persona?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${cronSecret}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "요청에 실패했습니다.";
        throw new Error(message);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", SPACING.page.maxWidth)}>
      <div className="space-y-2">
        <h1
          className={cn(
            TYPOGRAPHY.h2.fontSize,
            TYPOGRAPHY.h2.fontWeight,
            TYPOGRAPHY.h2.lineHeight
          )}
          style={{ color: TYPOGRAPHY.h2.color }}
        >
          크론 테스트: User Persona 업데이트
        </h1>
        <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
          원하는 날짜/유저 기준으로 크론을 수동 실행할 수 있습니다. 내 계정만 실행하려면 userId에 본인 계정의 userId를 입력하세요.
        </p>
      </div>

      <div
        className={cn("space-y-4", SPACING.card.padding, SPACING.card.borderRadius)}
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <div className="space-y-2">
          <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
            CRON_SECRET
          </label>
          <input
            type="password"
            value={cronSecret}
            onChange={(event) => setCronSecret(event.target.value)}
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
              type="text"
              value={baseDate}
              onChange={(event) => setBaseDate(event.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{
                border: `1px solid ${COLORS.border.input}`,
                backgroundColor: COLORS.background.cardElevated,
                color: COLORS.text.primary,
              }}
              placeholder="예: 2026-02-08"
            />
          </div>

          <div className="space-y-2">
            <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
              userId (옵션)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
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
            <label className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}>
              page
            </label>
            <input
              type="number"
              min="1"
              value={page}
              onChange={(event) => setPage(event.target.value)}
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
              limit
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
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
          <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.muted }}>
            baseDate 미입력 시 오늘(KST)을 기준으로 7일 계산합니다.
          </p>
        </div>
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
          <h2
            className={cn(
              TYPOGRAPHY.h3.fontSize,
              TYPOGRAPHY.h3.fontWeight,
              TYPOGRAPHY.h3.lineHeight
            )}
            style={{ color: TYPOGRAPHY.h3.color }}
          >
            실행 결과
          </h2>
          <pre
            className="text-xs whitespace-pre-wrap"
            style={{ color: COLORS.text.secondary }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
