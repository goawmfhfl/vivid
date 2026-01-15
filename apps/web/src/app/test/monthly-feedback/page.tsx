"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_ENDPOINTS } from "@/constants";
import { decryptDailyFeedback } from "@/lib/jsonb-encryption";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

export default function MonthlyFeedbackTestPage() {
  const { isTest, isDevelopment } = useEnvironment();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [month, setMonth] = useState("2026-01");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);
  const [dailyFeedbacks, setDailyFeedbacks] = useState<DailyFeedbackRow[]>([]);
  const [isLoadingDailyFeedbacks, setIsLoadingDailyFeedbacks] = useState(false);
  const [dailyFeedbackError, setDailyFeedbackError] = useState<string | null>(null);
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);
  const [trendResult, setTrendResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);

  // 일일 피드백 조회 함수 (Supabase에서 직접 월별 필터링)
  const fetchDailyFeedbacks = async () => {
    if (!user?.id || !month) {
      return;
    }

    setIsLoadingDailyFeedbacks(true);
    setDailyFeedbackError(null);

    try {
      // 월의 시작일과 종료일 계산
      const [year, monthNum] = month.split("-").map(Number);
      const endDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날
      
      // YYYY-MM-DD 형식으로 변환 (간단하게)
      const startDateStr = `${year}-${String(monthNum).padStart(2, "0")}-01`;
      const endDateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

      console.log(`[Test Page] Fetching for month: ${month}, date range: ${startDateStr} ~ ${endDateStr}`);

      // Supabase에서 직접 report_date로 월별 필터링
      const { data, error } = await supabase
        .from(API_ENDPOINTS.DAILY_FEEDBACK)
        .select("*")
        .eq("user_id", user.id)
        .gte("report_date", startDateStr)
        .lte("report_date", endDateStr)
        .order("report_date", { ascending: true });

      if (error) {
        console.error("[Test Page] Supabase error:", error);
        throw new Error(`일일 피드백 조회 실패: ${error.message}`);
      }

      console.log(`[Test Page] Found ${data?.length || 0} daily feedbacks`);
      if (data && data.length > 0) {
        console.log(`[Test Page] Report dates:`, data.map(d => d.report_date).join(", "));
      }

      if (!data || data.length === 0) {
        console.log("[Test Page] No data found for this month range");
        setDailyFeedbacks([]);
        return;
      }

      // 복호화 처리
      const decryptedFeedbacks = (data || []).map(
        (item) =>
          decryptDailyFeedback(
            item as unknown as { [key: string]: unknown }
          ) as unknown as DailyFeedbackRow
      );

      setDailyFeedbacks(decryptedFeedbacks);
    } catch (error) {
      console.error("일일 피드백 조회 실패:", error);
      setDailyFeedbackError(
        error instanceof Error ? error.message : "일일 피드백을 불러올 수 없습니다."
      );
      setDailyFeedbacks([]);
    } finally {
      setIsLoadingDailyFeedbacks(false);
    }
  };

  // 월이 변경되면 일일 피드백 자동 조회
  useEffect(() => {
    if (user?.id && month) {
      fetchDailyFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, month]);

  // 개발 환경이나 테스트 환경에서만 접근 가능
  if (!isTest && !isDevelopment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center">
          이 페이지는 개발 환경에서만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!user?.id) {
      setResult({
        success: false,
        message: "사용자 정보를 불러올 수 없습니다.",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/monthly-feedback/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          month,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "월간 피드백 생성에 실패했습니다.");
      }

      setResult({
        success: true,
        message: `월간 피드백이 성공적으로 생성되고 DB에 저장되었습니다! (ID: ${data.data?.id || "N/A"})`,
        data: data.data,
      });
    } catch (error) {
      console.error("월간 피드백 생성 실패:", error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTrend = async () => {
    if (!user?.id) {
      setTrendResult({
        success: false,
        message: "사용자 정보를 불러올 수 없습니다.",
      });
      return;
    }

    setIsGeneratingTrend(true);
    setTrendResult(null);

    try {
      const response = await fetch("/api/monthly-feedback/test-trend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          month,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Trend 생성에 실패했습니다.");
      }

      setTrendResult({
        success: true,
        message: `Trend가 성공적으로 생성되었습니다!`,
        data: data.trend,
      });
    } catch (error) {
      console.error("Trend 생성 실패:", error);
      setTrendResult({
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsGeneratingTrend(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className={cn("mb-2", TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight)}
        style={{ color: COLORS.text.primary }}
      >
        월간 피드백 테스트 생성
      </h1>
      <p
        className={cn("mb-8", TYPOGRAPHY.body.fontSize)}
        style={{ color: COLORS.text.secondary }}
      >
        커스텀 날짜 범위로 월간 피드백을 생성할 수 있는 테스트 페이지입니다.
      </p>

      {userLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLORS.brand.primary }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 사용자 정보 */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: COLORS.surface.elevated,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <h2
              className={cn("mb-2", TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              사용자 정보
            </h2>
            <p
              className={cn(TYPOGRAPHY.body.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              {user ? `ID: ${user.id}` : "사용자 정보를 불러올 수 없습니다."}
            </p>
          </div>

          {/* 날짜 설정 */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: COLORS.surface.elevated,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <h2
              className={cn("mb-4", TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              월 설정
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={cn("block mb-2", TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight)}
                  style={{ color: COLORS.text.primary }}
                >
                  월 (YYYY-MM)
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="2025-01"
                  className="w-full px-3 py-2 rounded-md border"
                  style={{
                    backgroundColor: COLORS.surface.default,
                    borderColor: COLORS.border.light,
                    color: COLORS.text.primary,
                  }}
                />
                <p
                  className={cn("mt-2 text-sm", TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.secondary }}
                >
                  해당 월의 모든 일일 피드백을 조회합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 일일 피드백 조회 섹션 */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: COLORS.surface.elevated,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                style={{ color: COLORS.text.primary }}
              >
                일일 피드백 조회
              </h2>
              <Button
                onClick={fetchDailyFeedbacks}
                disabled={isLoadingDailyFeedbacks || !user || !month}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoadingDailyFeedbacks && "animate-spin")}
                />
                새로고침
              </Button>
            </div>

            {isLoadingDailyFeedbacks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLORS.brand.primary }} />
              </div>
            ) : dailyFeedbackError ? (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${COLORS.status.error}15`,
                  border: `1px solid ${COLORS.status.error}`,
                }}
              >
                <p
                  className={cn(TYPOGRAPHY.body.fontSize)}
                  style={{ color: COLORS.status.error }}
                >
                  {dailyFeedbackError}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize)}
                    style={{ color: COLORS.text.secondary }}
                  >
                    <strong style={{ color: COLORS.text.primary }}>
                      {dailyFeedbacks.length}개
                    </strong>
                    의 일일 피드백이 조회되었습니다.
                    {dailyFeedbacks.length === 0 && (
                      <span className="block mt-2 text-sm" style={{ color: COLORS.status.error }}>
                        ⚠️ 일일 피드백이 없으면 월간 피드백을 생성할 수 없습니다.
                      </span>
                    )}
                  </p>
                </div>

                {dailyFeedbacks.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dailyFeedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: COLORS.surface.default,
                          borderColor: COLORS.border.light,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
                          <span
                            className={cn("font-medium", TYPOGRAPHY.body.fontSize)}
                            style={{ color: COLORS.text.primary }}
                          >
                            {feedback.report_date} ({feedback.day_of_week})
                          </span>
                        </div>
                        {feedback.vivid_report && (
                          <details className="mt-2">
                            <summary
                              className={cn("cursor-pointer text-sm", TYPOGRAPHY.body.fontSize)}
                              style={{ color: COLORS.text.secondary }}
                            >
                              Vivid Report 보기
                            </summary>
                            <div
                              className="mt-2 p-2 rounded text-xs"
                              style={{
                                backgroundColor: COLORS.surface.elevated,
                                color: COLORS.text.primary,
                              }}
                            >
                              {typeof feedback.vivid_report === "string"
                                ? feedback.vivid_report
                                : JSON.stringify(feedback.vivid_report, null, 2)}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 생성 버튼 */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !user || !month}
                className="px-8 py-3"
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: "white",
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "월간 피드백 생성"
                )}
              </Button>
              <Button
                onClick={handleGenerateTrend}
                disabled={isGeneratingTrend || !user || !month}
                className="px-8 py-3"
                variant="outline"
                style={{
                  borderColor: COLORS.brand.secondary,
                  color: COLORS.brand.secondary,
                }}
              >
                {isGeneratingTrend ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "Trend만 생성 (테스트)"
                )}
              </Button>
            </div>
            <p
              className={cn("text-center text-sm", TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary }}
            >
              ⚠️ Trend만 생성 버튼은 테스트용입니다. 기존 월간 피드백의 vivid_report가 있어야 동작합니다.
            </p>
          </div>

          {/* Trend 생성 결과 표시 */}
          {trendResult && (
            <div
              className={cn(
                "p-6 rounded-lg",
                trendResult.success ? "border-green-500" : "border-red-500"
              )}
              style={{
                backgroundColor: trendResult.success
                  ? `${COLORS.status.success}15`
                  : `${COLORS.status.error}15`,
                border: `2px solid ${trendResult.success ? COLORS.status.success : COLORS.status.error}`,
              }}
            >
              <div className="flex items-start gap-3">
                {trendResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.status.success }} />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.status.error }} />
                )}
                <div className="flex-1">
                  <h3
                    className={cn("mb-2", TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                    style={{
                      color: trendResult.success ? COLORS.status.success : COLORS.status.error,
                    }}
                  >
                    {trendResult.success ? "Trend 생성 성공" : "Trend 생성 실패"}
                  </h3>
                  <p
                    className={cn("mb-3", TYPOGRAPHY.body.fontSize)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {trendResult.message}
                  </p>
                  {trendResult.success && trendResult.data ? (
                    <details className="mt-4">
                      <summary
                        className={cn("cursor-pointer", TYPOGRAPHY.body.fontSize)}
                        style={{ color: COLORS.text.secondary }}
                      >
                        생성된 Trend 데이터 보기
                      </summary>
                      <pre
                        className="mt-2 p-4 rounded overflow-auto text-xs"
                        style={{
                          backgroundColor: COLORS.surface.default,
                          color: COLORS.text.primary,
                        }}
                      >
                        {JSON.stringify(trendResult.data, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div
              className={cn(
                "p-6 rounded-lg",
                result.success ? "border-green-500" : "border-red-500"
              )}
              style={{
                backgroundColor: result.success
                  ? `${COLORS.status.success}15`
                  : `${COLORS.status.error}15`,
                border: `2px solid ${result.success ? COLORS.status.success : COLORS.status.error}`,
              }}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.status.success }} />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.status.error }} />
                )}
                <div className="flex-1">
                  <h3
                    className={cn("mb-2", TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                    style={{
                      color: result.success ? COLORS.status.success : COLORS.status.error,
                    }}
                  >
                    {result.success ? "성공" : "실패"}
                  </h3>
                  <p
                    className={cn("mb-3", TYPOGRAPHY.body.fontSize)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {result.message}
                  </p>
                  {result.success && result.data ? (
                    (() => {
                      const data = result.data as { id?: string; month?: string; title?: string; month_label?: string; recorded_days?: number };
                      return (
                        <div className="mt-4 p-3 rounded" style={{ backgroundColor: COLORS.surface.elevated }}>
                          <p
                            className={cn("mb-2 font-medium", TYPOGRAPHY.body.fontSize)}
                            style={{ color: COLORS.text.primary }}
                          >
                            저장 정보:
                          </p>
                          <ul className="space-y-1 text-sm" style={{ color: COLORS.text.secondary }}>
                            <li>• 저장된 ID: <strong style={{ color: COLORS.text.primary }}>{data.id || "N/A"}</strong></li>
                            <li>• 월: <strong style={{ color: COLORS.text.primary }}>{data.month || "N/A"}</strong></li>
                            <li>• 제목: <strong style={{ color: COLORS.text.primary }}>{data.title || data.month_label || "N/A"}</strong></li>
                            <li>• 기록된 일수: <strong style={{ color: COLORS.text.primary }}>{data.recorded_days || 0}일</strong></li>
                          </ul>
                        </div>
                      );
                    })()
                  ) : null}
                  {result.data !== undefined && (
                    <details className="mt-4">
                      <summary
                        className={cn("cursor-pointer", TYPOGRAPHY.body.fontSize)}
                        style={{ color: COLORS.text.secondary }}
                      >
                        생성된 전체 데이터 보기
                      </summary>
                      <pre
                        className="mt-2 p-4 rounded overflow-auto text-xs"
                        style={{
                          backgroundColor: COLORS.surface.default,
                          color: COLORS.text.primary,
                        }}
                      >
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${COLORS.brand.primary}10`,
              border: `1px solid ${COLORS.brand.primary}30`,
            }}
          >
            <p
              className={cn("text-sm", TYPOGRAPHY.body.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              <strong>참고:</strong> 이 페이지는 테스트 목적으로만 사용됩니다. 
              실제 월간 피드백은 월의 마지막 일이 지난 후에만 생성 가능합니다.
              여기서는 월을 지정하여 해당 월의 모든 일일 피드백으로 월간 피드백을 생성할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
