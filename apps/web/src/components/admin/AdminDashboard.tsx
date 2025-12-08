"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/design-system";
import type { AdminStats } from "@/types/admin";
import { StatsCard } from "./StatsCard";
import { adminApiFetch } from "@/lib/admin-api-client";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApiFetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("통계를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p style={{ color: COLORS.status.error }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          관리자 대시보드
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          전체 시스템 통계를 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="총 유저 수"
          value={stats.totalUsers.toLocaleString()}
          description="전체 가입 유저"
        />
        <StatsCard
          title="활성 유저"
          value={stats.activeUsers.toLocaleString()}
          description="활성 상태인 유저"
        />
        <StatsCard
          title="Pro 멤버십"
          value={stats.proUsers.toLocaleString()}
          description="Pro 플랜 사용자"
        />
        <StatsCard
          title="오늘 AI 요청"
          value={stats.todayAIRequests.toLocaleString()}
          description="오늘 처리된 AI 요청 수"
        />
        <StatsCard
          title="오늘 AI 비용"
          value={`$${stats.todayAICost.usd.toFixed(2)}`}
          description={`₩${stats.todayAICost.krw.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
