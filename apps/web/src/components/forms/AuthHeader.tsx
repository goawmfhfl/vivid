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
    <div className="text-center mb-12">
      <div className="flex justify-center mb-8">
        <Image
          src="/vivid.svg"
          alt="VIVID"
          width={160}
          height={160}
          priority
          className="drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 4px 12px ${COLORS.brand.primary}25)`,
          }}
        />
      </div>
      {title && (
        <h1
          className={cn("mb-3", TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight)}
          style={{ color: COLORS.brand.primary }}
        >
          {title}
        </h1>
      )}
      <p
        className={cn(TYPOGRAPHY.bodyLarge.fontSize)}
        style={{ 
          color: COLORS.text.secondary,
          lineHeight: "1.6",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
