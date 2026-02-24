"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type Modal = {
  id: string;
  title: string;
  image_path: string;
  destination_path: string;
  is_displayed: boolean;
  display_from: string;
  display_until: string | null;
  created_at: string;
};

function getModalImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/admin-modal-images/${path}`;
}

export function ModalManagementSection() {
  const [modals, setModals] = useState<Modal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayingId, setDisplayingId] = useState<string | null>(null);

  const fetchList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApiFetch("/api/admin/update-modals");
      if (!res.ok) throw new Error("목록 조회 실패");
      const data = await res.json();
      setModals(data.modals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDisplay = async (id: string) => {
    setDisplayingId(id);
    try {
      const res = await adminApiFetch(`/api/admin/update-modals/${id}/display`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("노출 설정 실패");
      fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "노출 설정 실패");
    } finally {
      setDisplayingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 모달을 삭제하시겠습니까?")) return;
    try {
      const res = await adminApiFetch(`/api/admin/update-modals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      fetchList();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
          업데이트 모달 관리
        </h2>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          관리자 페이지 방문 시 노출되는 모달입니다. 동시에 1개만 노출됩니다. 이미지 1024x1024 권장.
        </p>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {(showForm || editingId) && (
        <ModalForm
          modalId={editingId}
          onSuccess={() => {
            setShowForm(false);
            setEditingId(null);
            fetchList();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {!showForm && !editingId && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium mb-4"
          style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
        >
          <Plus className="w-4 h-4" />
          모달 추가
        </button>
      )}

      {isLoading && modals.length === 0 ? (
        <div className="py-12 text-center" style={{ color: COLORS.text.secondary }}>
          로딩 중...
        </div>
      ) : (
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
                    미리보기
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    이동 경로
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    노출
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {modals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: COLORS.text.secondary }}>
                      등록된 모달이 없습니다.
                    </td>
                  </tr>
                ) : (
                  modals.map((m) => (
                    <tr
                      key={m.id}
                      style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
                    >
                      <td className="px-4 py-3">
                        <img
                          src={getModalImageUrl(m.image_path)}
                          alt=""
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium" style={{ color: COLORS.text.primary }}>
                          {m.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {m.destination_path}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.is_displayed ? (
                          <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: COLORS.brand.light + "40", color: COLORS.brand.primary }}>
                            노출 중
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDisplay(m.id)}
                            disabled={displayingId !== null}
                            className="text-xs px-2 py-1 rounded border transition-colors"
                            style={{ borderColor: COLORS.border.light }}
                          >
                            {displayingId === m.id ? "적용 중..." : "노출하기"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(m.id);
                              setShowForm(false);
                            }}
                            className="p-1 rounded hover:bg-black/5"
                          >
                            <Pencil className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
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
      )}
    </div>
  );
}

function ModalForm({
  modalId,
  onSuccess,
  onCancel,
}: {
  modalId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [destinationPath, setDestinationPath] = useState("/announcements");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (modalId) {
      adminApiFetch(`/api/admin/update-modals/${modalId}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title ?? "");
          setImagePath(data.image_path ?? "");
          setDestinationPath(data.destination_path ?? "/announcements");
        })
        .catch(() => setError("상세 조회 실패"));
    } else {
      setTitle("");
      setImagePath("");
      setImageFile(null);
      setDestinationPath("/announcements");
    }
  }, [modalId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setImageFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    let finalPath = imagePath;
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await adminApiFetch("/api/admin/announcements/upload-modal", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "이미지 업로드 실패");
      }
      const data = await res.json();
      finalPath = data.path;
    }
    if (!finalPath && !modalId) {
      setError("이미지를 등록해주세요.");
      return;
    }
    if (!destinationPath.trim()) {
      setError("이동 경로를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const path = destinationPath.startsWith("/") ? destinationPath : `/${destinationPath}`;
      if (modalId) {
        const res = await adminApiFetch(`/api/admin/update-modals/${modalId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: title.trim(),
            image_path: finalPath,
            destination_path: path,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "수정 실패");
        }
      } else {
        const res = await adminApiFetch("/api/admin/update-modals", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            image_path: finalPath,
            destination_path: path,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "생성 실패");
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border" style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.card }}>
      <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
        {modalId ? "모달 수정" : "모달 등록"}
      </h3>
      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="모달 제목"
          className="w-full px-3 py-2 rounded-lg border"
          style={{ borderColor: COLORS.border.light }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
          이미지 (1024x1024 권장)
        </label>
        {imagePath && !imageFile && (
          <img
            src={getModalImageUrl(imagePath)}
            alt=""
            className="w-24 h-24 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="block text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
          확인 시 이동 경로
        </label>
        <input
          type="text"
          value={destinationPath}
          onChange={(e) => setDestinationPath(e.target.value)}
          placeholder="/announcements 또는 /announcements/[id]"
          className="w-full px-3 py-2 rounded-lg border"
          style={{ borderColor: COLORS.border.light }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.secondary }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn("px-4 py-2 rounded-lg font-medium", isSubmitting && "opacity-70")}
          style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
        >
          {isSubmitting ? "저장 중..." : modalId ? "수정" : "생성"}
        </button>
      </div>
    </form>
  );
}
