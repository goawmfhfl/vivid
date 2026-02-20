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
import { adminApiFetch } from "@/lib/admin-api-client";
import { Database, Play, TestTube } from "lucide-react";

type MigrationResult = {
  message?: string;
  stats?: {
    processed: number;
    created: number;
    skipped: number;
    errors: number;
  };
  errors?: Array<{ user_id: string; report_date: string; error: string }>;
};

export default function MigrationExecutionScorePage() {
  const [userId, setUserId] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [batchSize, setBatchSize] = useState("200");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (isDryRun: boolean) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await adminApiFetch(
        "/api/admin/migration/execution-score",
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId.trim() || undefined,
            dryRun: isDryRun,
            batchSize: Math.min(Math.max(parseInt(batchSize, 10) || 100, 1), 500),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "요청에 실패했습니다.");
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
          실행력 점수 마이그레이션
        </h1>
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary }}
        >
          type=vivid 레거시 report에 있는 execution_score를 type=review 행으로
          옮깁니다. 해당 날짜에 review가 없으면 새로 생성합니다.
        </p>
      </div>

      <div
        className={cn(
          "space-y-4",
          SPACING.card.padding,
          SPACING.card.borderRadius
        )}
        style={{ ...CARD_STYLES.default }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Database
            className="w-5 h-5"
            style={{ color: COLORS.brand.primary }}
          />
          <h2
            className={cn(
              TYPOGRAPHY.h3.fontSize,
              TYPOGRAPHY.h3.fontWeight
            )}
            style={{ color: COLORS.text.primary }}
          >
            옵션
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight
              )}
              style={{ color: COLORS.text.primary }}
            >
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
              placeholder="비워두면 전체 유저 대상"
            />
          </div>

          <div className="space-y-2">
            <label
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight
              )}
              style={{ color: COLORS.text.primary }}
            >
              batchSize
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{
                border: `1px solid ${COLORS.border.input}`,
                backgroundColor: COLORS.background.cardElevated,
                color: COLORS.text.primary,
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleRun(true)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              BUTTON_STYLES.secondary.borderRadius,
              BUTTON_STYLES.secondary.padding
            )}
            style={{
              backgroundColor: COLORS.background.hover,
              border: `1px solid ${COLORS.border.light}`,
              color: COLORS.text.primary,
            }}
          >
            <TestTube className="w-4 h-4" />
            {isLoading ? "실행 중..." : "Dry Run (미리보기)"}
          </button>
          <button
            type="button"
            onClick={() => handleRun(false)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              BUTTON_STYLES.primary.borderRadius,
              BUTTON_STYLES.primary.padding
            )}
            style={{
              backgroundColor: COLORS.status.error,
              color: COLORS.text.white,
            }}
          >
            <Play className="w-4 h-4" />
            {isLoading ? "실행 중..." : "실제 적용"}
          </button>
        </div>

        <p
          className={cn(TYPOGRAPHY.caption.fontSize)}
          style={{ color: COLORS.text.muted }}
        >
          Dry Run은 DB를 변경하지 않고 생성될 행 수만 확인합니다. 실제 적용 전
          반드시 Dry Run으로 먼저 확인하세요.
        </p>
      </div>

      {error && (
        <div
          className={cn("px-4 py-3 rounded-lg", SPACING.card.borderRadius)}
          style={{
            backgroundColor: COLORS.status.errorLight,
            color: COLORS.status.error,
            border: `1px solid ${COLORS.status.error}40`,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          className={cn(
            "space-y-3",
            SPACING.card.padding,
            SPACING.card.borderRadius
          )}
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
          {result.message && (
            <p
              className={cn(TYPOGRAPHY.body.fontSize)}
              style={{ color: COLORS.text.primary }}
            >
              {result.message}
            </p>
          )}
          {result.stats && (
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3"
              style={{
                borderTop: `1px solid ${COLORS.border.light}`,
                borderBottom: `1px solid ${COLORS.border.light}`,
              }}
            >
              <div>
                <p
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.muted }}
                >
                  처리 대상
                </p>
                <p
                  className={cn(TYPOGRAPHY.h4.fontSize)}
                  style={{ color: COLORS.text.primary }}
                >
                  {result.stats.processed}
                </p>
              </div>
              <div>
                <p
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.muted }}
                >
                  생성
                </p>
                <p
                  className={cn(TYPOGRAPHY.h4.fontSize)}
                  style={{ color: COLORS.status.success }}
                >
                  {result.stats.created}
                </p>
              </div>
              <div>
                <p
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.muted }}
                >
                  스킵 (이미 있음)
                </p>
                <p
                  className={cn(TYPOGRAPHY.h4.fontSize)}
                  style={{ color: COLORS.text.secondary }}
                >
                  {result.stats.skipped}
                </p>
              </div>
              <div>
                <p
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.muted }}
                >
                  에러
                </p>
                <p
                  className={cn(TYPOGRAPHY.h4.fontSize)}
                  style={{
                    color:
                      (result.stats.errors ?? 0) > 0
                        ? COLORS.status.error
                        : COLORS.text.primary,
                  }}
                >
                  {result.stats.errors}
                </p>
              </div>
            </div>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-2">
              <p
                className={cn(TYPOGRAPHY.label.fontSize)}
                style={{ color: COLORS.text.secondary }}
              >
                에러 상세
              </p>
              <pre
                className="text-xs whitespace-pre-wrap p-3 rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${COLORS.border.light}`,
                  color: COLORS.text.secondary,
                }}
              >
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
