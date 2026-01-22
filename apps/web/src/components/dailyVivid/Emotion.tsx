import { useState } from "react";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Zap,
  Wind,
  HelpCircle,
  X,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export const EmotionSection = ({ view, isPro = false }: SectionProps) => {
  const [showValenceTooltip, setShowValenceTooltip] = useState(false);
  const [showArousalTooltip, setShowArousalTooltip] = useState(false);

  // 숫자로 변환 (복호화 과정에서 문자열로 변환될 수 있음)
  const valence = Number(view.ai_mood_valence) || 0;
  const arousal = Number(view.ai_mood_arousal) || 0;

  const hasEmotionData =
    view.ai_mood_valence !== null && view.ai_mood_arousal !== null;

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
  const quadrant = view.emotion_quadrant ?? null;
  const emotionTimeline = view.emotion_timeline ?? [];
  const emotionCurve = view.emotion_curve ?? [];
  const quadrantColor = getQuadrantColor(quadrant);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
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
          오늘의 감정
        </h2>
      </div>

      {hasEmotionData ? (
        <>
          {/* 감정 좌표 시각화 (Pro 전용) */}
          {isPro && (
            <Card
              className="p-6 mb-4"
              style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
            >
              <div className="mb-4">
                <p
                  className="text-xs"
                  style={{
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
                    <>
                      {/* 펄스 링들 - 트렌디한 신호 효과 */}
                      <div
                        className="absolute"
                        style={{
                          left: `${pointPos.x}%`,
                          top: `${pointPos.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          backgroundColor: quadrantColor,
                          opacity: 0.3,
                          animation:
                            "emotion-pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                          zIndex: 8,
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
                          backgroundColor: quadrantColor,
                          opacity: 0.3,
                          animation:
                            "emotion-pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.5s",
                          zIndex: 9,
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
                          backgroundColor: quadrantColor,
                          border: "3px solid white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          animation:
                            "emotion-point-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                          zIndex: 10,
                        }}
                      />
                    </>
                  )}

                  {/* 구역 레이블 */}
                  <div
                    className="absolute text-xs"
                    style={{
                      right: "12px",
                      top: "12px",
                      color: "#55685E",
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
                      color: "#55685E",
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
                      color: "#55685E",
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
                      className="text-xs"
                      style={{
                        color: "#6B7A6F",
                        fontWeight: "500",
                      }}
                    >
                      쾌·불쾌
                    </p>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowValenceTooltip(!showValenceTooltip)
                        }
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
                            <p style={{ fontWeight: "600" }}>쾌·불쾌</p>
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
                  <p className="text-xs" style={{ color: "#6B7A6F" }}>
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
                      className="text-xs"
                      style={{
                        color: "#6B7A6F",
                        fontWeight: "500",
                      }}
                    >
                      각성·에너지
                    </p>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowArousalTooltip(!showArousalTooltip)
                        }
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
                            <p style={{ fontWeight: "600" }}>각성·에너지</p>
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
                            <strong style={{ color: "#E5B96B" }}>0.5</strong>:
                            적당한 에너지
                            <br />
                            <strong style={{ color: "#E5B96B" }}>1.0</strong>:
                            높은 에너지 (몰입, 긴장, 흥분)
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
                  <p className="text-xs" style={{ color: "#6B7A6F" }}>
                    {getArousalDescription(arousal)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 감정 해석 */}
          {view.emotion_quadrant && view.emotion_quadrant_explanation && (
            <Card
              className="p-5 mb-4"
              style={{
                backgroundColor: "#F5F7F5",
                border: "1px solid #E0E5E0",
              }}
            >
              <div className="flex items-start gap-3">
                <Wind
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "#B89A7A" }}
                />
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      marginBottom: "0.5rem",
                    }}
                  >
                    감정 해석
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: "#4E4B46",
                      lineHeight: "1.7",
                    }}
                  >
                    {view.emotion_quadrant_explanation}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Free 모드: 감정 좌표 Pro 업그레이드 유도 */}
          {!isPro && (
            <Card
              className="p-4 mb-4"
              style={{
                backgroundColor: "#FAFAF8",
                border: "1px solid #E6E4DE",
              }}
            >
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5" style={{ color: "#6B7A6F" }} />
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{
                      color: "#4E4B46",
                    }}
                  >
                    내 감정이 어디에 서 있는지, 한눈에 보고 싶으신가요?
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      lineHeight: "1.5",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Pro 멤버십에서는 오늘의 감정을 쾌·불쾌와 에너지 좌표 위에
                    시각화해 드립니다. 감정이 ‘나를 덮치는 것’이 아니라, 내가 한
                    걸음 떨어져서 바라볼 수 있는 지도로 바뀝니다.
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      lineHeight: "1.5",
                      fontStyle: "italic",
                    }}
                  >
                    오늘의 감정을 흘려보내면, 같은 패턴을 다시 겪게 될 수
                    있어요. 지금 감정의 위치를 기록해 두면, 내일의 나를 더 잘
                    돌볼 수 있습니다.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card
          className="p-6"
          style={{ backgroundColor: "#F7F8F6", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-sm"
            style={{
              color: "#6B7A6F",
              textAlign: "center",
            }}
          >
            감정 데이터가 없습니다.
          </p>
        </Card>
      )}

      {/* 감정 정보 통합 카드 */}
      {(emotionCurve.length > 0 ||
        view.dominant_emotion ||
        (view.emotion_events && view.emotion_events.length > 0)) && (
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          {/* 감정 곡선 */}
          {emotionCurve.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "1rem",
                  fontWeight: "500",
                }}
              >
                하루 감정 흐름
              </p>
              {/* 시간대별 감정 흐름 표시 */}
              {emotionTimeline.length > 0 ? (
                <div className="space-y-3">
                  {emotionTimeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                      style={{
                        padding: "0.75rem",
                        borderRadius: "8px",
                        backgroundColor: "#FAFAF8",
                        border: "1px solid #E6E4DE",
                      }}
                    >
                      <div
                        className="text-xs font-medium"
                        style={{
                          color: "#6B7A6F",
                          minWidth: "80px",
                        }}
                      >
                        {item.time_range}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor:
                              index === 0
                                ? "#A8BBA8"
                                : index === emotionTimeline.length - 1
                                ? "#E5B96B"
                                : "#6B7A6F",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="text-sm"
                          style={{
                            color: "#4E4B46",
                            fontWeight: "500",
                          }}
                        >
                          {item.emotion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 기존 방식 (시간 정보 없을 때) */
                <div className="flex items-center gap-2 flex-wrap">
                  {emotionCurve.map((emotion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="relative text-sm px-3 py-1"
                        style={{
                          borderRadius: "20px",
                          backgroundColor: "#EAEDE9",
                          color: "#55685E",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          minWidth: "fit-content",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.05)";
                        }}
                      >
                        {/* 감정별 색상 인디케이터 */}
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor:
                              index === 0
                                ? "#A8BBA8"
                                : index === emotionCurve.length - 1
                                ? "#E5B96B"
                                : "#6B7A6F",
                            flexShrink: 0,
                          }}
                        />
                        <span>{emotion}</span>
                      </div>
                      {index < emotionCurve.length - 1 && (
                        <ArrowRight
                          className="w-4 h-4 flex-shrink-0"
                          style={{
                            color: "#6B7A6F",
                            opacity: 0.4,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* 타임라인 바 */}
              <div
                className="mt-4 gradient-line-animated"
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  opacity: 0.3,
                }}
              />
            </div>
          )}

          {/* 대표 감정 표시 */}
          {view.dominant_emotion && (
            <div className="mb-5">
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.5rem",
                }}
              >
                대표 감정
              </p>
              <p
                className="text-sm font-medium"
                style={{
                  color: "#333333",
                }}
              >
                {view.dominant_emotion}
              </p>
            </div>
          )}

          {/* 오늘의 감정을 이끈 주요 사건들 */}
          {view.emotion_events && view.emotion_events.length > 0 && (
            <div className="mt-2">
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                오늘의 감정을 이끈 주요 사건들
              </p>
              <div className="space-y-2">
                {view.emotion_events.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: "#FAFAF8",
                      border: "1px solid #E6E4DE",
                    }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "#333333", lineHeight: "1.6" }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#6B7A6F",
                        }}
                      >
                        [{item.emotion}]
                      </span>{" "}
                      {item.event}
                    </p>
                    {item.reason && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#6B7A6F", lineHeight: "1.5" }}
                      >
                        {item.reason}
                      </p>
                    )}
                    {isPro && item.suggestion && (
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: "#6B7A6F",
                          lineHeight: "1.5",
                          fontStyle: "italic",
                        }}
                      >
                        {item.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
