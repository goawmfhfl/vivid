import { COLORS } from "@/lib/design-system";

interface PostItLabelProps {
  stepNumber: number;
  label: string;
}

export function PostItLabel({ stepNumber, label }: PostItLabelProps) {
  return (
    <div
      className="absolute -top-4 -right-4 z-20"
      style={{
        transform: "rotate(5deg)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-sm relative overflow-hidden"
        style={{
          backgroundColor: "#FFF9C4", // 노란색 포스트잇 색상
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
          // 포스트잇 텍스처
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.02) 2px,
              rgba(0, 0, 0, 0.02) 4px
            )
          `,
        }}
      >
        <span
          className="text-sm font-bold relative z-10"
          style={{
            color: "#8B6914",
            textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
          }}
        >
          {stepNumber}
        </span>
        <span
          className="text-xs font-medium relative z-10"
          style={{
            color: "#8B6914",
            textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
