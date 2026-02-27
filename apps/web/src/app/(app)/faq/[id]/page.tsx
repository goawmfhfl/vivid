"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import type { NotionBlock } from "@/lib/types/notion";
import { AuthHeader } from "@/components/forms/AuthHeader";

export default function FAQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [title, setTitle] = useState<string>("");
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionContent = async () => {
      if (!id) {
        setError("질문 ID가 없습니다.");
        setLoading(false);
        return;
      }

      // UUID 형식 검증
      const isUUID = /^[a-f0-9]{32}$/i.test(id.replace(/-/g, ""));
      if (!isUUID) {
        setError(
          `유효하지 않은 질문 ID 형식입니다. 올바른 질문 페이지로 이동해주세요.`
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 질문 메타데이터 가져오기 (title, url 등)
        const questionResponse = await fetch("/api/notion/questions");
        if (questionResponse.ok) {
          const questionResult = await questionResponse.json();
          const questions = questionResult.data || [];
          const targetQuestion = questions.find(
            (q: { id: string; title?: string; name?: string }) => q.id === id
          );

          if (targetQuestion) {
            setTitle(targetQuestion.title || targetQuestion.name || "");
          }
        }

        // 페이지 블록 가져오기
        const blocksResponse = await fetch(`/api/notion/questions/${id}`);

        if (blocksResponse.ok) {
          const blocksResult = await blocksResponse.json();
          setBlocks(blocksResult.data?.blocks || []);
        } else {
          const errorData = await blocksResponse.json().catch(() => ({}));
          console.error("페이지 블록 가져오기 실패:", {
            status: blocksResponse.status,
            statusText: blocksResponse.statusText,
            error: errorData,
          });
          setError(
            `페이지 내용을 불러오는데 실패했습니다: ${errorData.error || blocksResponse.statusText}`
          );
        }
      } catch (err) {
        console.error("질문 내용 가져오기 중 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionContent();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: COLORS.background.base }}
      >
        <AuthHeader title="자주 묻는 질문" />
        <div
          className={cn(
            SPACING.page.maxWidth,
            "mx-auto",
            SPACING.page.padding,
            "pt-8"
          )}
        >
          <div className="py-16">
            <LoadingSpinner message="질문 내용을 불러오는 중..." size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: COLORS.background.base }}
      >
        <AuthHeader title="자주 묻는 질문" />
        <div
          className={cn(
            SPACING.page.maxWidth,
            "mx-auto",
            SPACING.page.padding,
            "pt-8"
          )}
        >
          <div className="py-16 text-center">
            <p
              className={cn(TYPOGRAPHY.h3.fontSize, "mb-2")}
              style={{ color: COLORS.text.primary }}
            >
              {error}
            </p>
            <Button
              variant="ghost"
              onClick={() => router.push("/faq")}
              className="mt-4"
              style={{ color: COLORS.brand.primary }}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <AuthHeader title="자주 묻는 질문" />
      <div
        className={cn(
          SPACING.page.maxWidth,
          "mx-auto",
          SPACING.page.padding,
          "pt-8 pb-16"
        )}
      >
        <article className="max-w-3xl mx-auto">
          {title && (
            <h1
              className={cn(
                TYPOGRAPHY.h1.fontSize,
                TYPOGRAPHY.h1.fontWeight,
                "mb-6"
              )}
              style={{ color: COLORS.text.primary }}
            >
              {title}
            </h1>
          )}

          <div
            className={cn("prose prose-sm sm:prose-base max-w-none")}
            style={{
              color: COLORS.text.primary,
              lineHeight: "1.8",
            }}
          >
            {blocks.length > 0 ? (
              <NotionRenderer blocks={blocks} />
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
    </div>
  );
}
