"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { COLORS, CARD_STYLES, SPACING, TYPOGRAPHY } from "@/lib/design-system";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ImagePlus,
  Send,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type {
  CreateInquiryRequest,
  Inquiry,
  InquiryStatus,
  InquiryType,
} from "@/types/inquiry";
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS } from "@/types/inquiry";

function InquiryPageContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceAtIndexRef = useRef<number | null>(null);
  const replacePreviewIdRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "list">("create");

  // 내가 남긴 문의 조회 관련 상태
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [myInquiriesLoading, setMyInquiriesLoading] = useState(false);
  const [myInquiriesError, setMyInquiriesError] = useState<string | null>(null);
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);
  const [myInquiriesPage, setMyInquiriesPage] = useState(1);
  const [myInquiriesTotalPages, setMyInquiriesTotalPages] = useState(1);
  const [shouldReloadMyInquiries, setShouldReloadMyInquiries] = useState(0);

  // 이미지 모달 (내가 남긴 문의 보기용)
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({ isOpen: false, images: [], currentIndex: 0 });

  const [type, setType] = useState<InquiryType>("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]); // 서버에 업로드된 이미지 URL
  const [previewImages, setPreviewImages] = useState<Array<{ id: string; url: string; file: File; error?: string }>>([]); // 로컬 미리보기 (에러 상태 포함)
  const [uploadingImages, setUploadingImages] = useState<string[]>([]); // 업로드 중인 이미지 ID
  const [replaceUploadingIndex, setReplaceUploadingIndex] = useState<number | null>(null); // 교체 업로드 중인 이미지 인덱스
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isContentFocused, setIsContentFocused] = useState(false);

  const inquiryTypes: InquiryType[] = useMemo(
    () => ["bug", "feature", "question", "payment", "account", "other"],
    []
  );

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case "pending":
        return COLORS.status.warning;
      case "in_progress":
        return COLORS.brand.primary;
      case "resolved":
        return COLORS.status.success;
      case "closed":
        return COLORS.text.tertiary;
    }
  };

  const fetchMyInquiries = async () => {
    setMyInquiriesLoading(true);
    setMyInquiriesError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const params = new URLSearchParams({
        page: myInquiriesPage.toString(),
        limit: "20",
      });

      const response = await fetch(`/api/inquiries?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "문의사항 목록을 불러오는데 실패했습니다.");
      }

      const data = (await response.json()) as {
        inquiries: Inquiry[];
        pagination: { totalPages: number };
      };

      setMyInquiries(data.inquiries || []);
      setMyInquiriesTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setMyInquiriesError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setMyInquiriesLoading(false);
    }
  };

  // 탭이 list일 때만 조회
  useEffect(() => {
    if (activeTab !== "list") return;
    fetchMyInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, myInquiriesPage, shouldReloadMyInquiries]);

  // 이미지 모달 키보드 네비게이션 (list 탭)
  useEffect(() => {
    if (!imageModal.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && imageModal.currentIndex > 0) {
        setImageModal((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
      } else if (
        e.key === "ArrowRight" &&
        imageModal.currentIndex < imageModal.images.length - 1
      ) {
        setImageModal((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      } else if (e.key === "Escape") {
        setImageModal({ isOpen: false, images: [], currentIndex: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageModal.isOpen, imageModal.currentIndex, imageModal.images.length]);

  const handleImageUpload = async (
    previewId: string,
    file: File,
    options?: { insertAt?: number }
  ) => {
    setUploadingImages((prev) => [...prev, previewId]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/inquiries/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "이미지 업로드에 실패했습니다.";
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result || !result.url) {
        throw new Error("이미지 URL을 받아오지 못했습니다.");
      }

      if (typeof result.url !== "string" || result.url.trim() === "") {
        throw new Error("유효하지 않은 이미지 URL입니다.");
      }

      setPreviewImages((prev) => {
        const preview = prev.find((img) => img.id === previewId);
        if (preview) {
          URL.revokeObjectURL(preview.url);
        }
        return prev.filter((img) => img.id !== previewId);
      });
      const insertAt = options?.insertAt;
      if (insertAt !== undefined) {
        setImages((prev) => [
          ...prev.slice(0, insertAt),
          result.url,
          ...prev.slice(insertAt),
        ]);
      } else {
        setImages((prev) => [...prev, result.url]);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "이미지 업로드 중 오류가 발생했습니다.";
      console.error("이미지 업로드 실패:", err);
      setPreviewImages((prev) =>
        prev.map((img) =>
          img.id === previewId ? { ...img, error: errorMessage } : img
        )
      );
      setError(`이미지 업로드 실패: ${errorMessage}`);
    } finally {
      setUploadingImages((prev) => prev.filter((id) => id !== previewId));
    }
  };

  const handleUploadForReplace = async (index: number, file: File) => {
    setReplaceUploadingIndex(index);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/inquiries/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
      }

      const result = await response.json();
      if (!result?.url) {
        throw new Error("이미지 URL을 받아오지 못했습니다.");
      }

      setImages((prev) =>
        prev.map((url, i) => (i === index ? result.url : url))
      );
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "이미지 변경 중 오류가 발생했습니다.";
      setError(`이미지 변경 실패: ${errorMessage}`);
      console.error("이미지 교체 실패:", err);
    } finally {
      setReplaceUploadingIndex(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const replaceAtIndex = replaceAtIndexRef.current;
    const replacePreviewId = replacePreviewIdRef.current;
    replaceAtIndexRef.current = null;
    replacePreviewIdRef.current = null;

    const file = files[0];

    // 파일 유효성 검사
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 교체 모드: 서버 이미지
    if (replaceAtIndex !== null) {
      handleUploadForReplace(replaceAtIndex, file);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 교체 모드: 미리보기 (원래 그리드 위치 유지)
    if (replacePreviewId !== null) {
      const previewIndex = previewImages.findIndex(
        (p) => p.id === replacePreviewId
      );
      const insertAt =
        previewIndex >= 0 ? images.length + previewIndex : undefined;

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewImages((prev) => {
        const preview = prev.find((img) => img.id === replacePreviewId);
        if (preview) {
          URL.revokeObjectURL(preview.url);
        }
        return prev.map((p) =>
          p.id === replacePreviewId
            ? { ...p, url: newPreviewUrl, file, error: undefined }
            : p
        );
      });
      handleImageUpload(replacePreviewId, file, { insertAt });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 추가 모드
    Array.from(files).forEach((f) => {
      const currentCount =
        images.length + previewImages.length + uploadingImages.length;
      if (currentCount >= 5) {
        alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }

      const previewId = `preview-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(f);

      setPreviewImages((prev) => [
        ...prev,
        { id: previewId, url: previewUrl, file: f },
      ]);

      handleImageUpload(previewId, f);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  const handleRemovePreview = (previewId: string) => {
    setPreviewImages((prev) => {
      const preview = prev.find((img) => img.id === previewId);
      if (preview) {
        URL.revokeObjectURL(preview.url); // 메모리 해제
      }
      return prev.filter((img) => img.id !== previewId);
    });
    // 업로드 중이면 취소
    setUploadingImages((prev) => prev.filter((id) => id !== previewId));
  };

  const handleRetryUpload = (previewId: string) => {
    const preview = previewImages.find((img) => img.id === previewId);
    if (!preview) return;

    // 에러 상태 제거
    setPreviewImages((prev) =>
      prev.map((img) =>
        img.id === previewId ? { ...img, error: undefined } : img
      )
    );

    // 업로드 재시도
    handleImageUpload(previewId, preview.file);
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      previewImages.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previewImages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (uploadingImages.length > 0 || previewImages.length > 0 || replaceUploadingIndex !== null) {
      setError("이미지 업로드가 완료될 때까지 기다려주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Supabase 세션 가져오기
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const requestBody: CreateInquiryRequest = {
        type,
        title: title.trim(),
        content: content.trim(),
        images,
      };

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "문의사항 제출에 실패했습니다.");
      }

      alert("문의사항이 성공적으로 제출되었습니다. 감사합니다!");

      // 폼 리셋 & '내가 남긴 문의 보기'로 이동
      setType("question");
      setTitle("");
      setContent("");
      setImages([]);
      setPreviewImages([]);
      setUploadingImages([]);
      setExpandedInquiryId(null);
      setMyInquiriesPage(1);
      setActiveTab("list");
      setShouldReloadMyInquiries((v) => v + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문의사항 제출 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="문의사항" showBackButton={true} />

      {/* 탭 버튼 */}
      <div
        className="mt-6 rounded-xl p-2 flex gap-2"
        style={{ ...CARD_STYLES.default }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={cn(
            "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === "create" ? "text-white" : "border"
          )}
          style={{
            backgroundColor:
              activeTab === "create" ? COLORS.brand.primary : "transparent",
            borderColor:
              activeTab === "create" ? COLORS.brand.primary : COLORS.border.input,
            color:
              activeTab === "create" ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          문의사항 남기기
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={cn(
            "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === "list" ? "text-white" : "border"
          )}
          style={{
            backgroundColor:
              activeTab === "list" ? COLORS.brand.primary : "transparent",
            borderColor:
              activeTab === "list" ? COLORS.brand.primary : COLORS.border.input,
            color: activeTab === "list" ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          내가 남긴 문의 보기
        </button>
      </div>

      {activeTab === "create" ? (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {error && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: COLORS.status.error + "20",
                border: `1px solid ${COLORS.status.error}`,
              }}
            >
              <p style={{ color: COLORS.status.error }}>{error}</p>
            </div>
          )}

          {/* 문의사항 타입 선택 */}
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              문의사항 종류
            </label>
            <div className="grid grid-cols-2 gap-2">
              {inquiryTypes.map((inquiryType) => (
                <button
                  key={inquiryType}
                  type="button"
                  onClick={() => setType(inquiryType)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    type === inquiryType ? "text-white" : "border"
                  )}
                  style={{
                    backgroundColor:
                      type === inquiryType ? COLORS.brand.primary : "transparent",
                    borderColor:
                      type === inquiryType
                        ? COLORS.brand.primary
                        : COLORS.border.input,
                    color:
                      type === inquiryType
                        ? COLORS.text.white
                        : COLORS.text.primary,
                  }}
                >
                  {INQUIRY_TYPE_LABELS[inquiryType]}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              placeholder="문의사항 제목을 입력하세요"
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none"
              style={{
                borderColor: isTitleFocused
                  ? COLORS.brand.primary
                  : COLORS.border.input,
                borderWidth: isTitleFocused ? "2px" : "1.5px",
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
                boxShadow: isTitleFocused
                  ? `0 0 0 3px ${COLORS.brand.primary}20`
                  : "none",
              }}
            />
          </div>

          {/* 내용 입력 */}
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              onFocus={() => setIsContentFocused(true)}
              onBlur={() => setIsContentFocused(false)}
              placeholder="문의사항 내용을 자세히 작성해주세요."
              rows={10}
              className="w-full px-4 py-3 rounded-lg border resize-none transition-all outline-none"
              style={{
                borderColor: isContentFocused
                  ? COLORS.brand.primary
                  : COLORS.border.input,
                borderWidth: isContentFocused ? "2px" : "1.5px",
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
                boxShadow: isContentFocused
                  ? `0 0 0 3px ${COLORS.brand.primary}20`
                  : "none",
              }}
            />
          </div>

          {/* 이미지 업로드 */}
          <div
            className="rounded-xl p-6"
            style={{
              ...CARD_STYLES.default,
            }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              이미지 첨부 (선택사항, 최대 5개)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs mb-2" style={{ color: COLORS.text.muted }}>
              JPEG, PNG, GIF, WebP · 파일당 5MB 이하
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                images.length + previewImages.length + uploadingImages.length >= 5
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              style={{
                borderColor: COLORS.border.input,
                color: COLORS.text.secondary,
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = COLORS.brand.primary;
                  e.currentTarget.style.color = COLORS.brand.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = COLORS.border.input;
                  e.currentTarget.style.color = COLORS.text.secondary;
                }
              }}
            >
              <Upload className="w-5 h-5" />
              <span>이미지 선택</span>
            </button>

            {/* 이미지 미리보기 */}
            {(images.length > 0 || previewImages.length > 0) && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {/* 서버에 업로드된 이미지 */}
                {images.map((url, index) => (
                  <div
                    key={`uploaded-${index}-${url}`}
                    className="relative aspect-square overflow-hidden rounded-lg border"
                    style={{
                      borderColor: COLORS.border.light,
                      backgroundColor: COLORS.background.hover,
                    }}
                  >
                    <Image
                      src={url}
                      alt={`첨부 이미지 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 120px"
                      className="object-contain"
                      unoptimized
                      style={{ objectPosition: "center" }}
                    />
                    {replaceUploadingIndex === index && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[5]"
                        style={{ backdropFilter: "blur(2px)" }}
                      >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mx-auto mb-1" />
                          <p className="text-xs text-white">변경 중...</p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute left-1.5 top-1.5 z-10 p-2 rounded-full transition-opacity hover:opacity-90 shadow-lg"
                      style={{
                        color: COLORS.text.white,
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        replaceAtIndexRef.current = index;
                        fileInputRef.current?.click();
                      }}
                      className="absolute right-1.5 bottom-1.5 z-10 p-2 rounded-full transition-opacity hover:opacity-90 shadow-lg"
                      style={{
                        color: COLORS.text.white,
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      title="새로 업로드"
                    >
                      <ImagePlus className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                ))}

                {/* 로컬 미리보기 (업로드 전) */}
                {previewImages.map((preview) => (
                  <div
                    key={preview.id}
                    className="relative aspect-square rounded-lg border overflow-hidden"
                    style={{
                      borderColor: preview.error
                        ? COLORS.status.error
                        : COLORS.border.input,
                      backgroundColor: COLORS.background.hover,
                    }}
                  >
                    <Image
                      src={preview.url}
                      alt="미리보기"
                      fill
                      sizes="(max-width: 768px) 33vw, 120px"
                      className="object-contain"
                      unoptimized
                      style={{ objectPosition: "center" }}
                    />
                    {/* 업로드 중 오버레이 */}
                    {uploadingImages.includes(preview.id) && !preview.error && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"
                        style={{ backdropFilter: "blur(2px)" }}
                      >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mx-auto mb-1" />
                          <p className="text-xs text-white">업로드 중...</p>
                        </div>
                      </div>
                    )}
                    {/* 에러 상태 오버레이 */}
                    {preview.error && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 p-2"
                        style={{ backdropFilter: "blur(2px)" }}
                      >
                        <XCircle
                          className="w-5 h-5 mb-1"
                          style={{ color: COLORS.status.error }}
                        />
                        <p
                          className="text-xs text-white text-center mb-1"
                          style={{ lineHeight: "1.2" }}
                        >
                          {preview.error.length > 20
                            ? preview.error.substring(0, 20) + "..."
                            : preview.error}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryUpload(preview.id);
                          }}
                          className="text-xs px-2 py-0.5 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                          style={{ color: "white" }}
                        >
                          재시도
                        </button>
                      </div>
                    )}
                    {/* 삭제/새로 업로드 버튼 (업로드 완료 또는 에러 시) */}
                    {!uploadingImages.includes(preview.id) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemovePreview(preview.id)}
                          className="absolute left-1.5 top-1.5 z-10 p-2 rounded-full transition-opacity hover:opacity-90"
                          style={{
                            color: COLORS.text.white,
                            backgroundColor: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(4px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          }}
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            replacePreviewIdRef.current = preview.id;
                            fileInputRef.current?.click();
                          }}
                          className="absolute right-1.5 bottom-1.5 z-10 p-2 rounded-full transition-opacity hover:opacity-90"
                          style={{
                            color: COLORS.text.white,
                            backgroundColor: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(4px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          }}
                          title="새로 업로드"
                        >
                          <ImagePlus className="w-5 h-5" strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              style={{
                color: COLORS.text.secondary,
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.hover,
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background.hoverLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !content.trim() ||
                uploadingImages.length > 0 ||
                previewImages.length > 0 ||
                replaceUploadingIndex !== null
              }
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "제출 중..." : "제출하기"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          {myInquiriesError && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: COLORS.status.error + "20",
                border: `1px solid ${COLORS.status.error}`,
              }}
            >
              <p style={{ color: COLORS.status.error }}>{myInquiriesError}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              내가 남긴 문의 목록
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShouldReloadMyInquiries((v) => v + 1)}
              style={{
                borderColor: COLORS.border.input,
                color: COLORS.text.secondary,
                backgroundColor: COLORS.background.hover,
              }}
            >
              새로고침
            </Button>
          </div>

          {myInquiriesLoading ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ ...CARD_STYLES.default }}
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3"
                style={{ borderColor: COLORS.brand.primary }}
              />
              <p style={{ color: COLORS.text.secondary }}>불러오는 중...</p>
            </div>
          ) : myInquiries.length === 0 ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ ...CARD_STYLES.default }}
            >
              <p style={{ color: COLORS.text.secondary }}>
                아직 남긴 문의가 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myInquiries.map((inquiry) => {
                const isExpanded = expandedInquiryId === inquiry.id;
                const statusColor = getStatusColor(inquiry.status);

                return (
                  <div
                    key={inquiry.id}
                    className="rounded-xl p-6"
                    style={{ ...CARD_STYLES.default }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: statusColor + "20",
                              color: statusColor,
                            }}
                          >
                            {INQUIRY_STATUS_LABELS[inquiry.status]}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: COLORS.background.hover,
                              color: COLORS.text.secondary,
                            }}
                          >
                            {INQUIRY_TYPE_LABELS[inquiry.type]}
                          </span>
                        </div>

                        <p
                          className={cn(
                            TYPOGRAPHY.h3.fontSize,
                            TYPOGRAPHY.h3.fontWeight,
                            "truncate"
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {inquiry.title}
                        </p>

                        <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                          {new Date(inquiry.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedInquiryId(isExpanded ? null : inquiry.id)}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {isExpanded ? "접기" : "자세히"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div
                        className="pt-4 mt-4 space-y-4 border-t"
                        style={{ borderColor: COLORS.border.light }}
                      >
                        <div>
                          <p
                            className="text-sm whitespace-pre-wrap"
                            style={{ color: COLORS.text.primary }}
                          >
                            {inquiry.content}
                          </p>
                        </div>

                        {inquiry.images?.length > 0 && (
                          <div>
                            <p
                              className="text-sm font-medium mb-2 flex items-center gap-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              <ImageIcon className="w-4 h-4" />
                              첨부 이미지 ({inquiry.images.length})
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                              {inquiry.images.map((url, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() =>
                                    setImageModal({
                                      isOpen: true,
                                      images: inquiry.images,
                                      currentIndex: index,
                                    })
                                  }
                                  className="block aspect-square overflow-hidden rounded-lg border hover:opacity-80 transition-opacity"
                                  style={{ borderColor: COLORS.border.light }}
                                >
                                  <div className="relative w-full h-full">
                                    <Image
                                      src={url}
                                      alt={`첨부 이미지 ${index + 1}`}
                                      fill
                                      sizes="(max-width: 768px) 33vw, 120px"
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {inquiry.admin_response && (
                          <div
                            className="rounded-lg p-4"
                            style={{
                              backgroundColor: COLORS.background.hover,
                              border: `1px solid ${COLORS.border.light}`,
                            }}
                          >
                            <p
                              className="text-sm font-medium mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              관리자 답변
                            </p>
                            <p
                              className="text-sm whitespace-pre-wrap"
                              style={{ color: COLORS.text.primary }}
                            >
                              {inquiry.admin_response}
                            </p>

                            {inquiry.admin_response_images?.length > 0 && (
                              <div className="mt-3">
                                <p
                                  className="text-sm font-medium mb-2 flex items-center gap-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                  답변 이미지 ({inquiry.admin_response_images.length})
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {inquiry.admin_response_images.map((url, index) => (
                                    <button
                                      key={`admin-response-img-${inquiry.id}-${index}`}
                                      type="button"
                                      onClick={() =>
                                        setImageModal({
                                          isOpen: true,
                                          images: inquiry.admin_response_images,
                                          currentIndex: index,
                                        })
                                      }
                                      className="block aspect-square overflow-hidden rounded-lg border hover:opacity-80 transition-opacity"
                                      style={{ borderColor: COLORS.border.light }}
                                    >
                                      <div className="relative w-full h-full">
                                        <Image
                                          src={url}
                                          alt={`답변 이미지 ${index + 1}`}
                                          fill
                                          sizes="(max-width: 768px) 33vw, 120px"
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {myInquiriesTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMyInquiriesPage((p) => Math.max(1, p - 1))}
                disabled={myInquiriesPage === 1}
                style={{ color: COLORS.text.secondary }}
              >
                이전
              </Button>
              <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                {myInquiriesPage} / {myInquiriesTotalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setMyInquiriesPage((p) => Math.min(myInquiriesTotalPages, p + 1))
                }
                disabled={myInquiriesPage === myInquiriesTotalPages}
                style={{ color: COLORS.text.secondary }}
              >
                다음
              </Button>
            </div>
          )}

          {/* 이미지 모달 */}
          {imageModal.isOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
              onClick={() =>
                setImageModal({ isOpen: false, images: [], currentIndex: 0 })
              }
            >
              <div
                className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() =>
                    setImageModal({ isOpen: false, images: [], currentIndex: 0 })
                  }
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 transition-all"
                  style={{ color: COLORS.text.white }}
                >
                  <X className="w-6 h-6" />
                </button>

                {imageModal.images.length > 1 && imageModal.currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageModal((prev) => ({
                        ...prev,
                        currentIndex: prev.currentIndex - 1,
                      }));
                    }}
                    className="absolute left-4 z-10 p-3 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 transition-all"
                    style={{ color: COLORS.text.white }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      width: "min(80vw, 80vh)",
                      height: "min(80vw, 80vh)",
                      aspectRatio: "1 / 1",
                    }}
                  >
                    <Image
                      src={imageModal.images[imageModal.currentIndex]}
                      alt={`이미지 ${imageModal.currentIndex + 1}`}
                      fill
                      sizes="80vw"
                      className="object-contain"
                      unoptimized
                      style={{
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>

                {imageModal.images.length > 1 &&
                  imageModal.currentIndex < imageModal.images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModal((prev) => ({
                          ...prev,
                          currentIndex: prev.currentIndex + 1,
                        }));
                      }}
                      className="absolute right-4 z-10 p-3 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 transition-all"
                      style={{ color: COLORS.text.white }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                {imageModal.images.length > 1 && (
                  <div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: COLORS.text.white,
                    }}
                  >
                    {imageModal.currentIndex + 1} / {imageModal.images.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <InquiryPageContent />
    </Suspense>
  );
}
