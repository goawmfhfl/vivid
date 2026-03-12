"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS, SPACING } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ScrollRevealImage } from "./ScrollRevealImage";
import type { StaticImageData } from "next/image";

const ALT_TEXTS = [
  "VIVID 기록 가이드 1단계",
  "VIVID 기록 가이드 2단계",
  "VIVID 기록 가이드 3단계",
  "VIVID 기록 가이드 4단계",
  "VIVID 기록 가이드 5단계",
] as const;

interface RecordingGuideContentProps {
  images: [StaticImageData, StaticImageData, StaticImageData, StaticImageData, StaticImageData];
}

export function RecordingGuideContent({ images }: RecordingGuideContentProps) {
  const router = useRouter();

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
          className="mb-6 -ml-2"
          style={{ color: COLORS.brand.primary }}
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <article className="max-w-3xl mx-auto flex flex-col gap-8">
          {images.map((src, index) => (
            <ScrollRevealImage
              key={index}
              src={src}
              alt={ALT_TEXTS[index]}
              index={index}
            />
          ))}
        </article>
      </div>
    </div>
  );
}
