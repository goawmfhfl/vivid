import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import { getPolicies, getPolicyContent } from "@/lib/server/notion";
import type { NotionBlock } from "@/lib/types/notion";

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // UUID 형식 검증
  const isUUID = /^[a-f0-9]{32}$/i.test(id.replace(/-/g, ""));
  if (!isUUID) {
    notFound();
  }

  let title = "";
  let blocks: NotionBlock[] = [];

  try {
    // 병렬로 데이터 조회
    const [policies, content] = await Promise.all([
      getPolicies(),
      getPolicyContent(id),
    ]);

    const targetPolicy = policies.find((p) => p.id === id);
    if (!targetPolicy) {
      notFound();
    }

    title = targetPolicy.title || targetPolicy.name || "제목 없음";
    blocks = content as unknown as NotionBlock[];
  } catch (error) {
    console.error("Error fetching policy data:", error);
    throw error; // 에러 바운더리에서 처리
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div
        className={cn(
          SPACING.page.maxWidth,
          "mx-auto",
          SPACING.page.padding,
          "pt-8 pb-16"
        )}
      >
        <Button
          variant="ghost"
          asChild
          className="mb-6 -ml-2"
          style={{ color: COLORS.brand.primary }}
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Link>
        </Button>

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
                내용이 없습니다.
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
