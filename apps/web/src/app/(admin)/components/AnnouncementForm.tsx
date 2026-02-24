"use client";

import { useState, useEffect } from "react";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS } from "@/lib/design-system";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageItem = { path: string; url: string; sort_order: number };

interface AnnouncementFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    version?: string;
    images: { id: string; image_path: string; sort_order: number }[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({
  initialData,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [version, setVersion] = useState(initialData?.version ?? "1.0.0");
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initialData?.images ?? []).map((img, i) => ({
      path: img.image_path,
      url: getImageUrl(img.image_path),
      sort_order: i,
    }))
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setVersion(initialData.version ?? "1.0.0");
      setImages(
        (initialData.images ?? []).map((img, i) => ({
          path: img.image_path,
          url: getImageUrl(img.image_path),
          sort_order: i,
        }))
      );
    }
  }, [initialData?.id]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const idx = images.length + i;
      setUploadingIndex(idx);
      try {
        const fd = new FormData();
        fd.append("file", file);
        if (initialData?.id) fd.append("announcementId", initialData.id);
        const res = await adminApiFetch("/api/admin/announcements/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "업로드 실패");
        }
        const { path, url } = await res.json();
        setImages((prev) => [...prev, { path, url, sort_order: prev.length }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "이미지 업로드 실패");
      } finally {
        setUploadingIndex(null);
      }
    }
    e.target.value = "";
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        version: version.trim() || undefined,
        images: images.map((img, i) => ({ image_path: img.path, sort_order: i })),
      };
      if (initialData) {
        const res = await adminApiFetch(
          `/api/admin/announcements/${initialData.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "수정 실패");
        }
      } else {
        const res = await adminApiFetch("/api/admin/announcements", {
          method: "POST",
          body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
        >
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
          placeholder="공지 제목"
          className="w-full px-3 py-2 rounded-lg border"
          style={{ borderColor: COLORS.border.light }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
          버전
        </label>
        <input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
          className="w-full px-3 py-2 rounded-lg border"
          style={{ borderColor: COLORS.border.light }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="공지 설명 (선택)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border"
          style={{ borderColor: COLORS.border.light }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
          이미지 (순서대로 표시, 개수 제한 없음)
        </label>
        <div className="space-y-2">
          {images.map((img, index) => (
            <div
              key={img.path}
              className="flex items-center gap-2 p-2 rounded-lg border"
              style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.card }}
            >
              <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.text.tertiary }} />
              <div className="flex-1 min-w-0">
                <img
                  src={img.url}
                  alt=""
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === images.length - 1}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1 rounded hover:bg-red-50"
                  style={{ color: COLORS.status.error }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {uploadingIndex !== null && (
            <div
              className="flex items-center justify-center p-4 rounded-lg border border-dashed"
              style={{ borderColor: COLORS.border.light }}
            >
              <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                업로드 중...
              </span>
            </div>
          )}
        </div>
        <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
          style={{ backgroundColor: COLORS.brand.light + "40", color: COLORS.brand.primary }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">이미지 추가</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploadingIndex !== null}
          />
        </label>
      </div>
      <div className="flex gap-2 pt-4">
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
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            isSubmitting && "opacity-70"
          )}
          style={{ backgroundColor: COLORS.brand.primary, color: COLORS.text.white }}
        >
          {isSubmitting ? "저장 중..." : initialData ? "수정" : "생성"}
        </button>
      </div>
    </form>
  );
}

function getImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/announcement-images/${path}`;
}
