"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { QUERY_KEYS } from "@/constants";
import { TYPOGRAPHY, COLORS } from "@/lib/design-system";
import { supabase } from "@/lib/supabase";

/**
 * 구독 테스트 패널
 * 개발 환경에서만 표시되며, 구독 상태를 테스트할 수 있습니다.
 */
export function SubscriptionTestPanel() {
  const { data: currentUser } = useCurrentUser();
  const { subscription, isPro } = useSubscription();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 구독 생성/업데이트 mutation
  const subscriptionMutation = useMutation({
    mutationFn: async (data: {
      plan: "free" | "pro";
      status: "active" | "canceled" | "expired" | "past_due";
      expiresAt?: string | null;
    }) => {
      // Supabase 세션에서 액세스 토큰 가져오기
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch("/api/test/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.details || "구독 업데이트 실패");
      }
      return result;
    },
    onSuccess: (data) => {
      setResult({ success: true, message: data.message });
      setError(null);
      // user_metadata 캐시 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setResult(null);
    },
  });

  // user_metadata 동기화 mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // Supabase 세션에서 액세스 토큰 가져오기
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch("/api/test/subscription/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.details || "동기화 실패");
      }
      return result;
    },
    onSuccess: (data) => {
      setResult({ success: true, message: data.message });
      setError(null);
      // user_metadata 캐시 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setResult(null);
    },
  });

  // Pro 멤버십 활성화 (30일)
  const handleActivatePro = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    subscriptionMutation.mutate({
      plan: "pro",
      status: "active",
      expiresAt: expiresAt.toISOString(),
    });
  };

  // Pro 멤버십 활성화 (무제한)
  const handleActivateProUnlimited = () => {
    subscriptionMutation.mutate({
      plan: "pro",
      status: "active",
      expiresAt: null,
    });
  };

  // Free 플랜으로 변경
  const handleSetFree = () => {
    subscriptionMutation.mutate({
      plan: "free",
      status: "active",
      expiresAt: null,
    });
  };

  // 구독 취소
  const handleCancel = () => {
    subscriptionMutation.mutate({
      plan: "pro",
      status: "canceled",
      expiresAt: null,
    });
  };

  // 구독 만료
  const handleExpire = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1); // 어제 만료
    subscriptionMutation.mutate({
      plan: "pro",
      status: "expired",
      expiresAt: expiresAt.toISOString(),
    });
  };

  // user_metadata 동기화
  const handleSync = () => {
    syncMutation.mutate();
  };

  // 프로덕션 환경에서는 절대 표시하지 않음
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      className="mb-6 p-4 rounded-lg"
      style={{
        backgroundColor: "#FFF9E6",
        border: "1px solid #F59E0B",
      }}
    >
      <div className="mb-4">
        <h3
          className={`${TYPOGRAPHY.h3.fontSize} font-semibold mb-2`}
          style={{ color: "#B8860B" }}
        >
          🧪 구독 테스트 패널 (개발 환경)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          현재 사용자: {currentUser?.email || "로딩 중..."}
        </p>
      </div>

      {/* 현재 구독 상태 */}
      <div
        className="mb-4 p-3 rounded-lg"
        style={{
          backgroundColor: isPro ? "#D1FAE5" : "#F3F4F6",
          border: `1px solid ${
            isPro ? COLORS.status.success : COLORS.border.light
          }`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {isPro ? (
            <CheckCircle2
              className="w-5 h-5"
              style={{ color: COLORS.status.success }}
            />
          ) : (
            <AlertCircle
              className="w-5 h-5"
              style={{ color: COLORS.text.muted }}
            />
          )}
          <span className="font-semibold text-gray-600">
            현재 상태: {isPro ? "Pro 멤버십" : "Free 플랜"}
          </span>
        </div>
        {subscription && (
          <div className="text-sm space-y-1 text-gray-600">
            <div>플랜: {subscription.plan}</div>
            <div className="text-gray-600">상태: {subscription.status}</div>
            {subscription.expiresAt && (
              <div className="text-gray-600">
                만료일:{" "}
                {new Date(subscription.expiresAt).toLocaleString("ko-KR")}
              </div>
            )}
            {subscription.isExpired && (
              <div className="text-red-600 font-semibold">⚠️ 만료됨</div>
            )}
          </div>
        )}
      </div>

      {/* 테스트 버튼들 */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleActivatePro}
            disabled={subscriptionMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              opacity: subscriptionMutation.isPending ? 0.6 : 1,
            }}
          >
            {subscriptionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : null}
            Pro 활성화 (30일)
          </button>

          <button
            onClick={handleActivateProUnlimited}
            disabled={subscriptionMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              opacity: subscriptionMutation.isPending ? 0.6 : 1,
            }}
          >
            {subscriptionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : null}
            Pro 활성화 (무제한)
          </button>

          <button
            onClick={handleSetFree}
            disabled={subscriptionMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={{
              backgroundColor: COLORS.background.card,
              color: COLORS.text.primary,
              borderColor: COLORS.border.light,
              opacity: subscriptionMutation.isPending ? 0.6 : 1,
            }}
          >
            Free로 변경
          </button>

          <button
            onClick={handleCancel}
            disabled={subscriptionMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={{
              backgroundColor: COLORS.background.card,
              color: COLORS.status.warning,
              borderColor: COLORS.status.warning,
              opacity: subscriptionMutation.isPending ? 0.6 : 1,
            }}
          >
            구독 취소
          </button>

          <button
            onClick={handleExpire}
            disabled={subscriptionMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={{
              backgroundColor: COLORS.background.card,
              color: COLORS.status.error,
              borderColor: COLORS.status.error,
              opacity: subscriptionMutation.isPending ? 0.6 : 1,
            }}
          >
            구독 만료
          </button>

          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={{
              backgroundColor: COLORS.background.card,
              color: COLORS.brand.primary,
              borderColor: COLORS.brand.primary,
              opacity: syncMutation.isPending ? 0.6 : 1,
            }}
          >
            {syncMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 inline mr-2" />
            )}
            user_metadata 동기화
          </button>
        </div>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div
          className="mt-4 p-3 rounded-lg text-gray-600"
          style={{
            backgroundColor: result.success ? "#D1FAE5" : "#FEE2E2",
            border: `1px solid ${
              result.success ? COLORS.status.success : COLORS.status.error
            }`,
          }}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2
                className="w-5 h-5"
                style={{ color: COLORS.status.success }}
              />
            ) : (
              <AlertCircle
                className="w-5 h-5"
                style={{ color: COLORS.status.error }}
              />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div
          className="mt-4 p-3 rounded-lg text-gray-600"
          style={{
            backgroundColor: "#FEE2E2",
            border: `1px solid ${COLORS.status.error}`,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className="w-5 h-5"
              style={{ color: COLORS.status.error }}
            />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
