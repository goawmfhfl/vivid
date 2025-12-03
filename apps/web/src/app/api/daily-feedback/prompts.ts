import type { Record } from "./types";
import type {
  SummaryReport,
  DailyReport,
  EmotionReport,
  DreamReport,
  InsightReport,
  FeedbackReport,
  FinalReport,
} from "@/types/daily-feedback";

/**
 * 전체 요약 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildSummaryPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const instruction = isPro
    ? "전체를 종합하여 상세하고 깊이 있는 요약 리포트를 생성하세요. 더 많은 세부사항과 인사이트를 포함하세요."
    : "전체를 종합하여 간단하게 요약 리포트를 생성하세요. 핵심만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 모든 기록입니다. ${instruction}\n\n`;

  records.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] [${record.type}] ${record.content}\n`;
  });

  return prompt;
}

/**
 * 일상 기록 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildDailyPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const dailyRecords = records.filter((r) => r.type === "daily");

  if (dailyRecords.length === 0) {
    return "";
  }

  const instruction = isPro
    ? `일상 리포트를 생성하세요. 
- summary: 오늘 하루의 요약을 200자 이내로 작성하세요 (상세하게).
- daily_events: 오늘 있었던 구체적인 일들을 리스트 형식으로 작성하세요 (최대 15개).
- keywords: 핵심 키워드를 추출하세요 (최대 10개).
- lesson: 배운 점을 작성하세요.
- ai_comment: AI 코멘트를 작성하세요.
- emotion_triggers: 감정을 만든 사건·사람·상황을 다음 4가지 카테고리로 분류하세요:
  * people: 직장동료, 가족, 연인, 친구 등 사람 관련
  * work: 데드라인, 불안, 일정폭주 등 업무 관련
  * environment: 날씨, 피로, 금전 등 환경 관련
  * self: 기대, 비교, 자기비판 등 자기 요인
- behavioral_clues: 오늘 기록 속에서 나타나는 행동 패턴을 다음 5가지로 분류하세요:
  * avoidance: 회피 행동
  * routine_attempt: 루틴 시도
  * routine_failure: 루틴 실패
  * impulsive: 즉흥 충동
  * planned: 계획적 행동`
    : `일상 리포트를 간단하게 생성하세요. 
- summary: 오늘 하루의 요약을 150자 이내로 작성하세요 (간단하게).
- daily_events: 오늘 있었던 구체적인 일들을 리스트 형식으로 작성하세요 (최대 10개).
- keywords: 핵심 키워드를 추출하세요 (최대 5개).
- lesson: 배운 점을 작성하세요.
- ai_comment: AI 코멘트를 작성하세요.
- emotion_triggers: null로 설정하세요.
- behavioral_clues: null로 설정하세요.`;

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 일상 기록입니다. ${instruction}\n\n`;

  dailyRecords.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] ${record.content}\n`;
  });

  return prompt;
}

/**
 * 감정 기록 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildEmotionPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const emotionRecords = records.filter((r) => r.type === "emotion");

  if (emotionRecords.length === 0) {
    return "";
  }

  const instruction = isPro
    ? "감정 리포트를 생성하세요. 상세한 감정 분석과 시간대별 변화를 깊이 있게 분석하세요."
    : "감정 리포트를 간단하게 생성하세요. 핵심 감정만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 감정 기록입니다. ${instruction}\n\n`;

  emotionRecords.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] ${record.content}\n`;
  });

  // 시간 정보 요약
  prompt += "\n=== 레코드 생성 시간 정보 ===\n";
  prompt +=
    "위 시간 정보를 참고하여 emotion_timeline을 생성하세요. 각 레코드의 created_at을 한국 시간(Asia/Seoul)으로 변환하여 시간대별로 그룹화하고, 해당 시간대의 감정을 분석하세요.\n";
  prompt +=
    "중요: emotion_timeline은 최대 5개까지만 생성하세요. 가장 중요한 시간대의 감정 변화만 선별하여 포함하고, 비슷한 시간대의 감정은 통합하거나 가장 대표적인 감정만 선택하세요.\n";

  return prompt;
}

/**
 * 꿈/목표 기록 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildDreamPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const dreamRecords = records.filter((r) => r.type === "dream");

  if (dreamRecords.length === 0) {
    return "";
  }

  const instruction = isPro
    ? "꿈/목표 리포트를 생성하세요. 상세한 비전 분석과 구체적인 피드백을 포함하세요."
    : "꿈/목표 리포트를 간단하게 생성하세요. 핵심만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 꿈/목표 기록입니다. ${instruction}\n\n`;

  dreamRecords.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] ${record.content}\n`;
  });

  return prompt;
}

/**
 * 인사이트 기록 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildInsightPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const insightRecords = records.filter((r) => r.type === "insight");

  if (insightRecords.length === 0) {
    return "";
  }

  const instruction = isPro
    ? "인사이트 리포트를 생성하세요. 깊이 있는 분석과 메타적 사고를 포함하세요."
    : "인사이트 리포트를 간단하게 생성하세요. 핵심만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 인사이트 기록입니다. ${instruction}\n\n`;

  insightRecords.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] ${record.content}\n`;
  });

  return prompt;
}

/**
 * 피드백 기록 리포트 프롬프트 생성
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildFeedbackPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): string {
  const feedbackRecords = records.filter((r) => r.type === "feedback");

  if (feedbackRecords.length === 0) {
    return "";
  }

  const instruction = isPro
    ? "피드백 리포트를 생성하세요. 상세한 분석과 구체적인 개선 제안을 포함하세요."
    : "피드백 리포트를 간단하게 생성하세요. 핵심만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 피드백 기록입니다. ${instruction}\n\n`;

  feedbackRecords.forEach((record, idx) => {
    const createdAt = new Date(record.created_at);
    const kstTime = createdAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    prompt += `${idx + 1}. [${kstTime}] ${record.content}\n`;
  });

  return prompt;
}

/**
 * 최종 리포트 프롬프트 생성 (모든 리포트를 종합)
 * @param isPro Pro 멤버십 여부에 따라 프롬프트 지시사항 차별화
 */
export function buildFinalPrompt(
  date: string,
  dayOfWeek: string,
  summaryReport: SummaryReport | null,
  dailyReport: DailyReport | null,
  emotionReport: EmotionReport | null,
  dreamReport: DreamReport | null,
  insightReport: InsightReport | null,
  feedbackReport: FeedbackReport | null,
  isPro: boolean = false
): string {
  const instruction = isPro
    ? "이를 종합하여 하루를 정리하는 상세하고 깊이 있는 최종 리포트를 생성하세요. 더 많은 인사이트와 조언을 포함하세요."
    : "이를 종합하여 하루를 정리하는 간단한 최종 리포트를 생성하세요. 핵심만 간결하게 알려주세요.";

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 모든 리포트입니다. ${instruction}\n\n`;

  if (summaryReport) {
    prompt += "=== 전체 요약 ===\n";
    prompt += `요약: ${summaryReport.summary}\n`;
    prompt += `핵심 포인트: ${summaryReport.key_points.join(", ")}\n`;
    if (summaryReport.overall_score !== null) {
      prompt += `전체 점수: ${summaryReport.overall_score}/10\n`;
    }
    prompt += "\n";
  }

  if (dailyReport) {
    prompt += "=== 일상 리포트 ===\n";
    prompt += `요약: ${dailyReport.summary}\n`;
    prompt += `서사: ${dailyReport.narrative}\n`;
    prompt += `키워드: ${dailyReport.keywords.join(", ")}\n`;
    if (dailyReport.lesson) {
      prompt += `배운 점: ${dailyReport.lesson}\n`;
    }
    prompt += "\n";
  }

  if (emotionReport) {
    prompt += "=== 감정 리포트 ===\n";
    prompt += `감정 흐름: ${emotionReport.emotion_curve.join(" → ")}\n`;
    if (emotionReport.dominant_emotion) {
      prompt += `대표 감정: ${emotionReport.dominant_emotion}\n`;
    }
    prompt += "\n";
  }

  if (dreamReport) {
    prompt += "=== 꿈/목표 리포트 ===\n";
    prompt += `요약: ${dreamReport.summary}\n`;
    prompt += `자기 평가: ${dreamReport.vision_self}\n`;
    prompt += "\n";
  }

  if (insightReport) {
    prompt += "=== 인사이트 리포트 ===\n";
    prompt += `핵심 인사이트: ${insightReport.core_insight}\n`;
    prompt += "\n";
  }

  if (feedbackReport) {
    prompt += "=== 피드백 리포트 ===\n";
    prompt += `핵심 피드백: ${feedbackReport.core_feedback}\n`;
    if (feedbackReport.positives.length > 0) {
      prompt += `긍정적 측면: ${feedbackReport.positives.join(", ")}\n`;
    }
    if (feedbackReport.improvements.length > 0) {
      prompt += `개선점: ${feedbackReport.improvements.join(", ")}\n`;
    }
    prompt += "\n";
  }

  prompt +=
    "위 모든 리포트를 종합하여 하루를 정리하는 마무리 멘트를 작성하세요.";

  return prompt;
}
