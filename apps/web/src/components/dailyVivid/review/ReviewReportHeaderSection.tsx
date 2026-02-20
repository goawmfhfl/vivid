import { CheckCircle2 } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SECTION_HEADER_ICON_STYLE } from "./reviewSectionStyles";

export function ReviewReportHeaderSection() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group transition-transform duration-300 hover:scale-110"
        style={{
          background: SECTION_HEADER_ICON_STYLE.background,
          boxShadow: SECTION_HEADER_ICON_STYLE.boxShadow,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        <CheckCircle2 className="w-6 h-6 text-white relative z-10" />
      </div>
      <div>
        <h2
          className={cn(TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight, "mb-1")}
          style={{ color: COLORS.text.primary }}
        >
          오늘의 회고
        </h2>
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary }}
        >
          완료한 일과 미완료한 일을 돌아봅니다
        </p>
      </div>
    </div>
  );
}
