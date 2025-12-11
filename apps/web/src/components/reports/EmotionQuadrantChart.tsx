"use client";

import { useState } from "react";
import { COLORS } from "@/lib/design-system";

interface EmotionDataPoint {
  date: string;
  valence: number | null;
  arousal: number | null;
  quadrant: string | null;
}

interface EmotionQuadrantChartProps {
  data: EmotionDataPoint[];
}

// 감정 구역 색상 매핑
const getQuadrantColor = (quadrant: string | null) => {
  switch (quadrant) {
    case "몰입·설렘":
      return "#A8BBA8";
    case "안도·평온":
      return "#E5B96B";
    case "불안·초조":
      return "#B89A7A";
    case "슬픔·무기력":
      return "#6B7A6F";
    default:
      return "#6B7A6F";
  }
};

// 2D 좌표계에서 점의 위치 계산 (x: valence, y: arousal)
const getPointPosition = (v: number, a: number) => {
  const x = ((v + 1) / 2) * 100; // -1~+1을 0~100%로 변환
  const y = (1 - a) * 100; // 0~1을 100%~0%로 변환 (y축은 위에서 아래로)
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
};

// 날짜 포맷팅 (MM/DD)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}/${day}`;
};

export function EmotionQuadrantChart({ data }: EmotionQuadrantChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 유효한 데이터만 필터링
  const validData = data.filter(
    (item) => item.valence !== null && item.arousal !== null
  );

  if (validData.length === 0) {
    return null;
  }

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: "280px",
        backgroundColor: COLORS.background.base,
        borderRadius: "12px",
        border: `2px solid ${COLORS.border.light}`,
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* 격자 배경 */}
      <svg
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      >
        {/* 중앙선 (valence) */}
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke={COLORS.border.light}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* 중앙선 (arousal) */}
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke={COLORS.border.light}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* 4개 구역 배경색 */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 0,
          width: "50%",
          height: "50%",
          backgroundColor: "rgba(168, 187, 168, 0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "50%",
          height: "50%",
          backgroundColor: "rgba(229, 185, 107, 0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: "50%",
          height: "50%",
          backgroundColor: "rgba(184, 154, 122, 0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: 0,
          top: "50%",
          width: "50%",
          height: "50%",
          backgroundColor: "rgba(107, 122, 111, 0.1)",
        }}
      />

      {/* 감정 점들 */}
      {validData.map((item, index) => {
        const pointPos = getPointPosition(
          item.valence as number,
          item.arousal as number
        );
        const quadrantColor = getQuadrantColor(item.quadrant);
        const isHovered = hoveredIndex === index;

        return (
          <div key={index}>
            {/* 감정 점 */}
            <div
              className="absolute cursor-pointer transition-all"
              style={{
                left: `${pointPos.x}%`,
                top: `${pointPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: isHovered ? "20px" : "12px",
                height: isHovered ? "20px" : "12px",
                borderRadius: "50%",
                backgroundColor: quadrantColor,
                border: "3px solid white",
                boxShadow: isHovered
                  ? "0 4px 12px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: isHovered ? 15 : 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* 호버 시 날짜 라벨 */}
            {isHovered && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${pointPos.x}%`,
                  top: `${pointPos.y - 8}%`,
                  transform: "translate(-50%, -100%)",
                  backgroundColor: COLORS.text.primary,
                  color: COLORS.text.white,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  zIndex: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {formatDate(item.date)}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "100%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: `4px solid ${COLORS.text.primary}`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* 구역 레이블 */}
      <div
        className="absolute text-xs"
        style={{
          right: "12px",
          top: "12px",
          color: COLORS.text.tertiary,
          fontWeight: "500",
        }}
      >
        몰입·설렘
      </div>
      <div
        className="absolute text-xs"
        style={{
          right: "12px",
          bottom: "12px",
          color: COLORS.text.tertiary,
          fontWeight: "500",
        }}
      >
        안도·평온
      </div>
      <div
        className="absolute text-xs"
        style={{
          left: "12px",
          top: "12px",
          color: COLORS.text.tertiary,
          fontWeight: "500",
        }}
      >
        불안·초조
      </div>
      <div
        className="absolute text-xs"
        style={{
          left: "12px",
          bottom: "12px",
          color: COLORS.text.tertiary,
          fontWeight: "500",
        }}
      >
        슬픔·무기력
      </div>

      {/* 축 레이블 */}
      <div
        className="absolute text-xs"
        style={{
          left: "50%",
          bottom: "-24px",
          transform: "translateX(-50%)",
          color: COLORS.text.secondary,
          fontWeight: "500",
        }}
      >
        쾌감 (valence)
      </div>
      <div
        className="absolute text-xs"
        style={{
          left: "-32px",
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          color: COLORS.text.secondary,
          fontWeight: "500",
        }}
      >
        각성 (arousal)
      </div>
    </div>
  );
}
