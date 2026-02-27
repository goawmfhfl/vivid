"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/admin-api-client";
import { useRouter } from "next/navigation";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDateLong } from "@/lib/date-utils";
import type { UserDetail, AIUsageStats } from "@/types/admin";
import { QUERY_KEYS } from "@/constants";
import { fetchWeeklyVividList } from "@/hooks/useWeeklyVivid";
import { fetchMonthlyVividList } from "@/hooks/useMonthlyVivid";
import { fetchWeeklyTrends } from "@/hooks/useWeeklyTrends";
import { fetchMonthlyTrends } from "@/hooks/useMonthlyTrends";
import { fetchMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminSelect } from "./AdminSelect";

interface UserDetailProps {
  userId: string;
}

const COLORS_CHART = [
  COLORS.brand.primary,
  COLORS.brand.secondary,
  COLORS.brand.light,
  COLORS.section.insight.primary,
];

/**
 * 생성 시간을 사용자 친화적인 형식으로 포맷팅
 */
function formatGenerationDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)}초`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  
  return `${minutes}분 ${remainingSeconds.toFixed(0)}초`;
}

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [aiStats, setAiStats] = useState<AIUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    role: "" as "user" | "admin",
    is_active: true,
  });
  const [feedbacks, setFeedbacks] = useState<{
    daily: Array<{
      id: string;
      type: "daily";
      feedbackType?: "vivid" | "review";
      date: string;
      day_of_week: string | null;
      created_at: string;
      updated_at: string;
      is_ai_generated: boolean | null;
      generation_duration_seconds?: number | null;
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
      generation_duration_seconds?: number | null;
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
      generation_duration_seconds?: number | null;
    }>;
  } | null>(null);
  const [isRefreshingFeedbacks, setIsRefreshingFeedbacks] = useState(false);
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyLimit] = useState(10);
  const [expandedSections, setExpandedSections] = useState({
    daily: true,
    weekly: true,
    monthly: true,
  });
  const [isEditingSubscription, setIsEditingSubscription] = useState(false);
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [subscriptionEditData, setSubscriptionEditData] = useState({
    plan: "" as "free" | "pro" | "",
    status: "" as "active" | "canceled" | "expired" | "past_due" | "",
    started_at: "",
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

  const fetchFeedbacks = useCallback(async (showLoading = true) => {
    if (!showLoading) {
      setIsRefreshingFeedbacks(true);
    }
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
      console.log("[UserDetail] 피드백 API 응답 전체:", data);
      // weekly 피드백이 제대로 있는지 확인
      if (data && typeof data === "object") {
        console.log("[UserDetail] 피드백 데이터 수신:", {
          daily: data.daily?.length || 0,
          weekly: data.weekly?.length || 0,
          monthly: data.monthly?.length || 0,
          weeklyData: data.weekly,
          weeklyIsArray: Array.isArray(data.weekly),
          weeklyType: typeof data.weekly,
          fullData: data,
        });
        
        // weekly가 배열이 아닌 경우 처리
        const weeklyArray = Array.isArray(data.weekly) ? data.weekly : [];
        
        setFeedbacks({
          daily: data.daily || [],
          dailyPagination: data.dailyPagination,
          weekly: weeklyArray,
          monthly: data.monthly || [],
        });
      } else {
        console.warn("[UserDetail] 예상치 못한 데이터 형식:", data);
      }
    } catch (err) {
      console.error("피드백 목록 조회 실패:", err);
      setFeedbacks({
        daily: [],
        weekly: [],
        monthly: [],
      });
    } finally {
      setIsRefreshingFeedbacks(false);
    }
  }, [dailyLimit, dailyPage, userId]);

  useEffect(() => {
    if (user) {
      // 초기 로딩 상태 없이 데이터만 가져오기
      fetchFeedbacks(false);
    }
  }, [fetchFeedbacks, user]);

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

    // 구독 정보가 없으면 생성
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
    if (!feedbacks) return;

    // Optimistic update: 즉시 UI에서 제거 (로딩창 없이)
    const previousFeedbacks = { ...feedbacks };
    
    if (type === "daily") {
      setFeedbacks({
        ...feedbacks,
        daily: feedbacks.daily.filter((fb) => fb.id !== feedbackId),
      });
    } else if (type === "weekly") {
      setFeedbacks({
        ...feedbacks,
        weekly: feedbacks.weekly.filter((fb) => fb.id !== feedbackId),
      });
    } else if (type === "monthly") {
      setFeedbacks({
        ...feedbacks,
        monthly: feedbacks.monthly.filter((fb) => fb.id !== feedbackId),
      });
    }

    // 백그라운드에서 삭제 요청 (에러 발생 시 롤백, 로딩 상태 표시 없음)
    // setIsLoadingFeedbacks를 호출하지 않아서 로딩 상태가 표시되지 않음
    try {
      const response = await adminApiFetch(
        `/api/admin/users/${userId}/feedbacks/${feedbackId}?type=${type}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        // 실패 시 이전 상태로 롤백
        setFeedbacks(previousFeedbacks);
        throw new Error("피드백 삭제에 실패했습니다.");
      }

      // 삭제 성공 시 관련 캐시 무효화 및 강제 새로고침
      if (type === "daily") {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      } else if (type === "weekly") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.WEEKLY_VIVID, "list"],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.WEEKLY_CANDIDATES],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.WEEKLY_VIVID, "recent-trends"],
        });
        void Promise.allSettled([
          queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.WEEKLY_VIVID, "list"],
            queryFn: () => fetchWeeklyVividList({ force: true }),
          }),
          queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.WEEKLY_VIVID, "recent-trends"],
            queryFn: () => fetchWeeklyTrends({ force: true }),
          }),
          queryClient.refetchQueries({
            queryKey: [QUERY_KEYS.WEEKLY_CANDIDATES],
          }),
        ]);
      } else if (type === "monthly") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.MONTHLY_VIVID, "recent-trends"],
        });
        void Promise.allSettled([
          queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
            queryFn: () => fetchMonthlyVividList({ force: true }),
          }),
          queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.MONTHLY_VIVID, "recent-trends"],
            queryFn: () => fetchMonthlyTrends({ force: true }),
          }),
          queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
            queryFn: () => fetchMonthlyCandidates({ force: true }),
          }),
        ]);
      }

      // 성공 시 사용자 통계도 업데이트 (선택적)
      if (user?.stats) {
        const currentStats = user.stats;
        if (type === "daily" && currentStats.daily_vivid_count > 0) {
          setUser({
            ...user,
            stats: {
              records_count: currentStats.records_count,
              daily_vivid_count: currentStats.daily_vivid_count - 1,
              weekly_vivid_count: currentStats.weekly_vivid_count,
              monthly_vivid_count: currentStats.monthly_vivid_count,
            },
          });
        } else if (type === "weekly" && currentStats.weekly_vivid_count > 0) {
          setUser({
            ...user,
            stats: {
              records_count: currentStats.records_count,
              daily_vivid_count: currentStats.daily_vivid_count,
              weekly_vivid_count: currentStats.weekly_vivid_count - 1,
              monthly_vivid_count: currentStats.monthly_vivid_count,
            },
          });
        } else if (type === "monthly" && currentStats.monthly_vivid_count > 0) {
          setUser({
            ...user,
            stats: {
              records_count: currentStats.records_count,
              daily_vivid_count: currentStats.daily_vivid_count,
              weekly_vivid_count: currentStats.weekly_vivid_count,
              monthly_vivid_count: currentStats.monthly_vivid_count - 1,
            },
          });
        }
      }
    } catch (err) {
      // 에러 발생 시 이전 상태로 롤백
      setFeedbacks(previousFeedbacks);
      // 조용히 실패 (사용자에게 알림 없음)
      console.error("피드백 삭제 실패:", err);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!user?.subscription) {
      alert("구독 정보가 없습니다.");
      return;
    }

    setIsSavingSubscription(true);

    try {
      const updatePayload: {
        userId: string;
        plan?: string;
        status?: string;
        started_at?: string | null;
        expires_at?: string | null;
      } = {
        userId: user.id,
        plan: subscriptionEditData.plan || undefined,
        status: subscriptionEditData.status || undefined,
        started_at:
          subscriptionEditData.started_at !== undefined
            ? subscriptionEditData.started_at || null
            : undefined,
        expires_at:
          subscriptionEditData.expires_at !== undefined
            ? subscriptionEditData.expires_at || null
            : undefined,
      };

      const response = await adminApiFetch("/api/admin/subscriptions", {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail =
          errorData.received != null
            ? ` (수신값: ${JSON.stringify(errorData.received)})`
            : "";
        throw new Error(
          (errorData.error || "구독 정보를 수정하는데 실패했습니다.") + detail
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
        started_at: "",
        expires_at: "",
      });
      alert("구독 정보가 성공적으로 수정되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "구독 정보 수정 실패");
    } finally {
      setIsSavingSubscription(false);
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
                  {user.role === "admin" ? "관리자" : "유저"}
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
                      role: e.target.value as "user" | "admin",
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
                  formatKSTDateLong(user.last_login_at)
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
                    started_at: user.subscription!.started_at
                      ? new Date(user.subscription!.started_at)
                          .toISOString()
                          .split("T")[0]
                      : "",
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
                  <AdminSelect
                    label="플랜"
                    value={subscriptionEditData.plan}
                    onChange={(e) =>
                      setSubscriptionEditData({
                        ...subscriptionEditData,
                        plan: e.target.value as "free" | "pro",
                      })
                    }
                    options={[
                      { value: "free", label: "Free" },
                      { value: "pro", label: "Pro" },
                    ]}
                  />
                  <AdminSelect
                    label="상태"
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
                    options={[
                      { value: "none", label: "없음" },
                      { value: "active", label: "활성" },
                      { value: "canceled", label: "취소됨" },
                      { value: "expired", label: "만료됨" },
                      { value: "past_due", label: "연체" },
                    ]}
                  />
                  <div>
                    <label
                      className="text-xs font-medium block mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      구독 시작일
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={subscriptionEditData.started_at}
                        onChange={(e) =>
                          setSubscriptionEditData({
                            ...subscriptionEditData,
                            started_at: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border text-base min-w-0"
                        style={{
                          borderColor: COLORS.border.input,
                          backgroundColor: COLORS.background.card,
                          color: COLORS.text.primary,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSubscriptionEditData({
                            ...subscriptionEditData,
                            started_at: "",
                          })
                        }
                        className="px-3 py-2 text-sm rounded-lg shrink-0"
                        style={{
                          color: COLORS.text.secondary,
                          backgroundColor: COLORS.background.hover,
                        }}
                      >
                        지우기
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                      비어 있으면 Pro로 인정되지 않음
                    </p>
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium block mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      만료일
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={subscriptionEditData.expires_at}
                        onChange={(e) =>
                          setSubscriptionEditData({
                            ...subscriptionEditData,
                            expires_at: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border text-base min-w-0"
                        style={{
                          borderColor: COLORS.border.input,
                          backgroundColor: COLORS.background.card,
                          color: COLORS.text.primary,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSubscriptionEditData({
                            ...subscriptionEditData,
                            expires_at: "",
                          })
                        }
                        className="px-3 py-2 text-sm rounded-lg shrink-0"
                        style={{
                          color: COLORS.text.secondary,
                          backgroundColor: COLORS.background.hover,
                        }}
                      >
                        지우기
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                      비어 있으면 Pro로 인정되지 않음
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateSubscription}
                      disabled={isSavingSubscription}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: COLORS.status.success,
                        color: COLORS.text.white,
                      }}
                    >
                      {isSavingSubscription ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                          />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          저장
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSubscription(false);
                        setSubscriptionEditData({
                          plan: "",
                          status: "",
                          started_at: "",
                          expires_at: "",
                        });
                      }}
                      disabled={isSavingSubscription}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50"
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
                <div className="space-y-4">
                  {/* 구독 요약 카드 */}
                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl"
                    style={{
                      backgroundColor: COLORS.background.hover,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: COLORS.text.tertiary }}>
                        플랜
                      </p>
                      <span
                        className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold"
                        style={{
                          backgroundColor:
                            user.subscription.plan === "pro"
                              ? COLORS.brand.light
                              : COLORS.background.cardElevated,
                          color:
                            user.subscription.plan === "pro"
                              ? COLORS.brand.primary
                              : COLORS.text.secondary,
                        }}
                      >
                        {user.subscription.plan === "pro" ? "Pro" : "Free"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: COLORS.text.tertiary }}>
                        상태
                      </p>
                      <span
                        className="inline-block px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor:
                            user.subscription.status === "active"
                              ? COLORS.status.success + "25"
                              : user.subscription.status === "expired"
                              ? COLORS.status.error + "25"
                              : COLORS.background.cardElevated,
                          color:
                            user.subscription.status === "active"
                              ? COLORS.status.success
                              : user.subscription.status === "expired"
                              ? COLORS.status.error
                              : COLORS.text.secondary,
                        }}
                      >
                        {user.subscription.status === "active"
                          ? "활성"
                          : user.subscription.status === "canceled"
                          ? "취소됨"
                          : user.subscription.status === "expired"
                          ? "만료됨"
                          : user.subscription.status === "past_due"
                          ? "연체"
                          : user.subscription.status === "none"
                          ? "없음"
                          : user.subscription.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: COLORS.text.tertiary }}>
                        구독 시작일
                      </p>
                      <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                        {user.subscription.started_at
                          ? new Date(user.subscription.started_at).toLocaleDateString("ko-KR")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: COLORS.text.tertiary }}>
                        만료일
                      </p>
                      <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                        {user.subscription.expires_at
                          ? new Date(user.subscription.expires_at).toLocaleDateString("ko-KR")
                          : "무기한"}
                      </p>
                      {user.subscription.expires_at &&
                        user.subscription.status === "active" &&
                        (() => {
                          const exp = new Date(user.subscription!.expires_at!);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          exp.setHours(0, 0, 0, 0);
                          const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          return daysLeft >= 0 ? (
                            <span className="text-xs block mt-0.5" style={{ color: COLORS.text.tertiary }}>
                              D-{daysLeft} 남음
                            </span>
                          ) : null;
                        })()}
                    </div>
                  </div>
                </div>
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
                  {user.stats.daily_vivid_count.toLocaleString()}
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
                  주간 Vivid
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.weekly_vivid_count.toLocaleString()}
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
                  Monthly Vivid
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {user.stats.monthly_vivid_count.toLocaleString()}
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
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: COLORS.text.primary }}
            >
              피드백 관리
            </h2>
            <button
              onClick={() => fetchFeedbacks(false)}
              disabled={isRefreshingFeedbacks}
              className="p-2 rounded-lg hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: COLORS.background.hover }}
              title="새로고침"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshingFeedbacks ? "animate-spin" : ""}`}
                style={{ color: COLORS.text.primary }}
              />
            </button>
          </div>
          {feedbacks ? (
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
                                  className="font-medium flex items-center gap-2"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {new Date(fb.date).toLocaleDateString(
                                    "ko-KR"
                                  )}
                                  {fb.day_of_week && ` (${fb.day_of_week})`}
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                    style={{
                                      backgroundColor:
                                        fb.feedbackType === "review"
                                          ? COLORS.chart.execution + "30"
                                          : COLORS.chart.alignment + "30",
                                      color:
                                        fb.feedbackType === "review"
                                          ? COLORS.chart.execution
                                          : COLORS.chart.alignment,
                                    }}
                                  >
                                    {fb.feedbackType === "review" ? "회고" : "비비드"}
                                  </span>
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  생성:{" "}
                                  {new Date(fb.created_at).toLocaleString(
                                    "ko-KR"
                                  )}
                                  {fb.generation_duration_seconds && (
                                    <span style={{ color: COLORS.text.secondary }}>
                                      {" "}
                                      (소요: {formatGenerationDuration(fb.generation_duration_seconds)})
                                    </span>
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

              {/* 주간 vivid */}
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
                    주간 vivid ({feedbacks.weekly.length}개)
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
                        주간 vivid가 없습니다.
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
                                  "ko-KR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}{" "}
                                ~{" "}
                                {new Date(fb.week_end).toLocaleDateString(
                                  "ko-KR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <p
                                  className="text-xs"
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  생성:{" "}
                                  {new Date(fb.created_at).toLocaleString(
                                    "ko-KR"
                                  )}
                                  {fb.generation_duration_seconds && (
                                    <span style={{ color: COLORS.text.secondary }}>
                                      {" "}
                                      (소요: {formatGenerationDuration(fb.generation_duration_seconds)})
                                    </span>
                                  )}
                                </p>
                                {fb.is_ai_generated && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: `${COLORS.brand.primary}20`,
                                      color: COLORS.brand.primary,
                                    }}
                                  >
                                    AI 생성
                                  </span>
                                )}
                              </div>
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

              {/* 월간 vivid */}
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
                    월간 vivid ({feedbacks.monthly.length}개)
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
                        월간 vivid가 없습니다.
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
                                {fb.generation_duration_seconds && (
                                  <span style={{ color: COLORS.text.secondary }}>
                                    {" "}
                                    (소요: {formatGenerationDuration(fb.generation_duration_seconds)})
                                  </span>
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
