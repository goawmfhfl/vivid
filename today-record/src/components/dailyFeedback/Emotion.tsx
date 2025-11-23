import { Heart, TrendingUp, TrendingDown, Zap, Wind } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SectionProps } from "./types";

export const EmotionSection = ({ view }: SectionProps) => {
  const valence = view.ai_mood_valence ?? 0;
  const arousal = view.ai_mood_arousal ?? 0;
  const hasEmotionData =
    view.ai_mood_valence !== null && view.ai_mood_arousal !== null;

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
  // x: -1 ~ +1 → 0 ~ 100%
  // y: 0 ~ 1 → 0 ~ 100%
  const getPointPosition = (v: number, a: number) => {
    const x = ((v + 1) / 2) * 100; // -1~+1을 0~100%로 변환
    const y = (1 - a) * 100; // 0~1을 100%~0%로 변환 (y축은 위에서 아래로)
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const pointPos = hasEmotionData ? getPointPosition(valence, arousal) : null;
  const quadrant = hasEmotionData ? getEmotionQuadrant(valence, arousal) : null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#B89A7A" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>오늘의 감정</h2>
      </div>

      {hasEmotionData ? (
        <>
          {/* 감정 좌표 시각화 */}
          <Card
            className="p-6 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
          >
            <div className="mb-4">
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7A6F",
                  marginBottom: "1rem",
                }}
              >
                감정 좌표
              </p>
              <div
                className="relative"
                style={{
                  width: "100%",
                  height: "280px",
                  backgroundColor: "#FAFAF8",
                  borderRadius: "12px",
                  border: "2px solid #E6E4DE",
                  position: "relative",
                  overflow: "hidden",
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

                {/* 감정 점 */}
                {pointPos && (
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
                      zIndex: 10,
                    }}
                  />
                )}

                {/* 축 레이블 */}
                <div
                  className="absolute"
                  style={{
                    bottom: "8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.7rem",
                    color: "#6B7A6F",
                    fontWeight: "500",
                  }}
                >
                  부정적 ← 쾌·불쾌 → 긍정적
                </div>
                <div
                  className="absolute"
                  style={{
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(-90deg)",
                    fontSize: "0.7rem",
                    color: "#6B7A6F",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                  }}
                >
                  높은 에너지 ↑ 각성·에너지 ↓ 낮은 에너지
                </div>

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
                    <TrendingUp
                      className="w-4 h-4"
                      style={{ color: "#A8BBA8" }}
                    />
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

            {/* 감정 구역 표시 */}
            {quadrant && (
              <div className="mt-4">
                <Badge
                  className="px-3 py-1.5"
                  style={{
                    backgroundColor: quadrant.color,
                    color: "white",
                    fontSize: "0.85rem",
                  }}
                >
                  {quadrant.label}
                </Badge>
              </div>
            )}
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
                  감정 해석
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
        </>
      ) : (
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
            감정 데이터가 없습니다.
          </p>
        </Card>
      )}

      {/* 감정 곡선 (emotion_curve) */}
      {view.emotion_curve && view.emotion_curve.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "1rem",
            }}
          >
            하루 감정 흐름
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {view.emotion_curve.map((emotion, index) => (
              <Badge
                key={index}
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "#EAEDE9",
                  color: "#55685E",
                  fontSize: "0.85rem",
                }}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* 대표 감정 */}
      {view.dominant_emotion && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            대표 감정
          </p>
          <p
            style={{ color: "#333333", fontSize: "1.1rem", fontWeight: "500" }}
          >
            {view.dominant_emotion}
          </p>
        </Card>
      )}

      {/* 감정 요약 */}
      {view.emotion_summary && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            감정 요약
          </p>
          <p
            style={{ color: "#333333", lineHeight: "1.7", fontSize: "0.95rem" }}
          >
            {view.emotion_summary}
          </p>
        </Card>
      )}

      {/* 감정 노트 */}
      {view.emotion_notes && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F9F3EF", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            감정 노트
          </p>
          <p
            style={{ color: "#4E4B46", lineHeight: "1.7", fontSize: "0.9rem" }}
          >
            {view.emotion_notes}
          </p>
        </Card>
      )}
    </div>
  );
};
