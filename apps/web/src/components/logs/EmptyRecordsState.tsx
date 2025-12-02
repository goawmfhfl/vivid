import { FileText } from "lucide-react";
import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";

export function EmptyRecordsState() {
  return (
    <div
      className={`${SPACING.card.padding} text-center relative`}
      style={{
        backgroundColor: "#FAFAF8",
        border: `1.5px solid ${COLORS.border.light}`,
        borderRadius: "12px",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        position: "relative",
        overflow: "hidden",
        // 종이 질감 배경 패턴
        backgroundImage: `
          /* 가로 줄무늬 (프로젝트 그린 톤) */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(107, 122, 111, 0.08) 27px,
            rgba(107, 122, 111, 0.08) 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />

      {/* 내용 영역 */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.brand.light}20` }}
        >
          <FileText
            className="w-8 h-8"
            style={{ color: COLORS.brand.primary }}
          />
        </div>
        <h3
          style={{
            color: COLORS.text.primary,
            fontSize: TYPOGRAPHY.h4.fontSize.replace("text-", ""),
            fontWeight: "500",
          }}
        >
          기록이 없습니다
        </h3>
      </div>
    </div>
  );
}
