"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { formatKSTDate } from "@/lib/date-utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AnnouncementForm } from "./AnnouncementForm";

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  display_from: string;
  display_until: string | null;
  is_active: boolean;
  sort_order: number;
  image_count: number;
  created_at: string;
  updated_at: string;
};

export function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Announcement | null>(null);

  const fetchList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApiFetch("/api/admin/announcements");
      if (!res.ok) throw new Error("목록 조회 실패");
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleEdit = async (id: string) => {
    try {
      const res = await adminApiFetch(`/api/admin/announcements/${id}`);
      if (!res.ok) throw new Error("상세 조회 실패");
      const data = await res.json();
      setEditData({
        ...data,
        image_count: (data.images ?? []).length,
      });
      setEditingId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상세 조회 실패");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 공지를 삭제하시겠습니까?")) return;
    try {
      const res = await adminApiFetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      fetchList();
      if (editingId === id) {
        setEditingId(null);
        setEditData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    setEditData(null);
    fetchList();
  };

  if (isLoading && announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: COLORS.brand.primary }}
        />
        <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            공지 관리
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            공지사항을 등록하고 관리합니다. 이미지는 순서대로 표시됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setEditData(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
        >
          <Plus className="w-4 h-4" />
          공지 추가
        </button>
      </div>

      {(showForm || editingId) && (
        <div
          className="rounded-xl p-6 border"
          style={{ ...CARD_STYLES.default, borderColor: COLORS.border.light }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            {editingId ? "공지 수정" : "공지 등록"}
          </h2>
          <AnnouncementForm
            initialData={
              editData
                ? {
                    id: editData.id,
                    title: editData.title,
                    description: editData.description ?? "",
                    version: (editData as { version?: string }).version ?? "1.0.0",
                    images: (editData as { images?: { id: string; image_path: string; sort_order: number }[] })
                      .images ?? [],
                  }
                : undefined
            }
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
              setEditData(null);
            }}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ ...CARD_STYLES.default }}
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
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  제목
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  설명
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  이미지
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  노출 기간
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  생성일
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ color: COLORS.text.secondary }}>
                    등록된 공지가 없습니다.
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: COLORS.text.primary }}>
                        {a.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm line-clamp-2 max-w-xs" style={{ color: COLORS.text.secondary }}>
                        {a.description || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                        {a.image_count}개
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        {formatKSTDate(a.display_from)} ~{" "}
                        {a.display_until ? formatKSTDate(a.display_until) : "무제한"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        {formatKSTDate(a.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(a.id)}
                          className="p-1 rounded hover:bg-black/5"
                        >
                          <Pencil className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: COLORS.status.error }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
