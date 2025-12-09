import { Calendar } from "lucide-react";
import { Card } from "../../../ui/card";
import type { DailyEmotion } from "../../../../types/weekly-feedback";
import { useTooltip } from "./TooltipContext";

type EmotionChartProps = {
  dailyEmotions: DailyEmotion[];
  valence: number;
  arousal: number;
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  title?: string; // 차트 제목 (기본값: "주간 평균 감정 좌표")
  hideCard?: boolean; // 카드 래퍼 숨기기 (월간 피드백에서 카드로 감쌀 때 사용)
};

// 감정 구역 분류 함수
const getEmotionQuadrant = (v: number, a: number) => {
  if (v > 0 && a > 0.5) return { label: "몰입·설렘·의욕", color: "#A8BBA8" };
  if (v > 0 && a <= 0.5) return { label: "안도·평온·휴식", color: "#E5B96B" };
  if (v <= 0 && a > 0.5) return { label: "불안·초조·당황", color: "#B89A7A" };
  return { label: "슬픔·체념·무기력", color: "#6B7A6F" };
};

// 2D 좌표계에서 점의 위치 계산 (x: valence, y: arousal)
const getPointPosition = (v: number, a: number) => {
  // valence: -1~+1을 0~100%로 변환하되, 5%~95% 범위로 제한 (구석 방지)
  const rawX = ((v + 1) / 2) * 100;
  const x = Math.max(5, Math.min(95, rawX));

  // arousal: 0~1을 100%~0%로 변환하되, 5%~95% 범위로 제한 (구석 방지)
  const rawY = (1 - a) * 100;
  const y = Math.max(5, Math.min(95, rawY));

  return { x, y };
};

export function EmotionChart({
  dailyEmotions,
  valence,
  arousal,
  chartContainerRef,
  title = "주간 평균 감정 좌표",
  hideCard = false,
}: EmotionChartProps) {
  const {
    hoveredDayIndex,
    selectedDayIndex,
    setHoveredDayIndex,
    setSelectedDayIndex,
  } = useTooltip();
  const pointPos = getPointPosition(valence, arousal);
  const quadrant = getEmotionQuadrant(valence, arousal);

  const chartContent = (
    <>
      {!hideCard && (
        <div className="mb-4">
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "1rem",
            }}
          >
            {title}
          </p>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="relative"
        style={{
          width: "100%",
          height: "280px",
          backgroundColor: "#FAFAF8",
          borderRadius: "12px",
          border: "2px solid #E6E4DE",
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
            stroke="#E6E4DE"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* 중앙선 (arousal) */}
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="#E6E4DE"
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

        {/* 일별 감정 점들 */}
        {dailyEmotions.map((day, index) => {
          const dayValence = day.ai_mood_valence ?? 0;
          const dayArousal = day.ai_mood_arousal ?? 0;
          const dayPos = getPointPosition(dayValence, dayArousal);
          const dayQuadrant = getEmotionQuadrant(dayValence, dayArousal);
          const isHovered = hoveredDayIndex === index;
          const isSelected = selectedDayIndex === index;

          return (
            <div key={index}>
              {/* 감정 점 */}
              <div
                className="absolute cursor-pointer transition-all"
                style={{
                  left: `${dayPos.x}%`,
                  top: `${dayPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: isHovered || isSelected ? "14px" : "10px",
                  height: isHovered || isSelected ? "14px" : "10px",
                  borderRadius: "50%",
                  backgroundColor: dayQuadrant.color,
                  opacity: isHovered || isSelected ? 0.8 : 0.5,
                  border:
                    isHovered || isSelected
                      ? "2px solid white"
                      : "1px solid white",
                  boxShadow:
                    isHovered || isSelected
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "none",
                  zIndex: isHovered || isSelected ? 50 : 10,
                }}
                onMouseEnter={() => setHoveredDayIndex(index)}
                onMouseLeave={() => setHoveredDayIndex(null)}
                onClick={() =>
                  setSelectedDayIndex(selectedDayIndex === index ? null : index)
                }
              />

              {/* Hover/Selected 툴팁 */}
              {(isHovered || isSelected) && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${dayPos.x}%`,
                    top: `${dayPos.y}%`,
                    transform:
                      dayPos.y < 20
                        ? "translate(-20%, -20%)" // 위쪽 영역에서는 항상 같은 위치
                        : "translate(-50%, -120%)", // 아래쪽 영역에서는 항상 같은 위치
                    marginBottom: dayPos.y < 20 ? "8px" : "0",
                    marginTop: dayPos.y < 20 ? "0" : "8px",
                    zIndex: 100,
                  }}
                >
                  <div
                    className="px-3 py-2 rounded-lg shadow-lg"
                    style={{
                      backgroundColor: "#333333",
                      color: "white",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      minWidth: "140px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span style={{ fontWeight: "600" }}>{day.weekday}</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                      {(() => {
                        // YYYY-MM-DD 형식을 "2025년 1월 15일" 형식으로 변환
                        try {
                          const date = new Date(day.date + "T00:00:00+09:00");
                          return date.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                        } catch {
                          return day.date;
                        }
                      })()}
                    </div>
                    <div
                      className="mt-1.5 pt-1.5"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "0.7rem",
                      }}
                    >
                      <div>
                        쾌·불쾌: <strong>{dayValence.toFixed(2)}</strong>
                      </div>
                      <div>
                        각성·에너지: <strong>{dayArousal.toFixed(2)}</strong>
                      </div>
                      <div className="mt-1" style={{ opacity: 0.85 }}>
                        {dayQuadrant.label}
                      </div>
                      {day.dominant_emotion && (
                        <div className="mt-1" style={{ opacity: 0.85 }}>
                          {day.dominant_emotion}
                        </div>
                      )}
                    </div>
                    {/* 화살표 - 위치에 따라 방향 조정 */}
                    <div
                      className="absolute"
                      style={{
                        [dayPos.y < 20 ? "bottom" : "top"]: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        [dayPos.y < 20 ? "borderBottom" : "borderTop"]:
                          "6px solid #333333",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 주간 평균 감정 점 */}
        {pointPos && (
          <>
            {/* 펄스 링들 */}
            <div
              className="absolute"
              style={{
                left: `${pointPos.x}%`,
                top: `${pointPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: quadrant?.color || "#6B7A6F",
                opacity: 0.3,
                animation:
                  "emotion-pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                zIndex: 12,
              }}
            />
            <div
              className="absolute"
              style={{
                left: `${pointPos.x}%`,
                top: `${pointPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: quadrant?.color || "#6B7A6F",
                opacity: 0.3,
                animation:
                  "emotion-pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.5s",
                zIndex: 13,
              }}
            />
            {/* 메인 포인트 점 */}
            <div
              className="absolute"
              style={{
                left: `${pointPos.x}%`,
                top: `${pointPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: quadrant?.color || "#6B7A6F",
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                animation:
                  "emotion-point-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                zIndex: 15,
              }}
            />
          </>
        )}

        {/* 구역 레이블 */}
        <div
          className="absolute"
          style={{
            right: "12px",
            top: "12px",
            fontSize: "0.65rem",
            color: "#55685E",
            fontWeight: "500",
          }}
        >
          몰입·설렘
        </div>
        <div
          className="absolute"
          style={{
            right: "12px",
            bottom: "12px",
            fontSize: "0.65rem",
            color: "#55685E",
            fontWeight: "500",
          }}
        >
          안도·평온
        </div>
        <div
          className="absolute"
          style={{
            left: "12px",
            top: "12px",
            fontSize: "0.65rem",
            color: "#55685E",
            fontWeight: "500",
          }}
        >
          불안·초조
        </div>
        <div
          className="absolute"
          style={{
            left: "12px",
            bottom: "12px",
            fontSize: "0.65rem",
            color: "#55685E",
            fontWeight: "500",
          }}
        >
          슬픔·무기력
        </div>
      </div>
    </>
  );

  if (hideCard) {
    return chartContent;
  }

  return (
    <Card
      className="p-6 mb-4"
      style={{
        backgroundColor: "white",
        border: "1px solid #E6E4DE",
        overflow: "visible",
      }}
    >
      {chartContent}
    </Card>
  );
}
