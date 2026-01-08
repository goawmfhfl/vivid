"use client";

import Image from "next/image";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title?: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <Image
          src="/vivid.svg"
          alt="vivid logo"
          width={120}
          height={120}
          priority
        />
      </div>
      {title && (
        <h1
          className={cn("mb-2", TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight)}
          style={{ color: COLORS.brand.primary }}
        >
          {title}
        </h1>
      )}
      <p
        className={cn(TYPOGRAPHY.bodyLarge.fontSize)}
        style={{ color: COLORS.text.secondary, opacity: 0.8 }}
      >
        {subtitle}
      </p>
    </div>
  );
}
