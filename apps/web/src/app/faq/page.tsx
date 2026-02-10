"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import type { NotionBlock } from "@/lib/types/notion";

// 특정 Notion 페이지 ID
const FAQ_PAGE_ID = "2e8834013f7080f58d62d7158a810b5c";

function FAQPageContent() {
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastImageRefreshAtRef = useRef(0);
  const isRefreshingImagesRef = useRef(false);

  const fetchFAQContent = useCallback(
    async (showLoading: boolean = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const blocksResponse = await fetch(
          `/api/notion/questions/${FAQ_PAGE_ID}`
        );

        if (blocksResponse.ok) {
          const blocksResult = await blocksResponse.json();
          setBlocks(blocksResult.data?.blocks || []);
          setError(null);
        } else {
          const errorData = await blocksResponse.json().catch(() => ({}));
          console.error("페이지 블록 가져오기 실패:", {
            status: blocksResponse.status,
            statusText: blocksResponse.statusText,
            error: errorData,
          });
          setError(
            `페이지 내용을 불러오는데 실패했습니다: ${
              errorData.error || blocksResponse.statusText
            }`
          );
        }
      } catch (err) {
        console.error("FAQ 내용 가져오기 중 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void fetchFAQContent();
  }, [fetchFAQContent]);

  const handleImageError = useCallback(
    (blockId: string) => {
      const now = Date.now();
      if (isRefreshingImagesRef.current) return;
      if (now - lastImageRefreshAtRef.current < 3000) return;

      isRefreshingImagesRef.current = true;
      lastImageRefreshAtRef.current = now;
      console.warn("FAQ 이미지 로드 실패, 재요청 시도:", blockId);

      void fetchFAQContent(false).finally(() => {
        isRefreshingImagesRef.current = false;
      });
    },
    [fetchFAQContent]
  );

  if (loading) {
    return (
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader title="자주 묻는 질문" showBackButton={true} />
        <div className="py-16">
          <LoadingSpinner message="내용을 불러오는 중..." size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader title="자주 묻는 질문" showBackButton={true} />
        <div className="py-16 text-center">
          <p
            className={cn(TYPOGRAPHY.h3.fontSize, "mb-2")}
            style={{ color: COLORS.text.primary }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="자주 묻는 질문" showBackButton={true} />
      <article className="max-w-3xl mx-auto">
        <div
          className={cn("prose prose-sm sm:prose-base max-w-none")}
          style={{
            color: COLORS.text.primary,
            lineHeight: "1.8",
          }}
        >
          {blocks.length > 0 ? (
            <NotionRenderer blocks={blocks} onImageError={handleImageError} />
          ) : (
            <p
              className={cn(
                TYPOGRAPHY.body.fontSize,
                TYPOGRAPHY.body.lineHeight
              )}
              style={{ color: COLORS.text.secondary }}
            >
              내용을 불러오는 중...
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <FAQPageContent />
    </Suspense>
  );
}
