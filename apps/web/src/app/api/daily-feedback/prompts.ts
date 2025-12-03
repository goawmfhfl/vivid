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
    ? [
        "꿈/목표 리포트를 생성하세요.",
        "아래 JSON 스키마에 맞게 채워주세요.",
        "",
        "1) summary:",
        "- 오늘 시각화에서 떠오른 장면과 감정을 한두 문단으로 요약합니다.",
        "- 사용자가 하루를 다시 떠올릴 수 있을 정도로 구체적이되, 최대 250자 이내로 작성하세요.",
        "",
        "2) vision_self:",
        "- 이 시각화를 선택한 나 자신의 태도와 상태를 짧게 정리합니다.",
        "- 자기비난이 아니라, 성장 가능성을 보는 따뜻한 시선으로 200자 이내로 작성하세요.",
        "",
        "3) vision_keywords:",
        "- 이 비전을 잘 대표하는 키워드를 3~7개 정도 뽑아주세요.",
        "- 단어 위주로, 너무 긴 문장은 피하세요.",
        "",
        "4) dream_goals:",
        "- 이 시각화를 통해 사용자가 이루고 싶어 하는 구체적인 꿈/목표 리스트를 정리합니다.",
        "- 각 항목은 한 문장으로, 행동이나 장면이 떠오를 정도로 구체적으로 작성하고 최대 5개 이내로 제한하세요.",
        '- 예: "매주 3번 아침에 차분하게 일기 쓰는 루틴을 만들기", "내가 정말 원하는 일에 시간을 더 많이 쓰는 한 달 만들기"',
        "",
        "5) dreamer_traits:",
        "- 이런 꿈을 꾸는 사람이 가진 특징을 정리합니다.",
        "- '너는 이런 사람이다'라고 낙인찍지 말고, 가능성과 방향성을 보여주는 문장으로 3~5개 작성하세요.",
        '- 예: "내 감정과 욕구를 진지하게 바라보려는 사람", "남의 기준보다 자기 기준을 찾고 싶은 사람"',
        "",
        "톤은 담백하고 과하지 않게, 사용자를 조용히 응원하는 호스트처럼 작성하세요.",
      ].join("\n")
    : [
        "꿈/목표 리포트를 간단하게 생성하세요.",
        "아래 JSON 스키마에 맞게 채워주세요.",
        "",
        "1) summary는 오늘 시각화를 한 단락으로 요약하되 150자 이내로 간결하게 작성하세요.",
        "2) vision_self는 나에 대한 짧은 메모로 150자 이내로 작성하세요.",
        "3) vision_keywords는 핵심 키워드 3~5개 정도만 뽑아서 너무 길지 않게 작성하세요.",
        "4) dream_goals와 dreamer_traits는 Free 유저에게는 굳이 채우지 않아도 됩니다. 채우더라도 2~3개 이내의 짧은 문장만 사용하세요.",
      ].join("\n");

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 꿈/목표 기록입니다.\n${instruction}\n\n`;

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
    ? [
        "인사이트 리포트를 생성하세요. 아래 지침을 따라주세요:",
        "",
        "1) core_insights:",
        "- 오늘의 인사이트 기록들을 분석하여 핵심 인사이트 리스트를 작성합니다.",
        "- 각 인사이트는 한 문장으로 명확하게 작성하고, 최대 5개 이내로 제한하세요.",
        "- 각 인사이트마다 source를 함께 작성합니다. 출처는 구체적으로 명시하세요.",
        '- 예: { "insight": "내 감정을 기록할 때마다 더 명확해진다", "source": "오늘의 감정 기록" }',
        '- 예: { "insight": "완벽하려 하지 않을 때 더 지속할 수 있다", "source": "일상 기록" }',
        "",
        "2) meta_question:",
        "- 오늘의 인사이트를 더 발전시키는 방법을 간단하고 실용적으로 제시합니다.",
        "- 너무 상세하거나 철학적이지 말고, 내일 바로 시도해볼 수 있는 구체적인 질문이나 방법을 1~2문장으로 작성하세요.",
        '- 예: "이 인사이트를 내일 하루에 어떻게 적용해볼까?"',
        '- 예: "이 깨달음을 일주일 동안 기록해보면 어떤 패턴이 보일까?"',
        "",
        "3) insight_next_actions:",
        "- 오늘의 인사이트를 행동으로 옮길 수 있는 아주 작은 다음 행동을 1~2개 제안하세요.",
        "- 각 항목은 label(행동 문장), difficulty(난이도: 낮음/보통/높음), estimated_minutes(예상 소요 시간, 분 단위)를 포함해야 합니다.",
        '- 예: { "label": "내일 아침 10분 동안 오늘 떠올랐던 생각을 한 번 더 적어보기", "difficulty": "낮음", "estimated_minutes": 10 }',
        '- 예: { "label": "비슷한 상황이 올 때 떠올리고 싶은 문장을 한 줄 정리해두기", "difficulty": "보통", "estimated_minutes": 5 }',
        "",
        "4) insight_ai_comment:",
        "- 인사이트에 대한 AI의 따뜻한 코멘트를 작성합니다.",
        "- 조언보다는 공감과 응원의 톤으로, 사용자가 자신의 인사이트를 소중히 여기도록 도와주세요.",
        "",
        "톤은 담백하고 과하지 않게, 사용자를 조용히 응원하는 호스트처럼 작성하세요.",
      ].join("\n")
    : [
        "인사이트 리포트를 간단하게 생성하세요.",
        "아래 JSON 스키마에 맞게 채워주세요.",
        "",
        "1) core_insights는 오늘의 인사이트 기록을 분석하여 핵심 인사이트 2~3개를 리스트로 작성하세요.",
        "2) 각 인사이트는 한 문장으로 간결하게 작성하고, source는 간단하게 명시하세요.",
        "3) meta_question은 Free 유저에서는 null로 설정하거나, 아주 짧은 1문장만 사용하세요.",
        "4) insight_next_actions는 Free 유저에서는 null로 설정하세요. (Pro 전용 필드입니다.)",
        "5) insight_ai_comment는 사용자의 인사이트를 가볍게 요약하거나 응원하는 한두 문장으로 작성하세요.",
      ].join("\n");

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 인사이트 기록입니다.\n${instruction}\n\n`;

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
    ? [
        "피드백 리포트를 생성하세요. 아래 지침을 따라주세요:",
        "",
        "1) core_feedback:",
        "- 오늘의 피드백 기록을 종합하여 핵심 피드백을 한 문단으로 작성하세요.",
        "",
        "2) positives:",
        "- 잘한 점을 최대 6개까지 구체적으로 작성하세요.",
        "- 각 항목은 한 문장으로, 행동이나 태도가 명확하게 드러나도록 작성하세요.",
        "",
        "3) improvements:",
        "- 개선할 점을 최대 6개까지 구체적으로 작성하세요.",
        "- 각 항목은 한 문장으로, 구체적이고 실행 가능한 방향을 제시하세요.",
        "",
        "4) ai_message:",
        "- 사용자를 응원하는 메시지를 작성하세요.",
        "- 하루를 마무리하며 앞으로의 성장을 격려하는 따뜻한 문장으로 작성하세요.",
        "",
        "5) feedback_person_traits:",
        "- 이 피드백을 통해 알 수 있는 사용자의 특징을 최대 5개까지 작성하세요.",
        "- '너는 이런 사람이다'라고 낙인찍지 말고, 가능성과 방향성을 보여주는 문장으로 작성하세요.",
        '- 예: "자기 자신을 객관적으로 바라보려는 사람", "성장을 위해 솔직하게 기록하는 사람"',
        "",
        "톤은 담백하고 과하지 않게, 사용자를 조용히 응원하는 호스트처럼 작성하세요.",
      ].join("\n")
    : [
        "피드백 리포트를 간단하게 생성하세요.",
        "아래 JSON 스키마에 맞게 채워주세요.",
        "",
        "1) core_feedback은 오늘의 피드백 기록을 한 문단으로 요약하세요.",
        "2) positives는 잘한 점을 2~3개 정도만 간결하게 작성하세요.",
        "3) improvements는 개선할 점을 2~3개 정도만 간결하게 작성하세요. (Pro 전용: 최대 6개)",
        "4) ai_message는 Free 유저에서는 null로 설정하세요. (Pro 전용 필드입니다.)",
        "5) feedback_person_traits는 Free 유저에서는 null로 설정하세요. (Pro 전용 필드입니다.)",
      ].join("\n");

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 피드백 기록입니다.\n${instruction}\n\n`;

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
    prompt += "\n";
  }

  if (dailyReport) {
    prompt += "=== 일상 리포트 ===\n";
    prompt += `요약: ${dailyReport.summary}\n`;
    prompt += `오늘 있었던 일: ${dailyReport.daily_events.join(", ")}\n`;
    prompt += `키워드: ${dailyReport.keywords.join(", ")}\n`;
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
    prompt += `핵심 인사이트: ${insightReport.core_insights
      .map((i) => i.insight)
      .join(", ")}\n`;
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
