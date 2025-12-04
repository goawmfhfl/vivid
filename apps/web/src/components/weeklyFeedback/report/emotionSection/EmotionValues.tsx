import { TrendingUp, TrendingDown, Zap, HelpCircle, X } from "lucide-react";
import { useTooltip } from "./TooltipContext";

type EmotionValuesProps = {
  valence: number;
  arousal: number;
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

export function EmotionValues({ valence, arousal }: EmotionValuesProps) {
  // 숫자로 변환 (복호화 과정에서 문자열로 변환될 수 있음)
  const valenceNum =
    typeof valence === "number" ? valence : Number(valence) || 0;
  const arousalNum =
    typeof arousal === "number" ? arousal : Number(arousal) || 0;
  const {
    setShowValenceTooltip,
    showValenceTooltip,
    setShowEngagedTooltip,
    showEngagedTooltip,
  } = useTooltip();
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div
        className="p-4 rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(184, 154, 122, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
          border: "1px solid #E6D5C3",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {valence >= 0 ? (
            <TrendingUp className="w-4 h-4" style={{ color: "#8B6F47" }} />
          ) : (
            <TrendingDown className="w-4 h-4" style={{ color: "#8B6F47" }} />
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
              onClick={() => setShowValenceTooltip(true)}
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
                style={{ color: "#8B6F47" }}
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
                  <strong style={{ color: "#8B6F47" }}>-1.0</strong>
                  : 매우 부정적 (불안, 짜증, 슬픔)
                  <br />
                  <strong style={{ color: "#8B6F47", marginTop: "0.25rem" }}>
                    0
                  </strong>
                  : 중립
                  <br />
                  <strong style={{ color: "#8B6F47", marginTop: "0.25rem" }}>
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
          {valenceNum.toFixed(2)}
        </p>
        <p className="text-xs" style={{ color: "#6B7A6F" }}>
          {getValenceDescription(valenceNum)}
        </p>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(184, 154, 122, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
          border: "1px solid #E6D5C3",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4" style={{ color: "#8B6F47" }} />
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
              onClick={() => setShowEngagedTooltip(true)}
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
                style={{ color: "#8B6F47" }}
              />
            </button>
            {showEngagedTooltip && (
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
                    onClick={() => setShowEngagedTooltip(false)}
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
                  <strong style={{ color: "#8B6F47", marginTop: "0.25rem" }}>
                    0.0
                  </strong>
                  : 낮은 에너지 (무기력, 피곤, 평온)
                  <br />
                  <strong style={{ color: "#8B6F47" }}>0.5</strong>: 적당한
                  에너지
                  <br />
                  <strong style={{ color: "#8B6F47" }}>1.0</strong>: 높은 에너지
                  (몰입, 긴장, 흥분)
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
          {arousalNum.toFixed(2)}
        </p>
        <p className="text-xs" style={{ color: "#6B7A6F" }}>
          {getArousalDescription(arousalNum)}
        </p>
      </div>
    </div>
  );
}
