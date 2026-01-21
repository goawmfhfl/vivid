import { COLORS } from "@/lib/design-system";

export type EmotionIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type EmotionGroup = "negative" | "neutral" | "positive";

export const EMOTION_INTENSITIES: Array<{
  value: EmotionIntensity;
  label: string;
  color: string;
}> = [
  { value: 1, label: "아주 좋지 않음", color: COLORS.emotion.intensity[1] },
  { value: 2, label: "좋지 않음", color: COLORS.emotion.intensity[2] },
  { value: 3, label: "약간 불쾌함", color: COLORS.emotion.intensity[3] },
  { value: 4, label: "보통", color: COLORS.emotion.intensity[4] },
  { value: 5, label: "약간 기분 좋음", color: COLORS.emotion.intensity[5] },
  { value: 6, label: "기분 좋음", color: COLORS.emotion.intensity[6] },
  { value: 7, label: "아주 기분 좋음", color: COLORS.emotion.intensity[7] },
];

export const getEmotionGroup = (intensity: EmotionIntensity): EmotionGroup => {
  if (intensity <= 3) return "negative";
  if (intensity === 4) return "neutral";
  return "positive";
};

export const getEmotionIntensityLabel = (intensity: EmotionIntensity): string => {
  return (
    EMOTION_INTENSITIES.find((item) => item.value === intensity)?.label || ""
  );
};

const NEGATIVE_KEYWORDS = [
  "무너진",
  "공허한",
  "지쳐버린",
  "압도된",
  "절망적인",
  "소진된",
  "버거운",
  "감당이 안 되는",
  "길을 잃은",
  "숨 막히는",
  "답답한",
  "우울한",
  "불안한",
  "무기력한",
  "실망스러운",
  "허탈한",
  "예민한",
  "의욕 없는",
  "마음이 무거운",
  "찜찜한",
  "피곤한",
  "흐릿한",
  "집중 안 되는",
  "마음이 산만한",
  "귀찮은",
  "살짝 불편한",
  "텐션이 낮은",
  "마음이 가라앉은",
];

const NEUTRAL_KEYWORDS = [
  "평온한",
  "무난한",
  "담담한",
  "차분한",
  "안정적인",
  "고요한",
  "일상적인",
  "잔잔한",
  "그냥 그런",
  "힘이 남아있는",
  "무리 없는",
  "약간 느슨한",
  "가벼운",
  "무겁지도 가볍지도 않은",
  "숨 고른 느낌",
  "비어 있는 느낌",
  "감정이 크게 없는",
  "특별함 없는",
  "자극 없는",
  "조용한 하루",   
];

const POSITIVE_KEYWORDS = [
  "괜찮은",
  "마음이 풀린",
  "살짝 기분 좋은",
  "편안해진",
  "안도한",
  "여유가 생긴",
  "한숨 돌린",
  "미묘하게 좋은",
  "기분이 올라간",
  "나쁘지 않은",
  "만족스러운",
  "즐거운",
  "안정감 있는",
  "마음이 가벼운",
  "뿌듯한",
  "기운이 도는",
  "흐름이 좋은",
  "괜히 웃음 나는",
  "행복한",
  "벅찬",
  "감사한",
  "신나는",
  "들뜬",
  "자신감 있는",
  "충만한",
  "살아 있는 느낌의",
  "에너지가 넘치는",
  "오늘이 좋은 날인",
];

export const EMOTION_KEYWORDS: Record<EmotionGroup, string[]> = {
  negative: NEGATIVE_KEYWORDS,
  neutral: NEUTRAL_KEYWORDS,
  positive: POSITIVE_KEYWORDS,
};

export const getKeywordsForIntensity = (
  intensity: EmotionIntensity
): string[] => {
  return EMOTION_KEYWORDS[getEmotionGroup(intensity)];
};

export type EmotionFactor = {
  id: string;
  label: string;
  weights: Record<EmotionGroup, number>;
};

export const EMOTION_FACTORS: EmotionFactor[] = [
  { id: "work", label: "업무", weights: { negative: 5, neutral: 3, positive: 2 } },
  { id: "study", label: "공부", weights: { negative: 4, neutral: 3, positive: 3 } },
  { id: "achievement", label: "성과", weights: { negative: 2, neutral: 3, positive: 5 } },
  { id: "deadline", label: "마감", weights: { negative: 5, neutral: 2, positive: 1 } },
  { id: "meeting", label: "회의", weights: { negative: 4, neutral: 3, positive: 2 } },
  { id: "relationship", label: "관계", weights: { negative: 4, neutral: 3, positive: 4 } },
  { id: "family", label: "가족", weights: { negative: 3, neutral: 3, positive: 4 } },
  { id: "friends", label: "친구", weights: { negative: 2, neutral: 3, positive: 4 } },
  { id: "partner", label: "연인", weights: { negative: 3, neutral: 3, positive: 4 } },
  { id: "health", label: "건강", weights: { negative: 5, neutral: 3, positive: 3 } },
  { id: "exercise", label: "운동", weights: { negative: 2, neutral: 3, positive: 5 } },
  { id: "sleep", label: "수면", weights: { negative: 5, neutral: 3, positive: 2 } },
  { id: "meal", label: "식사", weights: { negative: 3, neutral: 3, positive: 3 } },
  { id: "rest", label: "휴식", weights: { negative: 3, neutral: 4, positive: 5 } },
  { id: "hobby", label: "취미", weights: { negative: 2, neutral: 3, positive: 5 } },
  { id: "creative", label: "창작", weights: { negative: 2, neutral: 3, positive: 5 } },
  { id: "home", label: "집안일", weights: { negative: 4, neutral: 3, positive: 2 } },
  { id: "finance", label: "돈", weights: { negative: 5, neutral: 3, positive: 2 } },
  { id: "weather", label: "날씨", weights: { negative: 3, neutral: 3, positive: 3 } },
  { id: "routine", label: "루틴", weights: { negative: 3, neutral: 4, positive: 3 } },
  { id: "alone", label: "혼자 시간", weights: { negative: 3, neutral: 4, positive: 4 } },
  { id: "social", label: "사람 많은 곳", weights: { negative: 4, neutral: 3, positive: 2 } },
  { id: "commute", label: "이동", weights: { negative: 4, neutral: 3, positive: 2 } },
  { id: "news", label: "소식/뉴스", weights: { negative: 4, neutral: 3, positive: 2 } },
  { id: "challenge", label: "도전", weights: { negative: 3, neutral: 3, positive: 4 } },
  { id: "relief", label: "안도", weights: { negative: 2, neutral: 4, positive: 5 } },
  { id: "surprise", label: "예상 밖", weights: { negative: 3, neutral: 2, positive: 4 } },
  { id: "environment", label: "환경", weights: { negative: 3, neutral: 3, positive: 3 } },
];

export const getRecommendedFactors = (
  intensity: EmotionIntensity,
  limit: number = 9
): EmotionFactor[] => {
  const group = getEmotionGroup(intensity);
  return [...EMOTION_FACTORS]
    .sort((a, b) => {
      const weightDiff = b.weights[group] - a.weights[group];
      if (weightDiff !== 0) return weightDiff;
      return a.label.localeCompare(b.label, "ko-KR");
    })
    .slice(0, limit);
};
