"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input";
import { COLORS, SPACING } from "@/lib/design-system";
import { Loader2, DollarSign, Zap, Clock } from "lucide-react";

interface TokenTestResult {
  success: boolean;
  model?: string;
  content?: string;
  finish_reason?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost?: {
    input_cost_usd: number;
    output_cost_usd: number;
    total_cost_usd: number;
    input_cost_krw?: number;
    output_cost_krw?: number;
    total_cost_krw?: number;
    input_price_per_1m: number;
    output_price_per_1m: number;
    usd_to_krw_rate?: number;
  };
  duration_ms?: number;
  duration_sec?: number;
  timestamp?: string;
  error?: string;
}

export function TokenTestPanel() {
  const [model, setModel] = useState("gpt-5-nano");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TokenTestResult | null>(null);

  const handleTest = async () => {
    if (!userPrompt.trim()) {
      alert("사용자 프롬프트를 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test/token-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          systemPrompt,
          userPrompt,
          temperature: parseFloat(temperature) || 0.7,
          maxTokens: maxTokens ? parseInt(maxTokens) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        setResult({
          success: false,
          error: errorData.error || `HTTP ${response.status}`,
        });
        return;
      }

      const data = await response.json();

      // 응답이 성공했지만 content가 없는 경우 경고
      if (data.success && !data.content && data.finish_reason) {
        console.warn("Response received but content is empty", {
          finish_reason: data.finish_reason,
          usage: data.usage,
        });
      }

      setResult(data);
    } catch (error) {
      console.error("Token test error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: "USD" | "KRW" = "USD") => {
    if (currency === "KRW") {
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(2)}초`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds.toFixed(2)}초`;
  };

  return (
    <Card
      className="p-6"
      style={{
        backgroundColor: "white",
        border: `1px solid ${COLORS.border.light}`,
        color: COLORS.text.primary,
      }}
    >
      <div className="space-y-6">
        <div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            AI 토큰 사용량 테스트
          </h2>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            AI 모델에 요청을 보내고 토큰 사용량과 비용을 확인할 수 있습니다.
          </p>
        </div>

        {/* 모델 선택 */}
        <div className="space-y-2">
          <p style={{ color: COLORS.text.muted }}>모델</p>
          <Input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="모델을 선택하세요..."
          />
        </div>

        {/* 시스템 프롬프트 */}
        <div className="space-y-2">
          <p style={{ color: COLORS.text.primary }}>시스템 프롬프트</p>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="시스템 프롬프트를 입력하세요..."
            rows={3}
            style={{
              backgroundColor: COLORS.background.base,
              border: `1px solid ${COLORS.border.light}`,
            }}
          />
        </div>

        {/* 사용자 프롬프트 */}
        <div className="space-y-2">
          <p style={{ color: COLORS.text.primary }}>사용자 프롬프트 *</p>
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="사용자 프롬프트를 입력하세요..."
            rows={5}
            style={{
              backgroundColor: COLORS.background.base,
              border: `1px solid ${COLORS.border.light}`,
            }}
          />
        </div>

        {/* 옵션 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <p style={{ color: COLORS.text.primary }}>Temperature</p>
              <p
                className="text-xs mt-1"
                style={{ color: COLORS.text.secondary }}
              >
                {["gpt-5-nano", "gpt-5-mini"].includes(model)
                  ? "최신 모델은 1.0으로 고정됩니다"
                  : "응답의 창의성/일관성 조절 (0.0~2.0)"}
                <br />
                {!["gpt-5-nano", "gpt-5-mini"].includes(model) &&
                  "낮을수록 일관적, 높을수록 창의적"}
              </p>
            </div>
            <Input
              type="number"
              value={
                ["gpt-5-nano", "gpt-5-mini"].includes(model)
                  ? "1.0"
                  : temperature
              }
              onChange={(e) => {
                if (!["gpt-5-nano", "gpt-5-mini"].includes(model)) {
                  setTemperature(e.target.value);
                }
              }}
              min="0"
              max="2"
              step="0.1"
              disabled={["gpt-5-nano", "gpt-5-mini"].includes(model)}
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${COLORS.border.light}`,
                opacity: ["gpt-5-nano", "gpt-5-mini"].includes(model) ? 0.6 : 1,
              }}
            />
          </div>
          <div className="space-y-2">
            <div>
              <p style={{ color: COLORS.text.primary }}>Max Tokens (선택)</p>
              <p
                className="text-xs mt-1"
                style={{ color: COLORS.text.secondary }}
              >
                최대 출력 토큰 수 제한
                <br />
                비용 제어 및 응답 길이 제한용
              </p>
            </div>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="미지정"
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${COLORS.border.light}`,
              }}
            />
          </div>
        </div>

        {/* 테스트 버튼 */}
        <Button
          onClick={handleTest}
          disabled={loading || !userPrompt.trim()}
          className="w-full"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: "white",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              요청 중...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              테스트 실행
            </>
          )}
        </Button>

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-4 mt-6 pt-6 border-t">
            {result.success ? (
              <>
                {/* 토큰 사용량 */}
                <div>
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: COLORS.text.primary }}
                  >
                    토큰 사용량
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div
                        className="text-sm mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        입력 토큰
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {formatNumber(result.usage?.prompt_tokens || 0)}
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div
                        className="text-sm mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        출력 토큰
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {formatNumber(result.usage?.completion_tokens || 0)}
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div
                        className="text-sm mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        총 토큰
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: COLORS.brand.primary }}
                      >
                        {formatNumber(result.usage?.total_tokens || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 비용 정보 */}
                <div>
                  <h3
                    className="text-lg font-semibold mb-3 flex items-center gap-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    <DollarSign className="w-5 h-5" />
                    비용 계산
                  </h3>
                  <div className="space-y-2">
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: COLORS.text.primary }}
                          >
                            입력 비용
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            ${result.cost?.input_price_per_1m.toFixed(2)} / 1M
                            tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-lg font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {formatCurrency(result.cost?.input_cost_usd || 0)}
                          </div>
                          {result.cost?.input_cost_krw && (
                            <div
                              className="text-sm mt-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {formatCurrency(
                                result.cost.input_cost_krw,
                                "KRW"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: COLORS.text.primary }}
                          >
                            출력 비용
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            ${result.cost?.output_price_per_1m.toFixed(2)} / 1M
                            tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-lg font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {formatCurrency(result.cost?.output_cost_usd || 0)}
                          </div>
                          {result.cost?.output_cost_krw && (
                            <div
                              className="text-sm mt-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {formatCurrency(
                                result.cost.output_cost_krw,
                                "KRW"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: COLORS.brand.primary + "10",
                        border: `2px solid ${COLORS.brand.primary}`,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: COLORS.text.primary }}
                          >
                            총 비용
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {result.model}
                            {result.cost?.usd_to_krw_rate &&
                              ` (환율: ${result.cost.usd_to_krw_rate.toFixed(
                                0
                              )}원/USD)`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-xl font-bold"
                            style={{ color: COLORS.brand.primary }}
                          >
                            {formatCurrency(result.cost?.total_cost_usd || 0)}
                          </div>
                          {result.cost?.total_cost_krw && (
                            <div
                              className="text-base font-semibold mt-1"
                              style={{ color: COLORS.brand.primary }}
                            >
                              {formatCurrency(
                                result.cost.total_cost_krw,
                                "KRW"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 성능 정보 */}
                <div>
                  <h3
                    className="text-lg font-semibold mb-3 flex items-center gap-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    <Clock className="w-5 h-5" />
                    성능 정보
                  </h3>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: COLORS.background.base,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div
                          className="text-sm"
                          style={{ color: COLORS.text.secondary }}
                        >
                          응답 시간
                        </div>
                        <div
                          className="text-lg font-semibold mt-1"
                          style={{ color: COLORS.text.primary }}
                        >
                          {result.duration_ms
                            ? formatDuration(result.duration_ms)
                            : "0ms"}
                        </div>
                        {result.duration_ms && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            ({result.duration_ms.toLocaleString()}ms)
                          </div>
                        )}
                      </div>
                      <div>
                        <div
                          className="text-sm"
                          style={{ color: COLORS.text.secondary }}
                        >
                          토큰/초
                        </div>
                        <div
                          className="text-lg font-semibold mt-1"
                          style={{ color: COLORS.text.primary }}
                        >
                          {result.duration_ms
                            ? (
                                (result.usage?.total_tokens || 0) /
                                (result.duration_ms / 1000)
                              ).toFixed(2)
                            : "0"}
                        </div>
                        {result.duration_sec && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            ({result.duration_sec.toFixed(3)}초)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 응답 내용 */}
                {result.success && (
                  <div>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: COLORS.text.primary }}
                    >
                      AI 응답
                    </h3>
                    {result.content ? (
                      <div
                        className="p-4 rounded-lg whitespace-pre-wrap"
                        style={{
                          backgroundColor: COLORS.background.base,
                          border: `1px solid ${COLORS.border.light}`,
                          color: COLORS.text.primary,
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {result.content}
                      </div>
                    ) : (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "#FEF3C7",
                          border: `1px solid #FCD34D`,
                          color: "#92400E",
                        }}
                      >
                        <div className="font-semibold mb-1">
                          응답이 비어있습니다
                        </div>
                        <div className="text-sm">
                          {result.finish_reason
                            ? `finish_reason: ${result.finish_reason}`
                            : "AI가 응답을 생성하지 않았습니다."}
                        </div>
                        {result.usage && (
                          <div className="text-xs mt-2">
                            토큰 사용량: 입력 {result.usage.prompt_tokens}개,
                            출력 {result.usage.completion_tokens}개
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#FEE2E2",
                  border: `1px solid #FCA5A5`,
                  color: "#991B1B",
                }}
              >
                <div className="font-semibold mb-1">오류 발생</div>
                <div className="text-sm">{result.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
