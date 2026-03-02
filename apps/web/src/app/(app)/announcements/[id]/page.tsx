"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/auth";
import { supabase } from "@/lib/supabase";
import { COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLES } from "@/lib/design-system";
import { AppHeader } from "@/components/common/AppHeader";
import { cn } from "@/lib/utils";

type ImageItem = {
  id: string;
  image_path: string;
  sort_order: number;
  image_url: string;
};

function AnnouncementDetailPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const submitFeedback = async () => {
    if (!id || !feedbackContent.trim()) return;
    setFeedbackSubmitting(true);
    setFeedbackError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setFeedbackError("로그인이 필요합니다.");
        return;
      }
      const res = await fetch(`/api/announcements/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ content: feedbackContent.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedbackError(data.error || "피드백 등록에 실패했습니다.");
        return;
      }
      setFeedbackSuccess(true);
      setFeedbackContent("");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      try {
        const res = await fetch(`/api/announcements/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          credentials: "include",
        });
        if (!res.ok) {
          router.replace("/announcements");
          return;
        }
        const data = await res.json();
        setImages(data.images ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background.card }}>
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: COLORS.brand.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-20" style={{ backgroundColor: COLORS.background.card }}>
      <div className="max-w-2xl mx-auto">
        <AppHeader
          title="공지사항"
          showBackButton
          onBack={() => router.back()}
        />
        {/* 타이틀(헤더)와 이미지 영역 분리 - 헤더에 제목 표시, 아래는 이미지만 */}
        <section className="space-y-6 mt-6">
          {images.map((img, index) => (
            <LazyAnnouncementImage key={img.id} src={img.image_url} alt="" index={index} />
          ))}
        </section>

        {/* 피드백 입력 */}
        <section
          className={cn("mt-10 pt-6 border-t", SPACING.card.padding)}
          style={{ borderColor: COLORS.border.light }}
        >
          <h2
            className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight, "mb-3")}
            style={{ color: COLORS.text.primary }}
          >
            업데이트 내용에 대한 의견을 남겨주세요
          </h2>
          <textarea
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="자유롭게 의견을 입력해주세요"
            maxLength={2000}
            rows={4}
            disabled={feedbackSubmitting}
            className={cn("w-full rounded-xl resize-none border transition-colors p-4", TYPOGRAPHY.body.fontSize)}
            style={{
              borderColor: COLORS.border.input,
              color: COLORS.text.primary,
              backgroundColor: COLORS.background.card,
            }}
          />
          <div className="flex items-center justify-between mt-3 gap-3">
            <div className="min-w-0 flex-1">
              {feedbackSuccess && (
                <p className="text-sm" style={{ color: COLORS.brand.primary }}>
                  피드백이 등록되었습니다. 감사합니다.
                </p>
              )}
              {feedbackError && (
                <p className="text-sm" style={{ color: COLORS.status.error }}>
                  {feedbackError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={submitFeedback}
              disabled={feedbackSubmitting || !feedbackContent.trim()}
              className={cn(
                "rounded-xl font-medium transition-all disabled:opacity-50 shrink-0",
                BUTTON_STYLES.primary.padding
              )
              }
              style={{
                backgroundColor: BUTTON_STYLES.primary.background,
                color: BUTTON_STYLES.primary.color,
                opacity: !feedbackContent.trim() ? 0.6 : 1,
              }}
            >
              {feedbackSubmitting ? "등록 중..." : "피드백 보내기"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function LazyAnnouncementImage({
  src,
  alt,
  index,
}: {
  src: string;
  alt: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsVisible(true);
      },
      { rootMargin: "100px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="relative w-full">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-xl object-contain"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default withAuth(AnnouncementDetailPageInner);
