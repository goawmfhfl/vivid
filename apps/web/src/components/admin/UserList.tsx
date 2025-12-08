"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { UserListItem } from "@/types/admin";
import { Search, Filter, ChevronRight } from "lucide-react";

interface UserListResponse {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (search) params.append("search", search);
        if (roleFilter) params.append("role", roleFilter);
        if (activeFilter) params.append("is_active", activeFilter);

        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error("유저 목록을 불러오는데 실패했습니다.");
        }
        const data: UserListResponse = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, roleFilter, activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading && users.length === 0) {
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
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          유저 관리
        </h1>
        <p style={{ color: COLORS.text.tertiary }}>
          전체 유저 목록을 확인하고 관리하세요.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div
        className="rounded-xl p-4"
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: COLORS.text.muted }}
              />
              <input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.card,
                  color: COLORS.text.primary,
                }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.card,
                color: COLORS.text.primary,
              }}
            >
              <option value="">모든 역할</option>
              <option value="user">유저</option>
              <option value="admin">관리자</option>
              <option value="moderator">모더레이터</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
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
        </form>
      </div>

      {/* 유저 목록 테이블 */}
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
          <div className="overflow-x-auto">
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
                    이름
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    이메일
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    역할
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    구독
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    AI 사용량
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    상태
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-opacity-50 transition-colors cursor-pointer"
                    style={{
                      borderBottom: `1px solid ${COLORS.border.light}`,
                    }}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.primary }}>
                        {user.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: COLORS.text.secondary }}>
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
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
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              user.subscription.plan === "pro"
                                ? COLORS.brand.light
                                : COLORS.background.hover,
                            color:
                              user.subscription.plan === "pro"
                                ? COLORS.brand.primary
                                : COLORS.text.secondary,
                          }}
                        >
                          {user.subscription.plan === "pro" ? "Pro" : "Free"}
                        </span>
                      ) : (
                        <span style={{ color: COLORS.text.muted }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.aiUsage ? (
                        <div className="text-xs">
                          <div style={{ color: COLORS.text.primary }}>
                            {user.aiUsage.total_requests.toLocaleString()}회
                          </div>
                          <div style={{ color: COLORS.text.muted }}>
                            ${user.aiUsage.total_cost_usd.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: COLORS.text.muted }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
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
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight
                        className="w-5 h-5"
                        style={{ color: COLORS.text.muted }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div
              className="px-4 py-3 flex items-center justify-between border-t"
              style={{ borderColor: COLORS.border.light }}
            >
              <div style={{ color: COLORS.text.secondary }}>
                총 {pagination.total.toLocaleString()}명 중{" "}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                명 표시
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
