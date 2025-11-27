"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

/**
 * 월간 피드백 테스트 패널
 * 개발 환경에서만 표시되며, Daily Feedback과 Monthly Feedback을 생성할 수 있습니다.
 */
interface DailyFeedbackResult {
  message: string;
  data: unknown;
}

interface MonthlyFeedbackResult {
  message: string;
  data: unknown;
}

export function MonthlyFeedbackTestPanel() {
  const [month, setMonth] = useState<string>("2025-11");
  const [dailyResult, setDailyResult] = useState<DailyFeedbackResult | null>(
    null
  );
  const [monthlyResult, setMonthlyResult] =
    useState<MonthlyFeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Daily Feedback 생성 mutation
  const dailyMutation = useMutation({
    mutationFn: async (data: { userId: string; month: string }) => {
      const response = await fetch("/api/test/generate-daily-feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || result.details || "Daily feedback 생성 실패"
        );
      }
      return result;
    },
    onSuccess: (data) => {
      setDailyResult(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setDailyResult(null);
    },
  });

  // Monthly Feedback 생성 mutation
  const monthlyMutation = useMutation({
    mutationFn: async (data: { userId: string; month: string }) => {
      const response = await fetch("/api/test/generate-monthly-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || result.details || "Monthly feedback 생성 실패"
        );
      }
      return result;
    },
    onSuccess: (data) => {
      setMonthlyResult(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setMonthlyResult(null);
    },
  });

  const handleGenerateDaily = async () => {
    const userId =
      localStorage.getItem("userId") || prompt("User ID를 입력하세요:");
    if (!userId) {
      alert("User ID가 필요합니다.");
      return;
    }
    dailyMutation.mutate({ userId, month });
  };

  const handleGenerateMonthly = async () => {
    const userId =
      localStorage.getItem("userId") || prompt("User ID를 입력하세요:");
    if (!userId) {
      alert("User ID가 필요합니다.");
      return;
    }
    monthlyMutation.mutate({ userId, month });
  };

  // 프로덕션 환경에서는 절대 표시하지 않음
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      className="mb-6 p-4 rounded-lg"
      style={{
        backgroundColor: "#FEF2F2",
        border: "1px solid #DC2626",
      }}
    >
      <div className="mb-4">
        <h3
          className="mb-2"
          style={{
            color: "#991B1B",
            fontSize: "0.95rem",
            fontWeight: "600",
          }}
        >
          🧪 월간 피드백 테스트 도구 (개발 환경 전용)
        </h3>
        <p
          style={{
            color: "#7F1D1D",
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "12px",
          }}
        >
          테스트용 Daily Feedback과 Monthly Feedback을 생성할 수 있습니다.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <label
            htmlFor="test-month"
            style={{
              color: "#7F1D1D",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            월 선택:
          </label>
          <input
            id="test-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 rounded border"
            style={{
              borderColor: "#DC2626",
              fontSize: "0.85rem",
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDaily}
            disabled={dailyMutation.isPending}
            className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
            style={{
              backgroundColor: dailyMutation.isPending ? "#9CA3AF" : "#DC2626",
            }}
          >
            {dailyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              "1단계: Daily Feedback 생성"
            )}
          </button>
          <button
            onClick={handleGenerateMonthly}
            disabled={monthlyMutation.isPending}
            className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
            style={{
              backgroundColor: monthlyMutation.isPending
                ? "#9CA3AF"
                : "#DC2626",
            }}
          >
            {monthlyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              "2단계: Monthly Feedback 생성"
            )}
          </button>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg flex items-start gap-2"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #DC2626" }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "#DC2626" }}
          />
          <div className="flex-1">
            <p
              className="mb-1"
              style={{
                color: "#991B1B",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              오류 발생
            </p>
            <p
              className={TYPOGRAPHY.bodySmall.fontSize}
              style={{ color: "#991B1B" }}
            >
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Daily 결과 표시 */}
      {dailyResult && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #10B981" }}
        >
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "#10B981" }}
            />
            <div className="flex-1">
              <p
                className="mb-1"
                style={{
                  color: "#065F46",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Daily Feedback 생성 완료
              </p>
              <p
                className={TYPOGRAPHY.bodySmall.fontSize}
                style={{ color: "#065F46" }}
              >
                성공: {dailyResult.successCount}개 / 전체:{" "}
                {dailyResult.totalDays}일
                {dailyResult.errorCount > 0 &&
                  ` / 실패: ${dailyResult.errorCount}개`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly 결과 표시 */}
      {monthlyResult && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #10B981" }}
        >
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "#10B981" }}
            />
            <div className="flex-1">
              <p
                className="mb-1"
                style={{
                  color: "#065F46",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Monthly Feedback 생성 완료
              </p>
              <p
                className={TYPOGRAPHY.bodySmall.fontSize}
                style={{ color: "#065F46" }}
              >
                ID: {monthlyResult.data?.id}
                <br />
                월: {monthlyResult.data?.month}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
