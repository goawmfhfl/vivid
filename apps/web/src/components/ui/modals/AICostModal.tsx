"use client";

import { BaseModal } from "./BaseModal";
import { useAIRequestStore } from "@/store/useAIRequestStore";
import { COLORS } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { X, Clock, DollarSign } from "lucide-react";

export function AICostModal() {
  const { requests, isOpen, closeModal, clearRequests } = useAIRequestStore();

  if (!isOpen || requests.length === 0) return null;

  // 총 비용 계산
  const totalCost = requests.reduce(
    (acc, req) => ({
      usd: acc.usd + (req.cost?.total_cost_usd || 0),
      krw: acc.krw + (req.cost?.total_cost_krw || 0),
    }),
    { usd: 0, krw: 0 }
  );

  // 총 시간 계산
  const totalDuration = requests.reduce(
    (acc, req) => acc + (req.duration_ms || 0),
    0
  );

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
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(value);
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
    <BaseModal open={isOpen} onClose={closeModal} maxWidth="sm:max-w-2xl">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={cn("text-xl font-semibold", COLORS.text.primary)}
              style={{ color: COLORS.text.primary }}
            >
              AI 요청 비용 및 시간
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {requests.length}개의 요청이 완료되었습니다
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: COLORS.text.secondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 총 요약 */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: COLORS.background.card,
            border: `1px solid ${COLORS.border.light}`,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div
                className="text-sm flex items-center gap-2"
                style={{ color: COLORS.text.secondary }}
              >
                <Clock className="w-4 h-4" />총 응답 시간
              </div>
              <div
                className="text-lg font-semibold mt-1"
                style={{ color: COLORS.text.primary }}
              >
                {formatDuration(totalDuration)}
              </div>
            </div>
            <div>
              <div
                className="text-sm flex items-center gap-2"
                style={{ color: COLORS.text.secondary }}
              >
                <DollarSign className="w-4 h-4" />총 비용
              </div>
              <div
                className="text-lg font-semibold mt-1"
                style={{ color: COLORS.text.primary }}
              >
                {formatCurrency(totalCost.usd)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: COLORS.text.secondary }}
              >
                {formatCurrency(totalCost.krw, "KRW")}
              </div>
            </div>
          </div>
        </div>

        {/* 요청 목록 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: COLORS.background.card,
                border: `1px solid ${COLORS.border.light}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {request.name}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {request.model}
                  </div>
                </div>
                {request.error ? (
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "#FEE2E2",
                      color: COLORS.status.error,
                    }}
                  >
                    에러
                  </span>
                ) : (
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "#D1FAE5",
                      color: COLORS.status.success,
                    }}
                  >
                    완료
                  </span>
                )}
              </div>

              {request.error ? (
                <div
                  className="text-sm mt-2 p-2 rounded"
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: COLORS.status.error,
                  }}
                >
                  {request.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      시간
                    </div>
                    <div
                      className="text-sm font-medium mt-1"
                      style={{ color: COLORS.text.primary }}
                    >
                      {request.duration_ms
                        ? formatDuration(request.duration_ms)
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      비용
                    </div>
                    <div
                      className="text-sm font-medium mt-1"
                      style={{ color: COLORS.text.primary }}
                    >
                      {request.cost
                        ? formatCurrency(request.cost.total_cost_usd)
                        : "-"}
                    </div>
                    {request.cost && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {formatCurrency(request.cost.total_cost_krw, "KRW")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {request.usage && (
                <div
                  className="mt-2 pt-2 border-t"
                  style={{ borderColor: COLORS.border.light }}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-4">
                      <div style={{ color: COLORS.text.secondary }}>
                        입력: {request.usage.prompt_tokens.toLocaleString()}{" "}
                        토큰
                      </div>
                      <div style={{ color: COLORS.text.secondary }}>
                        출력: {request.usage.completion_tokens.toLocaleString()}{" "}
                        토큰
                      </div>
                      <div style={{ color: COLORS.text.secondary }}>
                        총: {request.usage.total_tokens.toLocaleString()} 토큰
                      </div>
                    </div>
                    {request.usage.cached_tokens !== undefined &&
                      request.usage.cached_tokens > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: "#D1FAE5",
                              color: COLORS.status.success,
                            }}
                          >
                            캐시됨:{" "}
                            {request.usage.cached_tokens.toLocaleString()} 토큰
                          </span>
                          {request.cost?.cached_input_cost_usd !==
                            undefined && (
                            <span style={{ color: COLORS.text.secondary }}>
                              (
                              {formatCurrency(
                                request.cost.cached_input_cost_usd
                              )}
                              )
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div
          className="flex justify-end gap-2 pt-2 border-t"
          style={{ borderColor: COLORS.border.light }}
        >
          <button
            onClick={clearRequests}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.background.hover,
              color: COLORS.text.secondary,
            }}
          >
            초기화
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
            }}
          >
            확인
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
