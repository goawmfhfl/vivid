"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDate, formatKSTTime } from "@/lib/date-utils";
import { Edit2 } from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  plan: "free" | "pro";
  status: "active" | "canceled" | "expired" | "past_due";
  expires_at: string | null;
  started_at: string | null;
  canceled_at: string | null;
  current_period_start: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionListResponse {
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [_search, _setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    plan: "free" | "pro" | "";
    status: "active" | "canceled" | "expired" | "past_due" | "";
    expires_at: string;
    current_period_start: string;
    cancel_at_period_end: boolean;
  }>({
    plan: "",
    status: "",
    expires_at: "",
    current_period_start: "",
    cancel_at_period_end: false,
  });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (planFilter) params.append("plan", planFilter);
        if (statusFilter) params.append("status", statusFilter);

        const response = await adminApiFetch(
          `/api/admin/subscriptions?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("구독 목록을 불러오는데 실패했습니다.");
        }
        const data: SubscriptionListResponse = await response.json();
        setSubscriptions(data.subscriptions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [page, planFilter, statusFilter]);

  const handleSave = async (userId: string) => {
    try {
      const response = await adminApiFetch("/api/admin/subscriptions", {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          ...(editData.plan && { plan: editData.plan }),
          ...(editData.status && { status: editData.status }),
          ...(editData.expires_at && { expires_at: editData.expires_at }),
          ...(editData.current_period_start && {
            current_period_start: editData.current_period_start,
          }),
          ...(editData.cancel_at_period_end !== undefined && {
            cancel_at_period_end: editData.cancel_at_period_end,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("구독 정보를 수정하는데 실패했습니다.");
      }

      setIsEditing(null);
      setEditData({
        plan: "",
        status: "",
        expires_at: "",
        current_period_start: "",
        cancel_at_period_end: false,
      });
      // 목록 새로고침
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (planFilter) params.append("plan", planFilter);
      if (statusFilter) params.append("status", statusFilter);
      const refreshResponse = await adminApiFetch(
        `/api/admin/subscriptions?${params.toString()}`
      );
      if (refreshResponse.ok) {
        const data: SubscriptionListResponse = await refreshResponse.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정 실패");
    }
  };

  if (isLoading && subscriptions.length === 0) {
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

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: COLORS.text.primary }}
        >
          구독 관리
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          전체 구독 정보를 확인하고 관리하세요.
        </p>
      </div>

      {/* 필터 */}
      <div
        className="rounded-xl p-4"
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.card,
              color: COLORS.text.primary,
            }}
          >
            <option value="">모든 플랜</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.card,
              color: COLORS.text.primary,
            }}
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="canceled">취소됨</option>
            <option value="expired">만료됨</option>
            <option value="past_due">연체</option>
          </select>
        </div>
      </div>

      {/* 구독 목록 테이블 */}
      {error ? (
        <div className="text-center py-8">
          <p style={{ color: COLORS.status.error }}>{error}</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: COLORS.background.hover,
                    borderBottom: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    유저
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    플랜
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    상태
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    만료일
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    업데이트
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <p className="mb-2">구독 데이터가 없습니다.</p>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        아직 등록된 구독이 없습니다.
                      </p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div style={{ color: COLORS.text.primary }}>
                            {sub.user?.name || "알 수 없음"}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: COLORS.text.muted }}
                          >
                            {sub.user?.email || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === sub.user_id ? (
                          <select
                            value={editData.plan || sub.plan}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                plan: e.target.value as "free" | "pro",
                              })
                            }
                            className="px-3 py-1 rounded border text-sm"
                            style={{
                              borderColor: COLORS.border.input,
                              backgroundColor: COLORS.background.card,
                              color: COLORS.text.primary,
                            }}
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                          </select>
                        ) : (
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor:
                                sub.plan === "pro"
                                  ? COLORS.brand.light
                                  : COLORS.background.hover,
                              color:
                                sub.plan === "pro"
                                  ? COLORS.brand.primary
                                  : COLORS.text.secondary,
                            }}
                          >
                            {sub.plan === "pro" ? "Pro" : "Free"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === sub.user_id ? (
                          <select
                            value={editData.status || sub.status}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                status: e.target.value as
                                  | "active"
                                  | "canceled"
                                  | "expired"
                                  | "past_due",
                              })
                            }
                            className="px-3 py-1 rounded border text-sm"
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
                        ) : (
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor:
                                sub.status === "active"
                                  ? COLORS.status.success + "20"
                                  : COLORS.status.error + "20",
                              color:
                                sub.status === "active"
                                  ? COLORS.status.success
                                  : COLORS.status.error,
                            }}
                          >
                            {sub.status === "active"
                              ? "활성"
                              : sub.status === "canceled"
                              ? "취소됨"
                              : sub.status === "expired"
                              ? "만료됨"
                              : "연체"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === sub.user_id ? (
                          <input
                            type="date"
                            value={
                              editData.expires_at ||
                              (sub.expires_at
                                ? new Date(sub.expires_at)
                                    .toISOString()
                                    .split("T")[0]
                                : "")
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                expires_at: e.target.value,
                              })
                            }
                            className="px-3 py-1 rounded border text-sm"
                            style={{
                              borderColor: COLORS.border.input,
                              backgroundColor: COLORS.background.card,
                              color: COLORS.text.primary,
                            }}
                          />
                        ) : (
                          <span style={{ color: COLORS.text.secondary }}>
                            {sub.expires_at
                              ? new Date(sub.expires_at).toLocaleDateString(
                                  "ko-KR"
                                )
                              : "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {sub.updated_at
                              ? formatKSTDate(sub.updated_at)
                              : "-"}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.tertiary }}
                          >
                            {sub.updated_at
                              ? formatKSTTime(sub.updated_at)
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === sub.user_id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(sub.user_id)}
                              className="px-3 py-1 rounded text-sm"
                              style={{
                                backgroundColor: COLORS.status.success,
                                color: COLORS.text.white,
                              }}
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
                                setEditData({
                                  plan: "",
                                  status: "",
                                  expires_at: "",
                                  current_period_start: "",
                                  cancel_at_period_end: false,
                                });
                              }}
                              className="px-3 py-1 rounded border text-sm"
                              style={{
                                borderColor: COLORS.border.input,
                                backgroundColor: COLORS.background.card,
                                color: COLORS.text.primary,
                              }}
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setIsEditing(sub.user_id);
                              setEditData({
                                plan: sub.plan,
                                status: sub.status,
                                expires_at: sub.expires_at
                                  ? new Date(sub.expires_at)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                current_period_start: sub.current_period_start
                                  ? new Date(sub.current_period_start)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                cancel_at_period_end: sub.cancel_at_period_end,
                              });
                            }}
                            className="p-1 rounded hover:bg-opacity-50"
                            style={{ backgroundColor: COLORS.background.hover }}
                          >
                            <Edit2
                              className="w-4 h-4"
                              style={{ color: COLORS.text.secondary }}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일/태블릿 카드 뷰 */}
          <div className="lg:hidden space-y-3 p-4">
            {subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.text.secondary }} className="mb-2">
                  구독 데이터가 없습니다.
                </p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  아직 등록된 구독이 없습니다.
                </p>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="mb-3">
                    <h3
                      className="font-semibold text-base mb-1"
                      style={{ color: COLORS.text.primary }}
                    >
                      {sub.user?.name || "알 수 없음"}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {sub.user?.email || "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          sub.plan === "pro"
                            ? COLORS.brand.light
                            : COLORS.background.base,
                        color:
                          sub.plan === "pro"
                            ? COLORS.brand.primary
                            : COLORS.text.secondary,
                      }}
                    >
                      {sub.plan === "pro" ? "Pro" : "Free"}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          sub.status === "active"
                            ? COLORS.status.success + "20"
                            : COLORS.status.error + "20",
                        color:
                          sub.status === "active"
                            ? COLORS.status.success
                            : COLORS.status.error,
                      }}
                    >
                      {sub.status === "active"
                        ? "활성"
                        : sub.status === "canceled"
                        ? "취소됨"
                        : sub.status === "expired"
                        ? "만료됨"
                        : "연체"}
                    </span>
                  </div>

                  <div
                    className="space-y-2 mb-3 pb-3 border-b"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        만료일
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {sub.expires_at
                          ? new Date(sub.expires_at).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        업데이트
                      </span>
                      <div className="text-right">
                        <div style={{ color: COLORS.text.primary }}>
                          {sub.updated_at
                            ? new Date(sub.updated_at).toLocaleDateString(
                                "ko-KR"
                              )
                            : "-"}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: COLORS.text.tertiary }}
                        >
                          {sub.updated_at
                            ? new Date(sub.updated_at).toLocaleTimeString(
                                "ko-KR",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing === sub.user_id ? (
                    <div className="space-y-3">
                      <div>
                        <label
                          className="block text-xs mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          플랜
                        </label>
                        <select
                          value={editData.plan || sub.plan}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              plan: e.target.value as "free" | "pro",
                            })
                          }
                          className="w-full px-3 py-2 rounded border text-sm"
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
                          className="block text-xs mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          상태
                        </label>
                        <select
                          value={editData.status || sub.status}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              status: e.target.value as
                                | "active"
                                | "canceled"
                                | "expired"
                                | "past_due",
                            })
                          }
                          className="w-full px-3 py-2 rounded border text-sm"
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
                          className="block text-xs mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          만료일
                        </label>
                        <input
                          type="date"
                          value={
                            editData.expires_at ||
                            (sub.expires_at
                              ? new Date(sub.expires_at)
                                  .toISOString()
                                  .split("T")[0]
                              : "")
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              expires_at: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded border text-sm"
                          style={{
                            borderColor: COLORS.border.input,
                            backgroundColor: COLORS.background.card,
                            color: COLORS.text.primary,
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(sub.user_id)}
                          className="flex-1 px-3 py-2 rounded text-sm font-medium"
                          style={{
                            backgroundColor: COLORS.status.success,
                            color: COLORS.text.white,
                          }}
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setEditData({
                              plan: "",
                              status: "",
                              expires_at: "",
                              current_period_start: "",
                              cancel_at_period_end: false,
                            });
                          }}
                          className="flex-1 px-3 py-2 rounded border text-sm font-medium"
                          style={{
                            borderColor: COLORS.border.input,
                            backgroundColor: COLORS.background.card,
                            color: COLORS.text.primary,
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(sub.user_id);
                        setEditData({
                          plan: sub.plan,
                          status: sub.status,
                          expires_at: sub.expires_at
                            ? new Date(sub.expires_at)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          current_period_start: sub.current_period_start
                            ? new Date(sub.current_period_start)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          cancel_at_period_end: sub.cancel_at_period_end,
                        });
                      }}
                      className="w-full px-3 py-2 rounded border text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        borderColor: COLORS.border.input,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.text.primary,
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      수정
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div
              className="px-4 py-3 flex items-center justify-between border-t"
              style={{ borderColor: COLORS.border.light }}
            >
              <div style={{ color: COLORS.text.secondary }}>
                총 {pagination.total.toLocaleString()}건 중{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                건 표시
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  이전
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border.input,
                    backgroundColor: COLORS.background.card,
                    color: COLORS.text.primary,
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
