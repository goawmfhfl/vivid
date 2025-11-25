import { useState, useEffect, useRef } from "react";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Zap,
  Wind,
  HelpCircle,
  X,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import type { WeeklyReportData } from "./types";

type WeeklyEmotionSectionProps = {
  emotionOverview: WeeklyReportData["emotion_overview"];
};

export function WeeklyEmotionSection({
  emotionOverview,
}: WeeklyEmotionSectionProps) {
  // 일별 감정 데이터 (기록이 있는 날짜만 포함)
  const dailyEmotions = emotionOverview?.daily_emotions || [];

  const [showValenceTooltip, setShowValenceTooltip] = useState(false);
  const [showArousalTooltip, setShowArousalTooltip] = useState(false);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭/터치 감지하여 선택 해제
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        chartContainerRef.current &&
        !chartContainerRef.current.contains(event.target as Node)
      ) {
        setSelectedDayIndex(null);
      }
    };

    // 클릭과 터치 이벤트 모두 처리
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // 감정 구역 분류 함수
  const getEmotionQuadrant = (v: number, a: number) => {
    if (v > 0 && a > 0.5) return { label: "몰입·설렘·의욕", color: "#A8BBA8" };
    if (v > 0 && a <= 0.5) return { label: "안도·평온·휴식", color: "#E5B96B" };
    if (v <= 0 && a > 0.5) return { label: "불안·초조·당황", color: "#B89A7A" };
    return { label: "슬픔·체념·무기력", color: "#6B7A6F" };
  };

  // valence 설명 텍스트
  const getValenceDescription = (v: number) => {
    if (v <= -0.5) return "아주 부정적";
    if (v <= -0.1) return "살짝 부정적";
    if (v <= 0.1) return "중립";
    if (v <= 0.5) return "살짝 긍정적";
    return "아주 긍정적";
  };

  // arousal 설명 텍스트
  const getArousalDescription = (a: number) => {
    if (a <= 0.3) return "낮은 에너지";
    if (a <= 0.6) return "적당한 에너지";
    return "높은 에너지";
  };

  // 감정 해석 텍스트 생성
  const getEmotionInterpretation = (v: number, a: number) => {
    const vDesc = getValenceDescription(v);
    const aDesc = getArousalDescription(a);
    const quadrant = getEmotionQuadrant(v, a);

    if (v <= -0.1 && a > 0.6) {
      return "조금 불안한데 몸은 바쁘게 돌아가는 상태. 긴장감 있는 몰입이나 압박감 속에서 일하는 느낌.";
    }
    if (v > 0 && a > 0.6) {
      return "에너지가 높고 기분이 좋은 상태. 몰입도가 높고 의욕이 넘치는 하루.";
    }
    if (v > 0 && a <= 0.5) {
      return "평온하고 안정적인 상태. 여유롭고 만족스러운 하루.";
    }
    if (v <= -0.1 && a <= 0.5) {
      return "에너지가 낮고 기분이 가라앉은 상태. 무기력하거나 지친 느낌.";
    }
    return `${vDesc}이고 ${aDesc}인 상태. ${quadrant.label}에 가까운 감정입니다.`;
  };

  // 2D 좌표계에서 점의 위치 계산 (x: valence, y: arousal)
  // 0.0 값일 때도 점이 보이도록 최소/최대 위치를 조정
  const getPointPosition = (v: number, a: number) => {
    // valence: -1~+1을 0~100%로 변환하되, 5%~95% 범위로 제한 (구석 방지)
    const rawX = ((v + 1) / 2) * 100;
    const x = Math.max(5, Math.min(95, rawX));

    // arousal: 0~1을 100%~0%로 변환하되, 5%~95% 범위로 제한 (구석 방지)
    const rawY = (1 - a) * 100;
    const y = Math.max(5, Math.min(95, rawY));

    return { x, y };
  };

  // emotion_overview에서 주간 평균 감정 데이터 가져오기 (AI가 생성)
  const weeklyAverage =
    emotionOverview &&
    emotionOverview.ai_mood_valence !== null &&
    emotionOverview.ai_mood_arousal !== null
      ? {
          valence: emotionOverview.ai_mood_valence,
          arousal: emotionOverview.ai_mood_arousal,
        }
      : null;

  if (!weeklyAverage) {
    return (
      <div className="mb-10 sm:mb-12">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#B89A7A" }}
          >
            <Heart className="w-4 h-4 text-white" />
          </div>
          <h2
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: "#333333" }}
          >
            이번 주 감정
          </h2>
        </div>
        <Card
          className="p-6"
          style={{ backgroundColor: "#F7F8F6", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              color: "#6B7A6F",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            이번 주 감정 데이터가 없습니다.
          </p>
        </Card>
      </div>
    );
  }

  const valence = weeklyAverage?.valence ?? 0;
  const arousal = weeklyAverage?.arousal ?? 0;
  const pointPos = getPointPosition(valence, arousal);
  const quadrant = getEmotionQuadrant(valence, arousal);

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#B89A7A" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          이번 주 감정
        </h2>
      </div>

      {/* 주간 평균 감정 좌표 시각화 */}
      <Card
        className="p-6 mb-4"
        style={{
          backgroundColor: "white",
          border: "1px solid #E6E4DE",
          overflow: "visible",
        }}
      >
        <div className="mb-4">
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "1rem",
            }}
          >
            주간 평균 감정 좌표
          </p>
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
                      setSelectedDayIndex(
                        selectedDayIndex === index ? null : index
                      )
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
                          <span style={{ fontWeight: "600" }}>
                            {day.weekday}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                          {day.date}
                        </div>
                        <div
                          className="mt-1.5 pt-1.5"
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.2)",
                            fontSize: "0.7rem",
                          }}
                        >
                          <div>
                            Valence: <strong>{dayValence.toFixed(2)}</strong>
                          </div>
                          <div>
                            Arousal: <strong>{dayArousal.toFixed(2)}</strong>
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
        </div>

        {/* 수치 표시 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F7F8F6",
              border: "1px solid #E6E4DE",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {valence >= 0 ? (
                <TrendingUp className="w-4 h-4" style={{ color: "#A8BBA8" }} />
              ) : (
                <TrendingDown
                  className="w-4 h-4"
                  style={{ color: "#B89A7A" }}
                />
              )}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B7A6F",
                  fontWeight: "500",
                }}
              >
                쾌·불쾌 (Valence)
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowValenceTooltip(!showValenceTooltip)}
                  className="cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <HelpCircle
                    className="w-3.5 h-3.5"
                    style={{ color: "#6B7A6F" }}
                  />
                </button>
                {showValenceTooltip && (
                  <div
                    className="absolute"
                    style={{
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginBottom: "8px",
                      width: "240px",
                      padding: "12px",
                      backgroundColor: "#333333",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      lineHeight: "1.5",
                      zIndex: 100,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p style={{ fontWeight: "600" }}>쾌·불쾌 (Valence)</p>
                      <button
                        onClick={() => setShowValenceTooltip(false)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p>
                      기분이 좋은가, 나쁜가를 나타내는 값입니다.
                      <br />
                      <strong style={{ color: "#A8BBA8" }}>-1.0</strong>
                      : 매우 부정적 (불안, 짜증, 슬픔)
                      <br />
                      <strong
                        style={{ color: "#A8BBA8", marginTop: "0.25rem" }}
                      >
                        0
                      </strong>
                      : 중립
                      <br />
                      <strong
                        style={{ color: "#A8BBA8", marginTop: "0.25rem" }}
                      >
                        +1.0
                      </strong>
                      : 매우 긍정적 (설렘, 감사, 자신감)
                    </p>
                    <div
                      className="absolute"
                      style={{
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderTop: "6px solid #333333",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p
              style={{
                fontSize: "1.5rem",
                color: "#333333",
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              {valence.toFixed(2)}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6B7A6F" }}>
              {getValenceDescription(valence)}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F7F8F6",
              border: "1px solid #E6E4DE",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: "#E5B96B" }} />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B7A6F",
                  fontWeight: "500",
                }}
              >
                각성·에너지 (Arousal)
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowArousalTooltip(!showArousalTooltip)}
                  className="cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <HelpCircle
                    className="w-3.5 h-3.5"
                    style={{ color: "#6B7A6F" }}
                  />
                </button>
                {showArousalTooltip && (
                  <div
                    className="absolute"
                    style={{
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginBottom: "8px",
                      width: "250px",
                      padding: "12px",
                      backgroundColor: "#333333",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      lineHeight: "1.5",
                      zIndex: 100,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p style={{ fontWeight: "600" }}>각성·에너지 (Arousal)</p>
                      <button
                        onClick={() => setShowArousalTooltip(false)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p>
                      에너지가 높은가, 낮은가를 나타내는 값입니다.
                      <br />
                      <strong
                        style={{ color: "#E5B96B", marginTop: "0.25rem" }}
                      >
                        0.0
                      </strong>
                      : 낮은 에너지 (무기력, 피곤, 평온)
                      <br />
                      <strong style={{ color: "#E5B96B" }}>0.5</strong>: 적당한
                      에너지
                      <br />
                      <strong style={{ color: "#E5B96B" }}>1.0</strong>: 높은
                      에너지 (몰입, 긴장, 흥분)
                    </p>
                    <div
                      className="absolute"
                      style={{
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderTop: "6px solid #333333",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p
              style={{
                fontSize: "1.5rem",
                color: "#333333",
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              {arousal.toFixed(2)}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6B7A6F" }}>
              {getArousalDescription(arousal)}
            </p>
          </div>
        </div>
      </Card>

      {/* 감정 해석 */}
      <Card
        className="p-5 mb-4"
        style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
      >
        <div className="flex items-start gap-3">
          <Wind
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "#B89A7A" }}
          />
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7A6F",
                marginBottom: "0.5rem",
              }}
            >
              주간 감정 해석
            </p>
            <p
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
                fontSize: "0.95rem",
              }}
            >
              {getEmotionInterpretation(valence, arousal)}
            </p>
          </div>
        </div>
      </Card>

      {/* 쾌-불쾌, 각성-에너지 설명 및 반복 패턴 */}
      {emotionOverview && (
        <div className="space-y-4">
          {/* 설명 섹션 */}
          <Card
            className="p-5"
            style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
          >
            <div className="space-y-4">
              {/* 쾌-불쾌 설명 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "#6B7A6F" }}
                  />
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    쾌-불쾌 (Valence)
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6B7A6F",
                    lineHeight: "1.6",
                  }}
                >
                  {emotionOverview.valence_explanation}
                </p>
              </div>

              {/* 각성-에너지 설명 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" style={{ color: "#6B7A6F" }} />
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    각성-에너지 (Arousal)
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6B7A6F",
                    lineHeight: "1.6",
                  }}
                >
                  {emotionOverview.arousal_explanation}
                </p>
              </div>
            </div>
          </Card>

          {/* 반복 패턴 섹션 */}
          {(emotionOverview.valence_patterns.length > 0 ||
            emotionOverview.arousal_patterns.length > 0) && (
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#333333",
                  marginBottom: "1rem",
                }}
              >
                감정 패턴 분석
              </h3>
              <div className="space-y-4">
                {/* 쾌-불쾌 패턴 */}
                {emotionOverview.valence_patterns.length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        color: "#6B7A6F",
                        marginBottom: "0.5rem",
                      }}
                    >
                      쾌-불쾌 패턴
                    </h4>
                    <ul className="space-y-2">
                      {emotionOverview.valence_patterns.map((pattern, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: "0.85rem",
                            color: "#333333",
                            lineHeight: "1.6",
                            paddingLeft: "1rem",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: "0",
                              color: "#6B7A6F",
                            }}
                          >
                            •
                          </span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 각성-에너지 패턴 */}
                {emotionOverview.arousal_patterns.length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        color: "#6B7A6F",
                        marginBottom: "0.5rem",
                      }}
                    >
                      각성-에너지 패턴
                    </h4>
                    <ul className="space-y-2">
                      {emotionOverview.arousal_patterns.map((pattern, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: "0.85rem",
                            color: "#333333",
                            lineHeight: "1.6",
                            paddingLeft: "1rem",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: "0",
                              color: "#6B7A6F",
                            }}
                          >
                            •
                          </span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
