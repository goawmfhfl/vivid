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
 * @param categorized 카테고리화된 기록
 * @param date 날짜
 * @param records 원본 레코드 배열 (시간 정보 포함)
 */
export function buildReportPrompt(
  categorized: CategorizedRecords,
  date: string,
  records: Record[] = []
): string {
  // 한국 시간대 기준으로 요일 계산
  // date는 "YYYY-MM-DD" 형식이므로, 한국 시간대 기준으로 파싱
  // "YYYY-MM-DD"를 "YYYY-MM-DDT00:00:00+09:00" 형식으로 변환하여 KST 기준으로 파싱
  const dateObj = new Date(`${date}T00:00:00+09:00`);
  const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  let prompt = `아래는 ${date} (${dayOfWeek}) 하루의 기록을 카테고리별로 분류한 결과입니다. 위 스키마에 따라 분석하여 JSON만 출력하세요.\n\n`;
  prompt += `중요: date는 "${date}"이고, day_of_week는 반드시 "${dayOfWeek}"로 설정하세요.\n\n`;

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
    prompt += "\n";
  }

  // 감정 섹션 (시간 정보 포함)
  if (categorized.emotions.length > 0) {
    prompt += "=== 감정 기록 ===\n";
    // 레코드의 created_at 정보와 함께 표시
    const emotionRecords = records.filter((record) =>
      categorized.emotions.some((emotion) => record.content.includes(emotion))
    );

    categorized.emotions.forEach((content, idx) => {
      const relatedRecord = emotionRecords.find((r) =>
        r.content.includes(content)
      );
      if (relatedRecord) {
        // created_at을 한국 시간으로 변환하여 표시
        const createdAt = new Date(relatedRecord.created_at);
        const kstTime = createdAt.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Seoul",
        });
        prompt += `${idx + 1}. [${kstTime}] ${content}\n`;
      } else {
        prompt += `${idx + 1}. ${content}\n`;
      }
    });
    prompt += "\n";
  }

  // 레코드 시간 정보 요약
  if (records.length > 0) {
    prompt += "=== 레코드 생성 시간 정보 ===\n";
    prompt +=
      "아래 시간 정보를 참고하여 emotion_timeline을 생성하세요. 각 레코드의 created_at을 한국 시간(Asia/Seoul)으로 변환하여 시간대별로 그룹화하고, 해당 시간대의 감정을 분석하세요.\n";
    records.forEach((record, idx) => {
      const createdAt = new Date(record.created_at);
      const kstTime = createdAt.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });
      prompt += `${idx + 1}. [${kstTime}] ${record.content.substring(
        0,
        50
      )}...\n`;
    });
    prompt += "\n";
  }

  return prompt;
}
