"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDate, formatKSTTime } from "@/lib/date-utils";
import { Edit2, Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/types/coupon";

interface CouponListResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editData, setEditData] = useState<{
    code: string;
    name: string;
    duration_days: number;
    is_active: boolean;
    max_uses: number | null;
  }>({
    code: "",
    name: "",
    duration_days: 30,
    is_active: true,
    max_uses: null,
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (isActiveFilter) params.append("is_active", isActiveFilter);
        if (codeSearch) params.append("code", codeSearch);

        const response = await adminApiFetch(
          `/api/admin/coupons?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("쿠폰 목록을 불러오는데 실패했습니다.");
        }
        const data: CouponListResponse = await response.json();
        setCoupons(data.coupons);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [page, isActiveFilter, codeSearch]);

  const handleSave = async (couponId: string) => {
    try {
      const response = await adminApiFetch("/api/admin/coupons", {
        method: "PATCH",
        body: JSON.stringify({
          id: couponId,
          ...editData,
        }),
      });

      if (!response.ok) {
        throw new Error("쿠폰 정보를 수정하는데 실패했습니다.");
      }

      setIsEditing(null);
      setEditData({
        code: "",
        name: "",
        duration_days: 30,
        is_active: true,
        max_uses: null,
      });
      // 목록 새로고침
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (isActiveFilter) params.append("is_active", isActiveFilter);
      if (codeSearch) params.append("code", codeSearch);
      const refreshResponse = await adminApiFetch(
        `/api/admin/coupons?${params.toString()}`
      );
      if (refreshResponse.ok) {
        const data: CouponListResponse = await refreshResponse.json();
        setCoupons(data.coupons);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정 실패");
    }
  };

  const handleCreate = async () => {
    try {
      const response = await adminApiFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "쿠폰을 생성하는데 실패했습니다.");
      }

      setIsCreating(false);
      setEditData({
        code: "",
        name: "",
        duration_days: 30,
        is_active: true,
        max_uses: null,
      });
      // 목록 새로고침
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (isActiveFilter) params.append("is_active", isActiveFilter);
      if (codeSearch) params.append("code", codeSearch);
      const refreshResponse = await adminApiFetch(
        `/api/admin/coupons?${params.toString()}`
      );
      if (refreshResponse.ok) {
        const data: CouponListResponse = await refreshResponse.json();
        setCoupons(data.coupons);
        setPagination(data.pagination);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "생성 실패");
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("정말 이 쿠폰을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await adminApiFetch(
        `/api/admin/coupons?id=${couponId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("쿠폰을 삭제하는데 실패했습니다.");
      }

      // 목록 새로고침
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (isActiveFilter) params.append("is_active", isActiveFilter);
      if (codeSearch) params.append("code", codeSearch);
      const refreshResponse = await adminApiFetch(
        `/api/admin/coupons?${params.toString()}`
      );
      if (refreshResponse.ok) {
        const data: CouponListResponse = await refreshResponse.json();
        setCoupons(data.coupons);
        setPagination(data.pagination);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  if (isLoading && coupons.length === 0) {
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            쿠폰 관리
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            쿠폰을 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditData({
              code: "",
              name: "",
              duration_days: 30,
              is_active: true,
              max_uses: null,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
          }}
        >
          <Plus className="w-4 h-4" />
          쿠폰 생성
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div
        className="rounded-xl p-4"
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="쿠폰 코드 검색"
            value={codeSearch}
            onChange={(e) => {
              setCodeSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.card,
              color: COLORS.text.primary,
            }}
          />
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value);
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
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </div>
      </div>

      {/* 쿠폰 생성 폼 */}
      {isCreating && (
        <div
          className="rounded-xl p-6"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            쿠폰 생성
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                쿠폰 코드 *
              </label>
              <input
                type="text"
                value={editData.code}
                onChange={(e) =>
                  setEditData({ ...editData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.card,
                  color: COLORS.text.primary,
                }}
                placeholder="예: WELCOME30"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                쿠폰명 *
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.card,
                  color: COLORS.text.primary,
                }}
                placeholder="예: 신규 가입 환영 쿠폰"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                유효 기간 (일) *
              </label>
              <input
                type="number"
                value={editData.duration_days}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    duration_days: parseInt(e.target.value) || 30,
                  })
                }
                min="1"
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.card,
                  color: COLORS.text.primary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                최대 사용 횟수 (비워두면 무제한)
              </label>
              <input
                type="number"
                value={editData.max_uses || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    max_uses: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                min="1"
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.card,
                  color: COLORS.text.primary,
                }}
                placeholder="무제한"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editData.is_active}
                onChange={(e) =>
                  setEditData({ ...editData, is_active: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label style={{ color: COLORS.text.secondary }}>활성화</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: COLORS.status.success,
                  color: COLORS.text.white,
                }}
              >
                생성
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditData({
                    code: "",
                    name: "",
                    duration_days: 30,
                    is_active: true,
                    max_uses: null,
                  });
                }}
                className="px-4 py-2 rounded-lg border"
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
        </div>
      )}

      {/* 쿠폰 목록 테이블 */}
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
                    코드
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    쿠폰명
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    유효 기간
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
                    사용 횟수
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    생성일
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <p className="mb-2">쿠폰 데이터가 없습니다.</p>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        아직 등록된 쿠폰이 없습니다.
                      </p>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <td className="px-4 py-3">
                        {isEditing === coupon.id ? (
                          <input
                            type="text"
                            value={editData.code}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                code: e.target.value.toUpperCase(),
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
                          <span
                            className="font-mono font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {coupon.code}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === coupon.id ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            className="px-3 py-1 rounded border text-sm w-full"
                            style={{
                              borderColor: COLORS.border.input,
                              backgroundColor: COLORS.background.card,
                              color: COLORS.text.primary,
                            }}
                          />
                        ) : (
                          <span style={{ color: COLORS.text.primary }}>
                            {coupon.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === coupon.id ? (
                          <input
                            type="number"
                            value={editData.duration_days}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                duration_days: parseInt(e.target.value) || 30,
                              })
                            }
                            min="1"
                            className="px-3 py-1 rounded border text-sm w-20"
                            style={{
                              borderColor: COLORS.border.input,
                              backgroundColor: COLORS.background.card,
                              color: COLORS.text.primary,
                            }}
                          />
                        ) : (
                          <span style={{ color: COLORS.text.secondary }}>
                            {coupon.duration_days}일
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === coupon.id ? (
                          <select
                            value={editData.is_active ? "true" : "false"}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                is_active: e.target.value === "true",
                              })
                            }
                            className="px-3 py-1 rounded border text-sm"
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
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: coupon.is_active
                                ? COLORS.status.success + "20"
                                : COLORS.status.error + "20",
                              color: coupon.is_active
                                ? COLORS.status.success
                                : COLORS.status.error,
                            }}
                          >
                            {coupon.is_active ? "활성" : "비활성"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: COLORS.text.secondary }}>
                          {coupon.current_uses}
                          {coupon.max_uses !== null
                            ? ` / ${coupon.max_uses}`
                            : " / 무제한"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {formatKSTDate(coupon.created_at)}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.tertiary }}
                          >
                            {formatKSTTime(coupon.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing === coupon.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(coupon.id)}
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
                                  code: "",
                                  name: "",
                                  duration_days: 30,
                                  is_active: true,
                                  max_uses: null,
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsEditing(coupon.id);
                                setEditData({
                                  code: coupon.code,
                                  name: coupon.name,
                                  duration_days: coupon.duration_days,
                                  is_active: coupon.is_active,
                                  max_uses: coupon.max_uses,
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
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-1 rounded hover:bg-opacity-50"
                              style={{ backgroundColor: COLORS.background.hover }}
                            >
                              <Trash2
                                className="w-4 h-4"
                                style={{ color: COLORS.status.error }}
                              />
                            </button>
                          </div>
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
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.text.secondary }} className="mb-2">
                  쿠폰 데이터가 없습니다.
                </p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  아직 등록된 쿠폰이 없습니다.
                </p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className="font-mono font-semibold text-base mb-1"
                        style={{ color: COLORS.text.primary }}
                      >
                        {coupon.code}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {coupon.name}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: coupon.is_active
                          ? COLORS.status.success + "20"
                          : COLORS.status.error + "20",
                        color: coupon.is_active
                          ? COLORS.status.success
                          : COLORS.status.error,
                      }}
                    >
                      {coupon.is_active ? "활성" : "비활성"}
                    </span>
                  </div>

                  <div
                    className="space-y-2 mb-3 pb-3 border-b"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        유효 기간
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {coupon.duration_days}일
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        사용 횟수
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {coupon.current_uses}
                        {coupon.max_uses !== null
                          ? ` / ${coupon.max_uses}`
                          : " / 무제한"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        생성일
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {formatKSTDate(coupon.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(coupon.id);
                        setEditData({
                          code: coupon.code,
                          name: coupon.name,
                          duration_days: coupon.duration_days,
                          is_active: coupon.is_active,
                          max_uses: coupon.max_uses,
                        });
                      }}
                      className="flex-1 px-3 py-2 rounded border text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        borderColor: COLORS.border.input,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.text.primary,
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="px-3 py-2 rounded border text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        borderColor: COLORS.status.error,
                        backgroundColor: COLORS.background.card,
                        color: COLORS.status.error,
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
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
