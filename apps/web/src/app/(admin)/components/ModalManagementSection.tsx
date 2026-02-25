"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getImageTypeLabel(type: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WebP",
  };
  return map[type] ?? type;
}

export function ModalManagementSection() {
  const [modals, setModals] = useState<Modal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayingId, setDisplayingId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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

  const handleToggleDisplay = async (m: Modal) => {
    if (m.is_displayed) {
      setDisplayingId(m.id);
      try {
        const res = await adminApiFetch(`/api/admin/update-modals/${m.id}`, {
          method: "PATCH",
          body: JSON.stringify({ is_displayed: false }),
        });
        if (!res.ok) throw new Error("노출 해제 실패");
        fetchList();
      } catch (err) {
        setError(err instanceof Error ? err.message : "노출 해제 실패");
      } finally {
        setDisplayingId(null);
      }
    } else {
      handleDisplay(m.id);
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

  const openPreview = (url: string) => setPreviewImageUrl(url);
  const closePreview = () => setPreviewImageUrl(null);

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
                        <div className="flex items-center gap-2">
                          <img
                            src={getModalImageUrl(m.image_path)}
                            alt=""
                            className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openPreview(getModalImageUrl(m.image_path))}
                          />
                          <button
                            type="button"
                            onClick={() => openPreview(getModalImageUrl(m.image_path))}
                            className="text-xs px-2 py-1 rounded border"
                            style={{ borderColor: COLORS.border.light, color: COLORS.text.secondary }}
                          >
                            미리보기
                          </button>
                        </div>
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
                        <div
                          className="inline-flex rounded-lg p-0.5"
                          style={{ backgroundColor: COLORS.background.hover }}
                        >
                          <button
                            type="button"
                            onClick={() => m.is_displayed && handleToggleDisplay(m)}
                            disabled={displayingId !== null}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-l-md transition-all duration-200",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "hover:opacity-90",
                              m.is_displayed && "opacity-70"
                            )}
                            style={
                              !m.is_displayed
                                ? {
                                    backgroundColor: COLORS.brand.primary,
                                    color: COLORS.text.white,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                                  }
                                : { color: COLORS.text.tertiary }
                            }
                          >
                            {displayingId === m.id && m.is_displayed ? "적용 중..." : "꺼짐"}
                          </button>
                          <button
                            type="button"
                            onClick={() => !m.is_displayed && handleDisplay(m.id)}
                            disabled={displayingId !== null}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-r-md transition-all duration-200",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "hover:opacity-90",
                              !m.is_displayed && "opacity-70"
                            )}
                            style={
                              m.is_displayed
                                ? {
                                    backgroundColor: COLORS.brand.primary,
                                    color: COLORS.text.white,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                                  }
                                : { color: COLORS.text.tertiary }
                            }
                          >
                            {displayingId === m.id && !m.is_displayed ? "적용 중..." : "켜짐"}
                          </button>
                        </div>
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

      {/* 이미지 미리보기 모달 - 1024x1024 비율 */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent
          className="w-full max-w-[min(1024px,calc(100vw-2rem))] p-0 overflow-hidden"
          style={{ aspectRatio: "1 / 1" }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            closePreview();
          }}
        >
          <DialogTitle className="sr-only">이미지 미리보기</DialogTitle>
          {previewImageUrl && (
            <>
              <DialogClose asChild>
                <button
                  type="button"
                  onClick={closePreview}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-black/10 transition-colors"
                  style={{ color: COLORS.text.primary, backgroundColor: "rgba(255,255,255,0.9)" }}
                  aria-label="닫기"
                >
                  <X className="w-6 h-6" />
                </button>
              </DialogClose>
              <div className="w-full aspect-square flex items-center justify-center bg-black/5">
                <img
                  src={previewImageUrl}
                  alt="미리보기"
                  className="w-full h-full object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ImageInfo = {
  size: number;
  type: string;
  width?: number;
  height?: number;
};

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
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [destinationPath, setDestinationPath] = useState("/announcements");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetImageState = useCallback(() => {
    setImageFile(null);
    setImageInfo(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (modalId) {
      setImageFile(null);
      setImageInfo(null);
      setImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
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
      setDestinationPath("/announcements");
      setImageFile(null);
      setImageInfo(null);
      setImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [modalId]);

  const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      resetImageState();
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다. (JPEG, PNG, GIF, WebP)");
        return;
      }
      setImageFile(file);
      setError(null);
      const dimensions = await loadImageDimensions(file);
      setImageInfo({
        size: file.size,
        type: file.type,
        width: dimensions.width,
        height: dimensions.height,
      });
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    },
    [resetImageState]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleFileSelect(f ?? null);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFileSelect(f ?? null);
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

  const currentImageUrl = imagePreviewUrl ?? (imagePath ? getModalImageUrl(imagePath) : null);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 rounded-xl border"
      style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.card }}
    >
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

      {/* 이미지 업로드 영역 - 직관적인 UI */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
          이미지 (1024x1024 권장)
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all min-h-[200px] flex flex-col items-center justify-center cursor-pointer",
            isDragOver ? "border-brand opacity-90" : ""
          )}
          style={{
            borderColor: isDragOver ? COLORS.brand.primary : COLORS.border.light,
            backgroundColor: isDragOver ? COLORS.brand.light + "15" : COLORS.background.base,
          }}
          onClick={() => document.getElementById("modal-image-input")?.click()}
        >
          <input
            id="modal-image-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
          {currentImageUrl ? (
            <div className="flex flex-col items-center gap-3 p-4 w-full">
              <img
                src={currentImageUrl}
                alt="미리보기"
                className="max-w-full max-h-[180px] object-contain rounded-lg"
              />
              {imageInfo && (
                <div
                  className="text-xs rounded-lg px-3 py-2 w-full text-center"
                  style={{ backgroundColor: COLORS.background.hover, color: COLORS.text.secondary }}
                >
                  <span>{getImageTypeLabel(imageInfo.type)}</span>
                  <span className="mx-2">·</span>
                  <span>{formatFileSize(imageInfo.size)}</span>
                  {imageInfo.width != null && imageInfo.height != null && (
                    <>
                      <span className="mx-2">·</span>
                      <span>
                        {imageInfo.width} × {imageInfo.height}px
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("modal-image-input")?.click();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ border: `1px solid ${COLORS.border.light}`, color: COLORS.text.secondary }}
                >
                  <Upload className="w-4 h-4" />
                  이미지 변경
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetImageState();
                    setImagePath("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ backgroundColor: COLORS.status.error + "20", color: COLORS.status.error }}
                >
                  제거
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8">
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: COLORS.brand.light + "30" }}
              >
                <ImageIcon className="w-10 h-10" style={{ color: COLORS.brand.primary }} />
              </div>
              <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                클릭하거나 이미지를 끌어다 놓으세요
              </p>
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                JPEG, PNG, GIF, WebP (1024×1024 권장)
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("modal-image-input")?.click();
                }}
                className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
              >
                <Upload className="w-4 h-4" />
                파일 선택
              </button>
            </div>
          )}
        </div>
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
