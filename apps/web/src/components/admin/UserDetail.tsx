"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { UserDetail, AIUsageStats } from "@/types/admin";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface UserDetailProps {
  userId: string;
}

const COLORS_CHART = [
  COLORS.brand.primary,
  COLORS.brand.secondary,
  COLORS.brand.light,
  COLORS.section.emotion.primary,
];

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [aiStats, setAiStats] = useState<AIUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    role: "" as "user" | "admin" | "moderator",
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, statsResponse] = await Promise.all([
          fetch(`/api/admin/users/${userId}`),
          fetch(`/api/admin/users/${userId}/stats`),
        ]);

        if (!userResponse.ok) {
          throw new Error("유저 정보를 불러오는데 실패했습니다.");
        }

        const userData: UserDetail = await userResponse.json();
        setUser(userData);
        setEditData({
          name: userData.name,
          phone: userData.phone || "",
          role: userData.role,
          is_active: userData.is_active,
        });

        if (statsResponse.ok) {
          const statsData: AIUsageStats = await statsResponse.json();
          setAiStats(statsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("유저 정보를 수정하는데 실패했습니다.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정 실패");
    }
  };

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

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>
          {error || "유저를 찾을 수 없습니다."}
        </p>
        <button
          onClick={() => router.push("/admin/users")}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-2 rounded-lg hover:bg-opacity-50"
          style={{ backgroundColor: COLORS.background.hover }}
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: COLORS.text.primary }}
          />
        </button>
        <div className="flex-1">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            {user.name}
          </h1>
          <p style={{ color: COLORS.text.tertiary }}>{user.email}</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
            }}
          >
            <Edit2 className="w-4 h-4" />
            수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: COLORS.status.success,
                color: COLORS.text.white,
              }}
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  name: user.name,
                  phone: user.phone || "",
                  role: user.role,
                  is_active: user.is_active,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            기본 정보
          </h2>
          <div className="space-y-3">
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                />
              ) : (
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.name}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                이메일
              </label>
              <p className="mt-1" style={{ color: COLORS.text.primary }}>
                {user.email}
              </p>
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                전화번호
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                />
              ) : (
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.phone || "-"}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                역할
              </label>
              {isEditing ? (
                <select
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      role: e.target.value as "user" | "admin" | "moderator",
                    })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  <option value="user">유저</option>
                  <option value="admin">관리자</option>
                  <option value="moderator">모더레이터</option>
                </select>
              ) : (
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.role === "admin"
                    ? "관리자"
                    : user.role === "moderator"
                    ? "모더레이터"
                    : "유저"}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                상태
              </label>
              {isEditing ? (
                <select
                  value={editData.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      is_active: e.target.value === "true",
                    })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
              ) : (
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.is_active ? "활성" : "비활성"}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                가입일
              </label>
              <p className="mt-1" style={{ color: COLORS.text.primary }}>
                {new Date(user.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                최근 로그인
              </label>
              <p className="mt-1" style={{ color: COLORS.text.primary }}>
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString("ko-KR")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* 구독 정보 */}
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            구독 정보
          </h2>
          {user.subscription ? (
            <div className="space-y-3">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.secondary }}
                >
                  플랜
                </label>
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.subscription.plan === "pro" ? "Pro" : "Free"}
                </p>
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.secondary }}
                >
                  상태
                </label>
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.subscription.status}
                </p>
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.secondary }}
                >
                  만료일
                </label>
                <p className="mt-1" style={{ color: COLORS.text.primary }}>
                  {user.subscription.expires_at
                    ? new Date(user.subscription.expires_at).toLocaleDateString(
                        "ko-KR"
                      )
                    : "-"}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: COLORS.text.muted }}>구독 정보가 없습니다.</p>
          )}
        </div>

        {/* 기록 통계 */}
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            기록 통계
          </h2>
          {user.stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Records
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.records_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Daily Feedback
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.daily_feedback_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Weekly Feedback
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.weekly_feedback_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Monthly Feedback
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.monthly_feedback_count.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: COLORS.text.muted }}>통계 정보가 없습니다.</p>
          )}
        </div>

        {/* AI 사용량 통계 */}
        {aiStats && (
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              AI 사용량 통계
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 요청 수
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {aiStats.total_requests.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 토큰
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {aiStats.total_tokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 비용 (USD)
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ${aiStats.total_cost_usd.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 비용 (KRW)
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ₩{aiStats.total_cost_krw.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 모델별 사용량 차트 */}
              {aiStats.by_model.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    모델별 사용량
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={aiStats.by_model}
                        dataKey="cost_usd"
                        nameKey="model"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={(entry) =>
                          `${entry.model}: $${entry.cost_usd.toFixed(2)}`
                        }
                      >
                        {aiStats.by_model.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS_CHART[index % COLORS_CHART.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* 일별 트렌드 차트 */}
              {aiStats.daily_trend.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    일별 사용량 추이 (최근 {aiStats.daily_trend.length}일)
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={aiStats.daily_trend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={COLORS.border.light}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("ko-KR")
                        }
                        formatter={(value: number) => [
                          `$${value.toFixed(2)}`,
                          "비용",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="cost_usd"
                        stroke={COLORS.brand.primary}
                        strokeWidth={2}
                        dot={{ fill: COLORS.brand.primary, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
