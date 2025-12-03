import { COLORS } from "@/lib/design-system";
import { Check } from "lucide-react";

export type RecordType = "daily" | "emotion" | "dream" | "insight" | "feedback";

interface RecordTypeInfo {
  id: RecordType;
  title: string;
  description: string;
  icon: string;
}

export const RECORD_TYPES: RecordTypeInfo[] = [
  {
    id: "daily",
    title: "일상 기록",
    description:
      "일상적인 기록, 일상중에서 떠오르는 자연스러운 생각들을 적는 기록",
    icon: "📝",
  },
  {
    id: "emotion",
    title: "감정 기록",
    description:
      "일상중에 떠오르는 감정에 대한 기록, 감정 위주의 기록을 하는 사람들에게 적합",
    icon: "💭",
  },
  {
    id: "dream",
    title: "꿈/목표 기록",
    description: "살아가면서 이루고 싶은 꿈, 혹은 목표를 향한 기록",
    icon: "🎯",
  },
  {
    id: "insight",
    title: "인사이트 기록",
    description:
      "일상중에 떠오른 인사이트, 아이디어, 창의적인 영감들을 저장하는 기록",
    icon: "💡",
  },
  {
    id: "feedback",
    title: "피드백 기록",
    description:
      "어떤 경험을 통해서 깨달은 사실을 피드백하면서 스스로를 되돌아 볼 수 있는 기록",
    icon: "🔄",
  },
];

// 레코드 타입별 색상 정의
export const RECORD_TYPE_COLORS: Record<
  RecordType,
  {
    background: string;
    border: string;
    text: string;
    lineColor: string;
    overlay: string;
  }
> = {
  daily: {
    background: "#FAFAF8", // 기본 베이지
    border: "#EFE9E3",
    text: "#333333",
    lineColor: "rgba(107, 122, 111, 0.08)",
    overlay: "rgba(168, 187, 168, 0.15)",
  },
  emotion: {
    background: "#FFF5F5", // 연한 핑크
    border: "#FFE5E5",
    text: "#333333",
    lineColor: "rgba(220, 38, 38, 0.08)",
    overlay: "rgba(255, 182, 193, 0.15)",
  },
  dream: {
    background: "#F0F9FF", // 연한 블루
    border: "#E0F2FE",
    text: "#333333",
    lineColor: "rgba(59, 130, 246, 0.08)",
    overlay: "rgba(147, 197, 253, 0.15)",
  },
  insight: {
    background: "#FFFBEB", // 연한 옐로우
    border: "#FEF3C7",
    text: "#333333",
    lineColor: "rgba(245, 158, 11, 0.08)",
    overlay: "rgba(253, 224, 71, 0.15)",
  },
  feedback: {
    background: "#F0FDF4", // 연한 그린
    border: "#DCFCE7",
    text: "#333333",
    lineColor: "rgba(16, 185, 129, 0.08)",
    overlay: "rgba(134, 239, 172, 0.15)",
  },
};

interface RecordTypeCardProps {
  type: RecordTypeInfo;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function RecordTypeCard({
  type,
  isSelected,
  isDisabled,
  onClick,
}: RecordTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled && !isSelected}
      className="relative p-5 rounded-xl transition-all text-left w-full"
      style={{
        backgroundColor: isSelected ? "#FAFAF8" : "white",
        border: `1.5px solid ${
          isSelected ? COLORS.brand.primary : COLORS.border.light
        }`,
        boxShadow: isSelected
          ? `
            0 4px 12px rgba(107, 122, 111, 0.15),
            0 2px 4px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `
          : `
            0 2px 4px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `,
        opacity: isDisabled && !isSelected ? 0.5 : 1,
        cursor: isDisabled && !isSelected ? "not-allowed" : "pointer",
        transform: isSelected ? "translateY(-2px)" : "translateY(0)",
        // 종이 질감 배경 패턴
        backgroundImage: isSelected
          ? `
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 27px,
              rgba(107, 122, 111, 0.06) 27px,
              rgba(107, 122, 111, 0.06) 28px
            ),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(107, 122, 111, 0.01) 2px,
              rgba(107, 122, 111, 0.01) 4px
            )
          `
          : "none",
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: isSelected ? "contrast(1.02) brightness(1.01)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled || isSelected) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `
            0 4px 12px rgba(107, 122, 111, 0.15),
            0 2px 4px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `
            0 2px 4px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `;
        }
      }}
    >
      {/* 종이 질감 오버레이 */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
            `,
            mixBlendMode: "overlay",
            opacity: 0.5,
          }}
        />
      )}

      {/* 선택 체크 표시 */}
      {isSelected && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: COLORS.brand.primary,
            boxShadow: "0 2px 4px rgba(107, 122, 111, 0.3)",
          }}
        >
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl">{type.icon}</span>
          <div className="flex-1">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              {type.title}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: COLORS.text.tertiary }}
            >
              {type.description}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
