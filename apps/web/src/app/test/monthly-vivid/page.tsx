"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getCurrentUserId } from "@/hooks/useCurrentUser";
import { COLORS, SPACING, TYPOGRAPHY, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { MonthlyVivid } from "@/types/monthly-vivid";

export default function MonthlyVividTestPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [month, setMonth] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: MonthlyVivid & { id: string };
  } | null>(null);

  // 현재 날짜 기준으로 이번 달 설정
  const setCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = String(now.getMonth() + 1).padStart(2, "0");
    setMonth(`${year}-${monthNum}`);
  };

  const handleGenerate = async () => {
    if (!month) {
      alert("월을 입력해주세요 (예: 2025-01)");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const userId = await getCurrentUserId();

      const requestBody: {
        userId: string;
        month: string;
        start_date?: string;
        end_date?: string;
      } = {
        userId,
        month,
      };

      if (startDate && endDate) {
        requestBody.start_date = startDate;
        requestBody.end_date = endDate;
      }

      const response = await fetch("/api/monthly-vivid/test-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "월간 VIVID 생성에 실패했습니다.");
      }

      setResult({
        type: "success",
        message: "월간 VIVID가 성공적으로 생성되었습니다!",
        data: data.data,
      });
    } catch (error) {
      console.error("생성 실패:", error);
      setResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "월간 VIVID 생성에 실패했습니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className={cn(SPACING.card.padding)}
          style={{
            ...CARD_STYLES.default,
            maxWidth: "600px",
          }}
        >
          <h2 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}>
            로그인이 필요합니다
          </h2>
          <p style={{ color: COLORS.text.secondary, marginTop: "1rem" }}>
            이 페이지를 사용하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(SPACING.page.paddingHorizontal, SPACING.page.paddingVertical)}
      style={{ backgroundColor: COLORS.background.base, minHeight: "100vh" }}
    >
      <div className="mx-auto" style={{ maxWidth: SPACING.page.maxWidth }}>
        <h1
          className={cn(
            TYPOGRAPHY.h1.fontSize,
            TYPOGRAPHY.h1.fontWeight,
            "mb-8"
          )}
        >
          월간 VIVID 생성 테스트
        </h1>

        <div
          className={cn(SPACING.card.padding, "mb-6")}
          style={CARD_STYLES.default}
        >
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-4"
            )}
          >
            테스트 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block mb-2"
                style={{ color: COLORS.text.primary, fontWeight: "500" }}
              >
                월 (YYYY-MM 형식) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="2025-01"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.light,
                    backgroundColor: COLORS.background.base,
                    color: COLORS.text.primary,
                  }}
                />
                <Button
                  onClick={setCurrentMonth}
                  variant="outline"
                  style={{
                    borderColor: COLORS.border.light,
                    color: COLORS.text.secondary,
                  }}
                >
                  이번 달
                </Button>
              </div>
            </div>

            <div>
              <label
                className="block mb-2"
                style={{ color: COLORS.text.primary, fontWeight: "500" }}
              >
                커스텀 날짜 범위 (선택사항)
              </label>
              <p
                className="text-sm mb-2"
                style={{ color: COLORS.text.tertiary }}
              >
                지정하지 않으면 해당 월의 전체 기간이 사용됩니다.
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="시작일"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.light,
                    backgroundColor: COLORS.background.base,
                    color: COLORS.text.primary,
                  }}
                />
                <span style={{ color: COLORS.text.secondary, alignSelf: "center" }}>
                  ~
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="종료일"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.light,
                    backgroundColor: COLORS.background.base,
                    color: COLORS.text.primary,
                  }}
                />
              </div>
            </div>

            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: COLORS.background.cardElevated }}
            >
              <p
                className="text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                <strong style={{ color: COLORS.text.primary }}>테스트 모드:</strong>
                <br />
                • 월말 필터링 없이 언제든지 생성 가능
                <br />
                • daily_vivid가 없으면 vivid-records를 기반으로 생성
                <br />
                • Pro 멤버십이 필요합니다
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !month}
              className="w-full"
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
                "월간 VIVID 생성하기"
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div
            className={cn(SPACING.card.padding)}
            style={{
              ...CARD_STYLES.default,
              backgroundColor:
                result.type === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              borderColor:
                result.type === "success"
                  ? COLORS.status.success
                  : COLORS.status.error,
            }}
          >
            <div className="flex items-start gap-3">
              {result.type === "success" ? (
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.status.success }}
                />
              ) : (
                <XCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.status.error }}
                />
              )}
              <div className="flex-1">
                <h3
                  className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight, "mb-2")}
                  style={{
                    color:
                      result.type === "success"
                        ? COLORS.status.success
                        : COLORS.status.error,
                  }}
                >
                  {result.type === "success" ? "생성 성공" : "생성 실패"}
                </h3>
                <p style={{ color: COLORS.text.primary, marginBottom: "1rem" }}>
                  {result.message}
                </p>
                {result.data && (
                  <div
                    className="mt-4 p-3 rounded-lg overflow-auto"
                    style={{
                      backgroundColor: COLORS.background.base,
                      maxHeight: "300px",
                    }}
                  >
                    <pre
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
