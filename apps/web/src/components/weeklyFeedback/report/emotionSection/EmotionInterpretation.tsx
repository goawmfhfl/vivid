import { Wind } from "lucide-react";
import { Card } from "../../../ui/card";

type EmotionInterpretationProps = {
  valence: number;
  arousal: number;
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
    return "에너지가 높고 기분이 좋은 상태. 몰입도가 높고 의욕이 넘치는 주간.";
  }
  if (v > 0 && a <= 0.5) {
    return "평온하고 안정적인 상태. 여유롭고 만족스러운 주간.";
  }
  if (v <= -0.1 && a <= 0.5) {
    return "에너지가 낮고 기분이 가라앉은 상태. 무기력하거나 지친 느낌.";
  }
  return `${vDesc}이고 ${aDesc}인 상태. ${quadrant.label}에 가까운 감정입니다.`;
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

// 감정 구역 분류 함수
const getEmotionQuadrant = (v: number, a: number) => {
  if (v > 0 && a > 0.5) return { label: "몰입·설렘·의욕", color: "#A8BBA8" };
  if (v > 0 && a <= 0.5) return { label: "안도·평온·휴식", color: "#E5B96B" };
  if (v <= 0 && a > 0.5) return { label: "불안·초조·당황", color: "#B89A7A" };
  return { label: "슬픔·체념·무기력", color: "#6B7A6F" };
};

export function EmotionInterpretation({
  valence,
  arousal,
}: EmotionInterpretationProps) {
  return (
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
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.5rem",
            }}
          >
            주간 감정 해석
          </p>
          <p
            className="text-sm"
            style={{
              color: "#4E4B46",
              lineHeight: "1.7",
            }}
          >
            {getEmotionInterpretation(valence, arousal)}
          </p>
        </div>
      </div>
    </Card>
  );
}
