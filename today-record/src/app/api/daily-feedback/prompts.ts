import type { Record, CategorizedRecords } from "./types";

/**
 * 기록을 카테고리화하기 위한 프롬프트 생성
 */
export function buildCategorizationPrompt(
  records: Record[],
  date: string
): string {
  let prompt = `아래는 ${date} 하루의 기록입니다. 위 규칙에 따라 각 기록을 insights, feedbacks, visualizings 세 가지 카테고리로 분류하여 JSON만 출력하세요.\n\n`;

  records.forEach((record, idx) => {
    prompt += `${idx + 1}. ${record.content}\n`;
  });

  return prompt;
}

/**
 * 카테고리화된 데이터를 리포트 생성 프롬프트로 변환
 */
export function buildReportPrompt(
  categorized: CategorizedRecords,
  date: string
): string {
  let prompt = `아래는 ${date} 하루의 기록을 카테고리별로 분류한 결과입니다. 위 스키마에 따라 분석하여 JSON만 출력하세요.\n\n`;

  // 시각화 섹션
  if (categorized.visualizings.length > 0) {
    prompt += "=== 시각화 기록 ===\n";
    categorized.visualizings.forEach((content, idx) => {
      prompt += `${idx + 1}. ${content}\n`;
    });
    prompt += "\n";
  }

  // Insight 섹션
  if (categorized.insights.length > 0) {
    prompt += "=== 인사이트 기록 ===\n";
    categorized.insights.forEach((content, idx) => {
      prompt += `${idx + 1}. ${content}\n`;
    });
    prompt += "\n";
  }

  // Feedback 섹션
  if (categorized.feedbacks.length > 0) {
    prompt += "=== 피드백 기록 ===\n";
    categorized.feedbacks.forEach((content, idx) => {
      prompt += `${idx + 1}. ${content}\n`;
    });
  }

  return prompt;
}
