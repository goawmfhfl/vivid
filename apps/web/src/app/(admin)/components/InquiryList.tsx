"use client";

import { useState, useEffect, useCallback } from "react";
import {
  COLORS,
  CARD_STYLES,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  Trash2,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApiFetch } from "@/lib/admin-api-client";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import type { Inquiry, InquiryStatus, InquiryType } from "@/types/inquiry";
import {
  INQUIRY_TYPE_LABELS,
  INQUIRY_STATUS_LABELS,
} from "@/types/inquiry";

interface InquiryWithUser extends Inquiry {
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

interface InquiryListResponse {
  inquiries: InquiryWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function InquiryList() {
  const [inquiries, setInquiries] = useState<InquiryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | "all">(
    "all"
  );
  const [selectedType, setSelectedType] = useState<InquiryType | "all">("all");
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState<Record<string, string>>({});
  const [adminResponseImages, setAdminResponseImages] = useState<
    Record<string, string[]>
  >({});
  const [uploadingAdminImages, setUploadingAdminImages] = useState<
    Record<string, boolean>
  >({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedType !== "all") {
        params.append("type", selectedType);
      }

      const response = await adminApiFetch(`/api/admin/inquiries?${params}`);
      if (!response.ok) {
        throw new Error("문의사항 목록을 불러오는데 실패했습니다.");
      }

      const data: InquiryListResponse = await response.json();
      setInquiries(data.inquiries);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedType]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // 이미지 모달 키보드 네비게이션
  useEffect(() => {
    if (!imageModal.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && imageModal.currentIndex > 0) {
        setImageModal((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex - 1,
        }));
      } else if (
        e.key === "ArrowRight" &&
        imageModal.currentIndex < imageModal.images.length - 1
      ) {
        setImageModal((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
        }));
      } else if (e.key === "Escape") {
        setImageModal({ isOpen: false, images: [], currentIndex: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageModal.isOpen, imageModal.currentIndex, imageModal.images.length]);

  const handleStatusUpdate = async (
    inquiryId: string,
    status: InquiryStatus
  ) => {
    setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: true }));

    try {
      const response = await adminApiFetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("상태 업데이트에 실패했습니다.");
      }

      await fetchInquiries();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "상태 업데이트 중 오류가 발생했습니다."
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleAdminResponse = async (inquiryId: string) => {
    const responseText = adminResponse[inquiryId] || "";
    const responseImages = adminResponseImages[inquiryId] || [];

    setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: true }));

    try {
      const response = await adminApiFetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PUT",
        body: JSON.stringify({
          admin_response: responseText,
          admin_response_images: responseImages,
        }),
      });

      if (!response.ok) {
        throw new Error("답변 저장에 실패했습니다.");
      }

      await fetchInquiries();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "답변 저장 중 오류가 발생했습니다."
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleAdminImageUpload = async (inquiryId: string, file: File) => {
    setUploadingAdminImages((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/inquiries/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
      }

      const result = await res.json();
      if (!result?.url) {
        throw new Error("이미지 URL을 받아오지 못했습니다.");
      }

      setAdminResponseImages((prev) => ({
        ...prev,
        [inquiryId]: [...(prev[inquiryId] || []), result.url],
      }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingAdminImages((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleRemoveAdminImage = (inquiryId: string, index: number) => {
    setAdminResponseImages((prev) => ({
      ...prev,
      [inquiryId]: (prev[inquiryId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm("정말 이 문의사항을 삭제하시겠습니까?")) {
      return;
    }

    setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: true }));

    try {
      const response = await adminApiFetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      await fetchInquiries();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다."
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <MessageSquare className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
    }
  };

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

  if (loading && inquiries.length === 0) {
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>{error}</p>
        <Button
          onClick={fetchInquiries}
          className="mt-4"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const statusOptions: (InquiryStatus | "all")[] = [
    "all",
    "pending",
    "in_progress",
    "resolved",
  ];

  const typeOptions: (InquiryType | "all")[] = [
    "all",
    "bug",
    "feature",
    "question",
    "payment",
    "account",
    "other",
  ];

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div
        className="rounded-xl p-6"
        style={{
          ...CARD_STYLES.default,
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as InquiryStatus | "all");
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="all">전체</option>
              {statusOptions
                .filter((s) => s !== "all")
                .map((status) => (
                  <option key={status} value={status}>
                    {INQUIRY_STATUS_LABELS[status]}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              타입
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as InquiryType | "all");
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.base,
                color: COLORS.text.primary,
              }}
            >
              <option value="all">전체</option>
              {typeOptions
                .filter((t) => t !== "all")
                .map((type) => (
                  <option key={type} value={type}>
                    {INQUIRY_TYPE_LABELS[type]}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* 문의사항 목록 */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.text.secondary }}>
              문의사항이 없습니다.
            </p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-xl p-6"
              style={{
                ...CARD_STYLES.default,
                border: `1.5px solid ${
                  expandedInquiry === inquiry.id
                    ? COLORS.brand.primary + "40"
                    : COLORS.border.default
                }`,
              }}
            >
              <div className="space-y-4">
                {/* 헤더 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getStatusColor(inquiry.status) + "20",
                          color: getStatusColor(inquiry.status),
                        }}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(inquiry.status)}
                          {INQUIRY_STATUS_LABELS[inquiry.status]}
                        </span>
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
                    <h3
                      className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                      style={{ color: COLORS.text.primary }}
                    >
                      {inquiry.title}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {inquiry.user?.name || inquiry.user?.email || "알 수 없음"} ·{" "}
                      {new Date(inquiry.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedInquiry(
                          expandedInquiry === inquiry.id ? null : inquiry.id
                        )
                      }
                      style={{ color: COLORS.text.secondary }}
                    >
                      {expandedInquiry === inquiry.id ? "접기" : "자세히"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(inquiry.id)}
                      disabled={updatingStatus[inquiry.id]}
                      style={{ color: COLORS.status.error }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 내용 (확장 시) */}
                {expandedInquiry === inquiry.id && (
                  <div className="space-y-4 pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
                    <div>
                      <h4
                        className="text-sm font-medium mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        내용
                      </h4>
                      <p
                        className="text-sm whitespace-pre-wrap"
                        style={{ color: COLORS.text.primary }}
                      >
                        {inquiry.content}
                      </p>
                    </div>

                    {/* 이미지 */}
                    {inquiry.images && inquiry.images.length > 0 && (
                      <div>
                        <h4
                          className="text-sm font-medium mb-2 flex items-center gap-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          <ImageIcon className="w-4 h-4" />
                          첨부 이미지 ({inquiry.images.length})
                        </h4>
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
                              className="block aspect-square overflow-hidden rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                borderColor: COLORS.border.light,
                              }}
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

                    {/* 관리자 답변 */}
                    <div>
                      <h4
                        className="text-sm font-medium mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        관리자 답변
                      </h4>
                      <textarea
                        value={
                          adminResponse[inquiry.id] ??
                          inquiry.admin_response ??
                          ""
                        }
                        onChange={(e) =>
                          setAdminResponse({
                            ...adminResponse,
                            [inquiry.id]: e.target.value,
                          })
                        }
                        onFocus={() => {
                          // 최초 포커스 시 기존 답변/이미지 상태를 스테이트로 동기화
                          if (adminResponse[inquiry.id] === undefined) {
                            setAdminResponse((prev) => ({
                              ...prev,
                              [inquiry.id]: inquiry.admin_response || "",
                            }));
                          }
                          if (adminResponseImages[inquiry.id] === undefined) {
                            setAdminResponseImages((prev) => ({
                              ...prev,
                              [inquiry.id]: inquiry.admin_response_images || [],
                            }));
                          }
                        }}
                        placeholder="관리자 답변을 입력하세요"
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border resize-none transition-all outline-none"
                        style={{
                          borderColor: COLORS.border.input,
                          backgroundColor: COLORS.background.base,
                          color: COLORS.text.primary,
                        }}
                      />

                      {/* 관리자 답변 이미지 */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            <ImageIcon className="w-4 h-4" />
                            답변 이미지
                          </p>
                          <label
                            className="text-xs px-3 py-2 rounded-lg cursor-pointer"
                            style={{
                              backgroundColor: COLORS.background.hover,
                              border: `1px solid ${COLORS.border.input}`,
                              color: COLORS.text.secondary,
                            }}
                          >
                            {uploadingAdminImages[inquiry.id]
                              ? "업로드 중..."
                              : "이미지 추가"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              className="hidden"
                              disabled={uploadingAdminImages[inquiry.id]}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                handleAdminImageUpload(inquiry.id, file);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>

                        {((adminResponseImages[inquiry.id] ??
                          inquiry.admin_response_images ??
                          []) as string[]).length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {(adminResponseImages[inquiry.id] ??
                              inquiry.admin_response_images ??
                              []
                            ).map((url, index) => (
                              <div
                                key={`${inquiry.id}-admin-img-${index}`}
                                className="relative group aspect-square overflow-hidden rounded-lg border"
                                style={{ borderColor: COLORS.border.light }}
                              >
                                <button
                                  type="button"
                                  className="w-full h-full"
                                  onClick={() =>
                                    setImageModal({
                                      isOpen: true,
                                      images:
                                        adminResponseImages[inquiry.id] ??
                                        inquiry.admin_response_images ??
                                        [],
                                      currentIndex: index,
                                    })
                                  }
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveAdminImage(inquiry.id, index)
                                  }
                                  className="absolute top-1 right-1 p-1.5 rounded-full bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ backdropFilter: "blur(4px)" }}
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAdminResponse(inquiry.id)}
                        disabled={updatingStatus[inquiry.id]}
                        size="sm"
                        className="mt-3"
                        style={{
                          backgroundColor: COLORS.brand.primary,
                          color: COLORS.text.white,
                        }}
                      >
                        {updatingStatus[inquiry.id]
                          ? "저장 중..."
                          : inquiry.admin_response
                            ? "답변 수정 저장"
                            : "답변 저장"}
                      </Button>
                    </div>

                    {/* 상태 변경 */}
                    <div>
                      <h4
                        className="text-sm font-medium mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        상태 변경
                      </h4>
                      <div className="flex gap-2">
                        {statusOptions
                          .filter((s) => s !== "all")
                          .map((status) => (
                            <Button
                              key={status}
                              variant={
                                inquiry.status === status ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleStatusUpdate(inquiry.id, status)}
                              disabled={updatingStatus[inquiry.id]}
                              style={{
                                backgroundColor:
                                  inquiry.status === status
                                    ? getStatusColor(status)
                                    : "transparent",
                                color:
                                  inquiry.status === status
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                borderColor:
                                  inquiry.status === status
                                    ? getStatusColor(status)
                                    : COLORS.border.input,
                              }}
                            >
                              {INQUIRY_STATUS_LABELS[status]}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ color: COLORS.text.secondary }}
          >
            이전
          </Button>
          <span
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
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
            {/* 닫기 버튼 */}
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

            {/* 이전 버튼 */}
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

            {/* 이미지 */}
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
                  style={{ borderRadius: "8px" }}
                />
              </div>
            </div>

            {/* 다음 버튼 */}
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

            {/* 이미지 인덱스 표시 */}
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
  );
}
