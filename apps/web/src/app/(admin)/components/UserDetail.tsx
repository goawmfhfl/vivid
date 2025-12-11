"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import type { UserDetail, AIUsageStats } from "@/types/admin";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    role: "" as "user" | "admin" | "moderator",
    is_active: true,
  });
  const [feedbacks, setFeedbacks] = useState<{
    daily: Array<{
      id: string;
      type: "daily";
      date: string;
      day_of_week: string | null;
      created_at: string;
      updated_at: string;
      is_ai_generated: boolean | null;
    }>;
    dailyPagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    weekly: Array<{
      id: string;
      type: "weekly";
      week_start: string;
      week_end: string;
      created_at: string;
      updated_at: string;
      is_ai_generated: boolean | null;
    }>;
    monthly: Array<{
      id: string;
      type: "monthly";
      month: string;
      month_label: string | null;
      date_range: { start_date: string; end_date: string } | null;
      created_at: string;
      updated_at: string;
      is_ai_generated: boolean | null;
    }>;
  } | null>(null);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyLimit] = useState(10);
  const [expandedSections, setExpandedSections] = useState({
    daily: true,
    weekly: true,
    monthly: true,
  });
  const [isEditingSubscription, setIsEditingSubscription] = useState(false);
  const [subscriptionEditData, setSubscriptionEditData] = useState({
    plan: "" as "free" | "pro" | "",
    status: "" as "active" | "canceled" | "expired" | "past_due" | "",
    expires_at: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, statsResponse] = await Promise.all([
          adminApiFetch(`/api/admin/users/${userId}`),
          adminApiFetch(`/api/admin/users/${userId}/stats`),
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

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoadingFeedbacks(true);
      try {
        const response = await adminApiFetch(
          `/api/admin/users/${userId}/feedbacks?dailyPage=${dailyPage}&dailyLimit=${dailyLimit}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "피드백 목록을 불러오는데 실패했습니다."
          );
        }
        const data = await response.json();
        // weekly 피드백이 제대로 있는지 확인
        if (data && typeof data === "object") {
          setFeedbacks({
            daily: data.daily || [],
            dailyPagination: data.dailyPagination,
            weekly: data.weekly || [],
            monthly: data.monthly || [],
          });
        }
      } catch (err) {
        console.error("피드백 목록 조회 실패:", err);
        setFeedbacks({
          daily: [],
          weekly: [],
          monthly: [],
        });
      } finally {
        setIsLoadingFeedbacks(false);
      }
    };

    if (user) {
      fetchFeedbacks();
    }
  }, [userId, user, dailyPage, dailyLimit]);

  const handleSave = async () => {
    try {
      const response = await adminApiFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
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

  const handleCreateSubscription = async () => {
    if (!user) return;

    // 구독 정보가 이미 있으면 구독 관리 페이지로 이동
    if (user.subscription) {
      router.push(`/admin/subscriptions?userId=${user.id}`);
      return;
    }

    // 구독 정보가 없으면 바로 생성
    setIsCreatingSubscription(true);
    try {
      const response = await adminApiFetch("/api/admin/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          plan: "free",
          status: "active",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "구독 생성에 실패했습니다.");
      }

      // 유저 정보 다시 불러오기
      const userResponse = await adminApiFetch(`/api/admin/users/${userId}`);
      if (userResponse.ok) {
        const userData: UserDetail = await userResponse.json();
        setUser(userData);
      }

      alert("구독이 성공적으로 생성되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "구독 생성 실패");
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleDeleteFeedback = async (
    feedbackId: string,
    type: "daily" | "weekly" | "monthly"
  ) => {
    if (!confirm("정말 이 피드백을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await adminApiFetch(
        `/api/admin/users/${userId}/feedbacks/${feedbackId}?type=${type}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("피드백 삭제에 실패했습니다.");
      }

      // 피드백 목록 다시 불러오기
      const feedbacksResponse = await adminApiFetch(
        `/api/admin/users/${userId}/feedbacks?dailyPage=${dailyPage}&dailyLimit=${dailyLimit}`
      );
      if (feedbacksResponse.ok) {
        const data = await feedbacksResponse.json();
        setFeedbacks({
          daily: data.daily || [],
          dailyPagination: data.dailyPagination,
          weekly: data.weekly || [],
          monthly: data.monthly || [],
        });
      }

      alert("피드백이 성공적으로 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "피드백 삭제 실패");
    }
  };

  const handleUpdateSubscription = async () => {
    if (!user?.subscription) {
      alert("구독 정보가 없습니다.");
      return;
    }

    try {
      const updatePayload: {
        userId: string;
        plan?: string;
        status?: string;
        expires_at?: string | null;
      } = {
        userId: user.id,
      };

      if (subscriptionEditData.plan) {
        updatePayload.plan = subscriptionEditData.plan;
      }
      if (subscriptionEditData.status) {
        updatePayload.status = subscriptionEditData.status;
      }
      if (subscriptionEditData.expires_at !== undefined) {
        updatePayload.expires_at = subscriptionEditData.expires_at || null;
      }

      const response = await adminApiFetch("/api/admin/subscriptions", {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "구독 정보를 수정하는데 실패했습니다."
        );
      }

      // 유저 정보 다시 불러오기
      const userResponse = await adminApiFetch(`/api/admin/users/${userId}`);
      if (userResponse.ok) {
        const userData: UserDetail = await userResponse.json();
        setUser(userData);
      }

      setIsEditingSubscription(false);
      setSubscriptionEditData({
        plan: "",
        status: "",
        expires_at: "",
      });
      alert("구독 정보가 성공적으로 수정되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "구독 정보 수정 실패");
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
    <div className="space-y-8">
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
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            {user.name}
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            {user.email}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* 기본 정보 */}
        <div
          className="rounded-xl p-4 sm:p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold"
              style={{ color: COLORS.text.primary }}
            >
              기본 정보
            </h2>
            <div className="flex gap-2">
              {!isEditing && (
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor:
                      user.role === "admin"
                        ? COLORS.brand.light
                        : COLORS.background.hover,
                    color:
                      user.role === "admin"
                        ? COLORS.brand.primary
                        : COLORS.text.secondary,
                  }}
                >
                  {user.role === "admin"
                    ? "관리자"
                    : user.role === "moderator"
                    ? "모더레이터"
                    : "유저"}
                </span>
              )}
              <span
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: user.is_active
                    ? COLORS.status.success + "20"
                    : COLORS.status.error + "20",
                  color: user.is_active
                    ? COLORS.status.success
                    : COLORS.status.error,
                }}
              >
                {user.is_active ? "활성" : "비활성"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* 이름 */}
            <div
              className="pb-4 border-b"
              style={{ borderColor: COLORS.border.light }}
            >
              <label
                className="text-xs font-medium uppercase tracking-wide mb-2 block"
                style={{ color: COLORS.text.tertiary }}
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
                  className="w-full px-4 py-2.5 rounded-lg border text-base"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                />
              ) : (
                <p
                  className="text-lg font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.name}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div
              className="pb-4 border-b"
              style={{ borderColor: COLORS.border.light }}
            >
              <label
                className="text-xs font-medium uppercase tracking-wide mb-2 block"
                style={{ color: COLORS.text.tertiary }}
              >
                이메일
              </label>
              <p className="text-base" style={{ color: COLORS.text.primary }}>
                {user.email}
              </p>
            </div>

            {/* 전화번호 */}
            <div
              className="pb-4 border-b"
              style={{ borderColor: COLORS.border.light }}
            >
              <label
                className="text-xs font-medium uppercase tracking-wide mb-2 block"
                style={{ color: COLORS.text.tertiary }}
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
                  className="w-full px-4 py-2.5 rounded-lg border text-base"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                />
              ) : (
                <p className="text-base" style={{ color: COLORS.text.primary }}>
                  {user.phone || (
                    <span style={{ color: COLORS.text.muted }}>-</span>
                  )}
                </p>
              )}
            </div>

            {/* 역할 (편집 모드에서만) */}
            {isEditing && (
              <div
                className="pb-4 border-b"
                style={{ borderColor: COLORS.border.light }}
              >
                <label
                  className="text-xs font-medium uppercase tracking-wide mb-2 block"
                  style={{ color: COLORS.text.tertiary }}
                >
                  역할
                </label>
                <select
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      role: e.target.value as "user" | "admin" | "moderator",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border text-base"
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
              </div>
            )}

            {/* 상태 (편집 모드에서만) */}
            {isEditing && (
              <div
                className="pb-4 border-b"
                style={{ borderColor: COLORS.border.light }}
              >
                <label
                  className="text-xs font-medium uppercase tracking-wide mb-2 block"
                  style={{ color: COLORS.text.tertiary }}
                >
                  상태
                </label>
                <select
                  value={editData.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      is_active: e.target.value === "true",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border text-base"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
              </div>
            )}

            {/* 가입일 */}
            <div
              className="pb-4 border-b"
              style={{ borderColor: COLORS.border.light }}
            >
              <label
                className="text-xs font-medium uppercase tracking-wide mb-2 block"
                style={{ color: COLORS.text.tertiary }}
              >
                가입일
              </label>
              <p className="text-base" style={{ color: COLORS.text.primary }}>
                {new Date(user.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* 최근 로그인 */}
            <div>
              <label
                className="text-xs font-medium uppercase tracking-wide mb-2 block"
                style={{ color: COLORS.text.tertiary }}
              >
                최근 로그인
              </label>
              <p className="text-base" style={{ color: COLORS.text.primary }}>
                {user.last_login_at ? (
                  new Date(user.last_login_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                ) : (
                  <span style={{ color: COLORS.text.muted }}>
                    로그인 기록 없음
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 구독 정보 */}
        <div
          className="rounded-xl p-4 sm:p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: COLORS.text.primary }}
            >
              구독 정보
            </h2>
            {user.subscription && !isEditingSubscription && (
              <button
                onClick={() => {
                  setIsEditingSubscription(true);
                  setSubscriptionEditData({
                    plan: user.subscription!.plan,
                    status: user.subscription!.status,
                    expires_at: user.subscription!.expires_at
                      ? new Date(user.subscription!.expires_at)
                          .toISOString()
                          .split("T")[0]
                      : "",
                  });
                }}
                className="text-sm px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: COLORS.brand.light,
                  color: COLORS.brand.primary,
                }}
              >
                수정
              </button>
            )}
          </div>
          {user.subscription ? (
            <div className="space-y-4">
              {isEditingSubscription ? (
                <>
                  <div>
                    <label
                      className="text-xs font-medium block mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      플랜
                    </label>
                    <select
                      value={subscriptionEditData.plan}
                      onChange={(e) =>
                        setSubscriptionEditData({
                          ...subscriptionEditData,
                          plan: e.target.value as "free" | "pro",
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border text-base"
                      style={{
                        borderColor: COLORS.border.input,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.text.primary,
                      }}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium block mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      상태
                    </label>
                    <select
                      value={subscriptionEditData.status}
                      onChange={(e) =>
                        setSubscriptionEditData({
                          ...subscriptionEditData,
                          status: e.target.value as
                            | "active"
                            | "canceled"
                            | "expired"
                            | "past_due",
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border text-base"
                      style={{
                        borderColor: COLORS.border.input,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.text.primary,
                      }}
                    >
                      <option value="active">활성</option>
                      <option value="canceled">취소됨</option>
                      <option value="expired">만료됨</option>
                      <option value="past_due">연체</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium block mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      만료일
                    </label>
                    <input
                      type="date"
                      value={subscriptionEditData.expires_at}
                      onChange={(e) =>
                        setSubscriptionEditData({
                          ...subscriptionEditData,
                          expires_at: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border text-base"
                      style={{
                        borderColor: COLORS.border.input,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.text.primary,
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateSubscription}
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
                        setIsEditingSubscription(false);
                        setSubscriptionEditData({
                          plan: "",
                          status: "",
                          expires_at: "",
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
                </>
              ) : (
                <>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        플랜
                      </label>
                      <span
                        className="px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{
                          backgroundColor:
                            user.subscription.plan === "pro"
                              ? COLORS.brand.light
                              : COLORS.background.card,
                          color:
                            user.subscription.plan === "pro"
                              ? COLORS.brand.primary
                              : COLORS.text.secondary,
                        }}
                      >
                        {user.subscription.plan === "pro" ? "Pro" : "Free"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        상태
                      </label>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor:
                            user.subscription.status === "active"
                              ? COLORS.status.success + "20"
                              : COLORS.status.error + "20",
                          color:
                            user.subscription.status === "active"
                              ? COLORS.status.success
                              : COLORS.status.error,
                        }}
                      >
                        {user.subscription.status === "active"
                          ? "활성"
                          : user.subscription.status === "canceled"
                          ? "취소됨"
                          : user.subscription.status === "expired"
                          ? "만료됨"
                          : "연체"}
                      </span>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        만료일
                      </label>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.text.primary }}
                      >
                        {user.subscription.expires_at
                          ? new Date(
                              user.subscription.expires_at
                            ).toLocaleDateString("ko-KR")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: COLORS.text.muted }}>
                구독 정보가 없습니다.
              </p>
              <button
                onClick={handleCreateSubscription}
                disabled={isCreatingSubscription}
                className="text-sm px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{
                  backgroundColor: COLORS.brand.primary,
                  color: COLORS.text.white,
                }}
              >
                {isCreatingSubscription ? "생성 중..." : "구독 생성"}
              </button>
            </div>
          )}
        </div>

        {/* 기록 통계 */}
        <div
          className="rounded-xl p-4 sm:p-6 space-y-4"
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
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  Records
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.records_count.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  Daily Feedback
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.daily_feedback_count.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  Weekly Feedback
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.weekly_feedback_count.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: COLORS.text.secondary }}
                >
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
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: COLORS.text.muted }}>
                통계 정보가 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 피드백 관리 */}
        <div
          className="rounded-xl p-4 sm:p-6 space-y-4"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            피드백 관리
          </h2>
          {isLoadingFeedbacks ? (
            <div className="text-center py-8">
              <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
            </div>
          ) : feedbacks ? (
            <div className="space-y-4">
              {/* 일간 피드백 */}
              <div>
                <button
                  onClick={() =>
                    setExpandedSections({
                      ...expandedSections,
                      daily: !expandedSections.daily,
                    })
                  }
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    일간 피드백 (
                    {feedbacks.dailyPagination?.total || feedbacks.daily.length}
                    개)
                  </h3>
                  {expandedSections.daily ? (
                    <ChevronUp
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  )}
                </button>
                {expandedSections.daily && (
                  <div className="mt-3 space-y-3">
                    {feedbacks.daily.length === 0 ? (
                      <p
                        className="text-sm py-4"
                        style={{ color: COLORS.text.muted }}
                      >
                        일간 피드백이 없습니다.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {feedbacks.daily.map((fb) => (
                            <div
                              key={fb.id}
                              className="flex items-center justify-between p-3 rounded-lg"
                              style={{
                                backgroundColor: COLORS.background.hover,
                              }}
                            >
                              <div className="flex-1">
                                <p
                                  className="font-medium"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {new Date(fb.date).toLocaleDateString(
                                    "ko-KR"
                                  )}
                                  {fb.day_of_week && ` (${fb.day_of_week})`}
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  생성:{" "}
                                  {new Date(fb.created_at).toLocaleString(
                                    "ko-KR"
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteFeedback(fb.id, "daily")
                                }
                                className="p-2 rounded-lg hover:bg-opacity-50"
                                style={{
                                  backgroundColor: COLORS.status.error + "20",
                                  color: COLORS.status.error,
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {feedbacks.dailyPagination &&
                          feedbacks.dailyPagination.totalPages > 1 && (
                            <div
                              className="flex items-center justify-between pt-3 border-t"
                              style={{ borderColor: COLORS.border.light }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-sm"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  페이지 {feedbacks.dailyPagination.page} /{" "}
                                  {feedbacks.dailyPagination.totalPages}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setDailyPage((p) => Math.max(1, p - 1))
                                  }
                                  disabled={
                                    feedbacks.dailyPagination.page === 1
                                  }
                                  className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor:
                                      feedbacks.dailyPagination.page === 1
                                        ? COLORS.background.hover
                                        : COLORS.brand.light,
                                    color:
                                      feedbacks.dailyPagination.page === 1
                                        ? COLORS.text.muted
                                        : COLORS.brand.primary,
                                  }}
                                >
                                  이전
                                </button>
                                <button
                                  onClick={() =>
                                    setDailyPage((p) =>
                                      Math.min(
                                        feedbacks.dailyPagination!.totalPages,
                                        p + 1
                                      )
                                    )
                                  }
                                  disabled={
                                    feedbacks.dailyPagination.page ===
                                    feedbacks.dailyPagination.totalPages
                                  }
                                  className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor:
                                      feedbacks.dailyPagination.page ===
                                      feedbacks.dailyPagination.totalPages
                                        ? COLORS.background.hover
                                        : COLORS.brand.light,
                                    color:
                                      feedbacks.dailyPagination.page ===
                                      feedbacks.dailyPagination.totalPages
                                        ? COLORS.text.muted
                                        : COLORS.brand.primary,
                                  }}
                                >
                                  다음
                                </button>
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 주간 피드백 */}
              <div>
                <button
                  onClick={() =>
                    setExpandedSections({
                      ...expandedSections,
                      weekly: !expandedSections.weekly,
                    })
                  }
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    주간 피드백 ({feedbacks.weekly.length}개)
                  </h3>
                  {expandedSections.weekly ? (
                    <ChevronUp
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  )}
                </button>
                {expandedSections.weekly && (
                  <div className="mt-3">
                    {feedbacks.weekly.length === 0 ? (
                      <p
                        className="text-sm py-4"
                        style={{ color: COLORS.text.muted }}
                      >
                        주간 피드백이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {feedbacks.weekly.map((fb) => (
                          <div
                            key={fb.id}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.background.hover }}
                          >
                            <div className="flex-1">
                              <p
                                className="font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {new Date(fb.week_start).toLocaleDateString(
                                  "ko-KR"
                                )}{" "}
                                ~{" "}
                                {new Date(fb.week_end).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: COLORS.text.tertiary }}
                              >
                                생성:{" "}
                                {new Date(fb.created_at).toLocaleString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteFeedback(fb.id, "weekly")
                              }
                              className="p-2 rounded-lg hover:bg-opacity-50"
                              style={{
                                backgroundColor: COLORS.status.error + "20",
                                color: COLORS.status.error,
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 월간 피드백 */}
              <div>
                <button
                  onClick={() =>
                    setExpandedSections({
                      ...expandedSections,
                      monthly: !expandedSections.monthly,
                    })
                  }
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    월간 피드백 ({feedbacks.monthly.length}개)
                  </h3>
                  {expandedSections.monthly ? (
                    <ChevronUp
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: COLORS.text.secondary }}
                    />
                  )}
                </button>
                {expandedSections.monthly && (
                  <div className="mt-3">
                    {feedbacks.monthly.length === 0 ? (
                      <p
                        className="text-sm py-4"
                        style={{ color: COLORS.text.muted }}
                      >
                        월간 피드백이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {feedbacks.monthly.map((fb) => (
                          <div
                            key={fb.id}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.background.hover }}
                          >
                            <div className="flex-1">
                              <p
                                className="font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {fb.month_label || fb.month}
                              </p>
                              {fb.date_range && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  {new Date(
                                    fb.date_range.start_date
                                  ).toLocaleDateString("ko-KR")}{" "}
                                  ~{" "}
                                  {new Date(
                                    fb.date_range.end_date
                                  ).toLocaleDateString("ko-KR")}
                                </p>
                              )}
                              <p
                                className="text-xs mt-1"
                                style={{ color: COLORS.text.tertiary }}
                              >
                                생성:{" "}
                                {new Date(fb.created_at).toLocaleString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteFeedback(fb.id, "monthly")
                              }
                              className="p-2 rounded-lg hover:bg-opacity-50"
                              style={{
                                backgroundColor: COLORS.status.error + "20",
                                color: COLORS.status.error,
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* AI 사용량 통계 */}
        {aiStats && (
          <div
            className="rounded-xl p-4 sm:p-6 space-y-4"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: COLORS.text.primary }}
              >
                AI 사용량 통계
              </h2>
              <button
                onClick={() => router.push(`/admin/ai-usage/${userId}`)}
                className="text-sm px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: COLORS.brand.light,
                  color: COLORS.brand.primary,
                }}
              >
                상세 보기
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <p
                    className="text-xs font-medium mb-1"
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
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <p
                    className="text-xs font-medium mb-1"
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
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <p
                    className="text-xs font-medium mb-1"
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
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.background.hover }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 비용 (KRW)
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text.primary }}
                  >
                    ₩{Math.round(aiStats.total_cost_krw).toLocaleString()}
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
                        label={({ name }: { name?: string }) => {
                          if (!name) return "";
                          const entry = aiStats.by_model.find(
                            (e) => e.model === name
                          );
                          return entry
                            ? `${entry.model}: $${entry.cost_usd.toFixed(2)}`
                            : name;
                        }}
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
