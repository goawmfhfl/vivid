import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function PolicyLoading() {
  return (
    <div
      className="min-h-screen pb-24 flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div
        className={cn(
          SPACING.page.maxWidth,
          "mx-auto",
          SPACING.page.padding,
          "pt-8 pb-16 flex flex-col items-center justify-center min-h-[40vh]"
        )}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{
            borderColor: COLORS.brand.primary,
            borderTopColor: "transparent",
          }}
        />
        <p
          className={cn(TYPOGRAPHY.body.fontSize)}
          style={{ color: COLORS.text.secondary }}
        >
          로딩 중...
        </p>
      </div>
    </div>
  );
}
