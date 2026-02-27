"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/auth";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/design-system";
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
