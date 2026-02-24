import { COLORS } from "@/lib/design-system";
import { Check } from "lucide-react";

export type RecordType =
  | "daily"
  | "dream"
  | "insight"
  | "feedback"
  | "review";

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
    id: "dream",
    title: "비비드",
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
  {
    id: "review",
    title: "회고",
    description: "오늘 하루를 돌아보고 정리하는 기록",
    icon: "🪞",
  },
];

// 레코드 타입별 색상 정의
// 프로젝트의 그린 톤과 조화롭게, 각 키워드의 특성을 살린 색상
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
    // 일상 기록: 따뜻하고 편안한 베이지/크림 톤
    background: "#FAF8F5", // 따뜻한 크림
    border: "#F0EBE0", // 부드러운 베이지 테두리
    text: "#333333",
    lineColor: "rgba(139, 120, 100, 0.1)", // 따뜻한 브라운 계열 줄무늬
    overlay: "rgba(168, 150, 130, 0.12)", // 따뜻한 베이지 오버레이
  },
  dream: {
    // VIVID 기록: 희망적이고 밝은 머스터드 옐로우 톤 (프로젝트 Secondary 색상 활용)
    background: "#FCF8F0", // 따뜻한 크림 옐로우
    border: "#E8D9B8", // 부드러운 머스터드 테두리
    text: "#333333",
    lineColor: "rgba(179, 142, 58, 0.12)", // 머스터드 옐로우 줄무늬
    overlay: "rgba(212, 175, 92, 0.15)", // 따뜻한 옐로우 오버레이
  },
  insight: {
    // 인사이트 기록: 창의적이고 영감을 주는 골드/앰버 톤
    background: "#FFFBF0", // 따뜻한 크림
    border: "#F5E8D0", // 골드 테두리
    text: "#333333",
    lineColor: "rgba(200, 160, 100, 0.12)", // 따뜻한 골드 줄무늬
    overlay: "rgba(220, 180, 120, 0.15)", // 부드러운 앰버 오버레이
  },
  feedback: {
    // 피드백 기록: 성찰적이고 차분한 민트/그린 톤 (프로젝트 브랜드 컬러와 조화)
    background: "#F0F7F5", // 연한 민트 그린
    border: "#D8E8E3", // 부드러운 그린 테두리
    text: "#333333",
    lineColor: "rgba(107, 122, 111, 0.12)", // 프로젝트 브랜드 그린 줄무늬
    overlay: "rgba(124, 154, 124, 0.15)", // 미드 그린 오버레이
  },
  review: {
    background: COLORS.background.card,
    border: COLORS.border.light,
    text: COLORS.text.primary,
    lineColor: COLORS.border.light,
    overlay: COLORS.brand.light,
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
