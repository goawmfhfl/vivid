import type { DailyVividForWeekly, RecordsForWeekly } from "./types";
import type { WeeklyReport } from "@/types/weekly-vivid";

/**
 * 모든 섹션을 포함하는 통합 프롬프트 생성
 * 단 한 번의 요청으로 모든 주간 비비드 섹션을 생성하기 위한 프롬프트
 */
export function buildUnifiedWeeklyVividPrompt(
  dailyVivid: DailyVividForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 
위 스키마에 따라 주간 비비드의 report를 생성하여 JSON만 출력하세요.\n\n`;

  // 일일 피드백 데이터를 종합하여 제공 (report만 사용)
  dailyVivid.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // Vivid Report 데이터
    if (feedback.report) {
      const dream = feedback.report;
      
      // 오늘의 VIVID (현재 모습)
      if (dream.current_summary) {
        prompt += `[오늘의 비비드 요약] ${dream.current_summary}\n`;
      }
      if (dream.current_evaluation) {
        prompt += `[오늘의 비비드 평가] ${dream.current_evaluation}\n`;
      }
      if (
        Array.isArray(dream.current_keywords) &&
        dream.current_keywords.length > 0
      ) {
        prompt += `[오늘의 비비드 키워드] ${dream.current_keywords.join(", ")}\n`;
      }

      // 앞으로의 나의 모습 (미래 비전)
      if (dream.future_summary) {
        prompt += `[기대하는 모습 요약] ${dream.future_summary}\n`;
      }
      if (dream.future_evaluation) {
        prompt += `[기대하는 모습 평가] ${dream.future_evaluation}\n`;
      }
      if (
        Array.isArray(dream.future_keywords) &&
        dream.future_keywords.length > 0
      ) {
        prompt += `[기대하는 모습 키워드] ${dream.future_keywords.join(", ")}\n`;
      }

      // 일치도 분석
      if (dream.alignment_score !== null && dream.alignment_score !== undefined) {
        prompt += `[일치도 점수] ${dream.alignment_score}\n`;
      }

      // 사용자 특성 분석
      if (
        Array.isArray(dream.user_characteristics) &&
        dream.user_characteristics.length > 0
      ) {
        prompt += `[기록을 쓰는 사람의 특징] ${dream.user_characteristics.join(", ")}\n`;
      }
      if (
        Array.isArray(dream.aspired_traits) &&
        dream.aspired_traits.length > 0
      ) {
        prompt += `[지향하는 모습] ${dream.aspired_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 데이터를 종합하여 주간 비비드의 모든 섹션을 생성하세요:

**중요 지시사항:**
1. Pro 멤버십이 아닌 경우, Pro 전용 필드는 모두 null로 출력하세요.
2. Free 멤버에게 제공하는 데이터는 간략하게 작성하세요 (토큰 사용량 최소화).
3. 날짜 표현 시 "2일차", "3일차" 같은 표현을 사용하지 말고, 정확한 날짜와 요일을 함께 언급하세요 (예: "2025년 1월 15일 (수요일)").
4. 날짜 표현 시 정확한 날짜와 요일을 함께 언급하세요.

**섹션별 요구사항:**
1. report: 일주일간의 비비드 분석 - 8개 섹션 모두 포함 (주간 비비드 요약, 평가, 키워드 분석, 앞으로의 모습 분석, 일치도 트렌드, 사용자 특징 분석, 지향하는 모습 분석, 주간 인사이트)

모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;

  return prompt;
}


export function buildWeeklyVividPrompt(
  dailyVivid: DailyVividForWeekly,
  weekRange: { start: string; end: string; timezone: string },
  userName?: string
): string {
  // 실제 포함된 날짜 목록 추출
  const includedDates = dailyVivid.map((f) => f.report_date).sort();
  const dateRangeText = `${weekRange.start}부터 ${weekRange.end}까지`;
  const actualDatesText = includedDates.join(", ");

  let prompt = `아래는 ${dateRangeText}의 일주일간 일일 피드백의 "오늘의 비비드" 데이터입니다.

**중요: 분석해야 할 날짜 범위는 ${weekRange.start}부터 ${weekRange.end}까지입니다.**
**실제로 포함된 일일 피드백 날짜: ${actualDatesText} (총 ${dailyVivid.length}개)**

위 스키마에 따라 주간 비비드 리포트(report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyVivid.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date} (${feedback.day_of_week || ""})]\n`;

    if (feedback.report) {
      const vivid = feedback.report;
      
      // 오늘의 VIVID (현재 모습)
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.current_evaluation) {
        prompt += `오늘의 비비드 평가: ${vivid.current_evaluation}\n`;
      }
      if (
        Array.isArray(vivid.current_keywords) &&
        vivid.current_keywords.length > 0
      ) {
        prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
      }

      // 앞으로의 나의 모습 (미래 비전)
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
      if (vivid.future_evaluation) {
        prompt += `기대하는 모습 평가: ${vivid.future_evaluation}\n`;
      }
      if (
        Array.isArray(vivid.future_keywords) &&
        vivid.future_keywords.length > 0
      ) {
        prompt += `기대하는 모습 키워드: ${vivid.future_keywords.join(", ")}\n`;
      }

      // 일치도 분석
      if (vivid.alignment_score !== null && vivid.alignment_score !== undefined) {
        prompt += `일치도 점수: ${vivid.alignment_score}\n`;
      }

      // 사용자 특성 분석
      if (
        Array.isArray(vivid.user_characteristics) &&
        vivid.user_characteristics.length > 0
      ) {
        prompt += `기록을 쓰는 사람의 특징: ${vivid.user_characteristics.join(", ")}\n`;
      }
      if (
        Array.isArray(vivid.aspired_traits) &&
        vivid.aspired_traits.length > 0
      ) {
        prompt += `지향하는 모습: ${vivid.aspired_traits.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 비비드 리포트(report)의 7개 섹션을 모두 생성하세요:

**⚠️ 중요: 반드시 ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간을 분석해야 합니다.**
**실제 포함된 일일 피드백 날짜: ${actualDatesText} (총 ${dailyVivid.length}개)**
**만약 특정 날짜의 데이터가 없다면, 해당 날짜를 명시적으로 언급하고 전체 기간(${weekRange.start} ~ ${weekRange.end})의 맥락에서 분석하세요.**

**섹션별 상세 요구사항:**

1. **weekly_vivid_summary (주간 비비드 요약)**
   - ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간의 비비드 기록을 종합하여 300자 내외로 요약
   - key_points: 핵심 포인트를 날짜와 해당 날짜의 기록 요약(summary)과 함께 표시
     예: { point: "집 꾸리기·이사 실무 집중", dates: [{ date: "2025-12-17", summary: "배송·설치 확인" }, { date: "2025-12-18", summary: "다이소 쇼핑" }] }
   - next_week_vision_key_points: 다음주 비전의 핵심 포인트 포함

2. **weekly_keywords_analysis (주간 키워드 분석)**
   - vision_keywords_trend: 기존 vision_keywords_trend와 동일한 구조 (keyword, days, context, related_keywords), 최대 8개, 홀수 개수(4, 6, 8개)

3. **future_vision_analysis (앞으로의 모습 종합 분석)**
   - integrated_summary: ${weekRange.start}부터 ${weekRange.end}까지의 "앞으로의 모습" 요약 통합
   - consistency_analysis: 일관성 있는 비전 vs 변화하는 비전 분석
   - evaluation_trend: 주간 비전 평가 점수 추이 (future_evaluation 점수 추이)

4. **alignment_trend_analysis (일치도 트렌드 분석)**
   - daily_alignment_scores: ${weekRange.start}부터 ${weekRange.end}까지 일치도 점수 변화 (alignment_score 추이)
   - highest_alignment_day/lowest_alignment_day: 일치도가 높았던/낮았던 날의 패턴
   - trend: "improving" | "declining" | "stable" 중 하나

5. **user_characteristics_analysis (사용자 특징 심화 분석)**
   - consistency_summary: ${userName ? `"${userName}님"` : "사용자"}을(를) 명시적으로 언급하며, ${weekRange.start}부터 ${weekRange.end}까지 특징의 일관성을 요약${userName ? ` (예: "${userName}님은 이번 주 동안...")` : ""}
   - top_5_characteristics: ${userName ? `"${userName}님"` : "사용자"}의 이름을 기반으로 명확하게 어떤 특징이 있는지 분석한 Top 5 (frequency와 dates 포함${userName ? `, 각 특징 설명 시 "${userName}님"을 포함` : ""})
   - dates: 특징이 나타난 **모든** 날짜(date)와 해당 날짜의 기록 내용을 한 줄로 명료하게 요약(summary)하여 포함하세요. **dates 배열의 길이는 frequency와 반드시 일치해야 합니다.** (예: 7회 발견 시 7개 항목 포함)
   - change_patterns: 새로 나타난 특징, 사라진 특징 분석

6. **aspired_traits_analysis (지향하는 모습 심화 분석)**
   - consistency_summary: ${weekRange.start}부터 ${weekRange.end}까지 지향하는 모습의 일관성 요약
   - top_5_aspired_traits: 가장 자주 언급된 지향 모습 Top 5 (frequency와 dates 포함)
   - dates: 지향하는 모습이 나타난 **모든** 날짜(date)와 해당 날짜의 기록 내용을 한 줄로 명료하게 요약(summary)하여 포함하세요. **dates 배열의 길이는 frequency와 반드시 일치해야 합니다.** (예: 7회 발견 시 7개 항목 포함)
   - evolution_process: 지향 모습의 진화 과정 (stages 배열)

7. **weekly_insights (주간 인사이트)**
   - patterns: ${weekRange.start}부터 ${weekRange.end}까지의 기록에서 발견한 패턴 (pattern, description, evidence)
   - unexpected_connections: 예상치 못한 연결점 (connection, description, significance)
**최종 확인: 모든 섹션에서 ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간을 분석했는지 확인하세요.**
모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;
  return prompt;
}

/**
 * 기록 기반 주간 비비드 프롬프트 생성
 * vivid-records의 실제 기록을 기반으로 주간 피드백 생성
 */
export function buildWeeklyVividPromptFromRecords(
  records: RecordsForWeekly,
  weekRange: { start: string; end: string; timezone: string },
  userName?: string
): string {
  // 기록이 없으면 빈 문자열 반환
  if (!records || records.length === 0) {
    return "";
  }

  // 날짜별로 기록 그룹화
  const recordsByDate = new Map<string, typeof records>();
  records.forEach((record) => {
    const date = record.kst_date;
    if (!recordsByDate.has(date)) {
      recordsByDate.set(date, []);
    }
    recordsByDate.get(date)!.push(record);
  });

  const dateRangeText = `${weekRange.start}부터 ${weekRange.end}까지`;
  const includedDates = Array.from(recordsByDate.keys()).sort();
  const actualDatesText = includedDates.join(", ");

  let prompt = `아래는 ${userName ? `${userName}님의 ` : ""}${dateRangeText} 일주일간의 VIVID 기록입니다.

**중요: 분석해야 할 날짜 범위는 ${weekRange.start}부터 ${weekRange.end}까지입니다.**
**실제로 포함된 기록 날짜: ${actualDatesText} (총 ${records.length}개 기록)**

VIVID 기록은 두 가지 질문으로 구성되어 있습니다:
- Q1: 오늘 하루를 어떻게 보낼까? (현재 모습)
- Q2: 앞으로의 나는 어떤 모습일까? (미래 비전)

위 스키마에 따라 주간 비비드 리포트(report)를 생성하여 JSON만 출력하세요.\n\n`;

  // 날짜별로 기록 출력
  includedDates.forEach((date) => {
    const dateRecords = recordsByDate.get(date)!;
    const dateObj = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    prompt += `\n[${date} (${dayOfWeek})]\n`;

    dateRecords.forEach((record, idx) => {
      const createdAt = new Date(record.created_at);
      const kstTime = createdAt.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });

      prompt += `\n기록 ${idx + 1} [${kstTime}]:\n${record.content}\n`;
    });
  });

  prompt += `\n\n위 기록들을 종합하여 주간 비비드 리포트(report)의 7개 섹션을 모두 생성하세요:

**⚠️ 중요: 반드시 ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간을 분석해야 합니다.**
**실제 포함된 기록 날짜: ${actualDatesText} (총 ${records.length}개 기록)**
**만약 특정 날짜의 기록이 없다면, 해당 날짜를 명시적으로 언급하고 전체 기간(${weekRange.start} ~ ${weekRange.end})의 맥락에서 분석하세요.**

**섹션별 상세 요구사항:**

1. **weekly_vivid_summary (주간 비비드 요약)**
   - ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간의 VIVID 기록을 종합하여 300자 내외로 요약
   - key_points: 핵심 포인트를 날짜와 해당 날짜의 기록 요약(summary)과 함께 표시
     예: { point: "집 꾸리기·이사 실무 집중", dates: [{ date: "2025-12-17", summary: "배송·설치 확인" }, { date: "2025-12-18", summary: "다이소 쇼핑" }] }
   - next_week_vision_key_points: 다음주 비전의 핵심 포인트 포함

2. **weekly_keywords_analysis (주간 키워드 분석)**
   - vision_keywords_trend: 기록에서 자주 등장한 키워드를 분석 (keyword, days, context, related_keywords), 최대 8개, 홀수 개수(4, 6, 8개)
   - Q1과 Q2 기록에서 공통적으로 나타나는 키워드와 각 키워드가 등장한 날짜를 분석

3. **future_vision_analysis (앞으로의 모습 종합 분석)**
   - integrated_summary: ${weekRange.start}부터 ${weekRange.end}까지의 Q2 기록("앞으로의 나는 어떤 모습일까?")을 통합하여 요약
   - consistency_analysis: 일관성 있는 비전 vs 변화하는 비전 분석
   - evaluation_trend: 주간 비전의 명확성과 일관성 추이 분석

4. **alignment_trend_analysis (일치도 트렌드 분석)**
   - daily_alignment_scores: ${weekRange.start}부터 ${weekRange.end}까지 Q1(오늘의 계획)과 Q2(미래 비전)의 일치도를 날짜별로 분석
   - highest_alignment_day/lowest_alignment_day: Q1과 Q2가 가장 잘 일치했던/일치하지 않았던 날의 패턴 분석
   - trend: "improving" | "declining" | "stable" 중 하나

5. **user_characteristics_analysis (사용자 특징 심화 분석)**
   - consistency_summary: ${userName ? `"${userName}님"` : "사용자"}을(를) 명시적으로 언급하며, ${weekRange.start}부터 ${weekRange.end}까지 기록에서 드러난 특징의 일관성을 요약${userName ? ` (예: "${userName}님은 이번 주 동안...")` : ""}
   - top_5_characteristics: ${userName ? `"${userName}님"` : "사용자"}의 이름을 기반으로 기록에서 드러난 특징을 명확하게 분석한 Top 5 (frequency와 dates 포함${userName ? `, 각 특징 설명 시 "${userName}님"을 포함` : ""})
   - dates: 특징이 나타난 **모든** 날짜(date)와 해당 날짜의 기록 내용을 한 줄로 명료하게 요약(summary)하여 포함하세요. **dates 배열의 길이는 frequency와 반드시 일치해야 합니다.** (예: 7회 발견 시 7개 항목 포함)
   - change_patterns: 새로 나타난 특징, 사라진 특징 분석

6. **aspired_traits_analysis (지향하는 모습 심화 분석)**
   - consistency_summary: ${weekRange.start}부터 ${weekRange.end}까지 Q2 기록에서 드러난 지향하는 모습의 일관성 요약
   - top_5_aspired_traits: 가장 자주 언급된 지향 모습 Top 5 (frequency와 dates 포함)
   - dates: 지향하는 모습이 나타난 **모든** 날짜(date)와 해당 날짜의 기록 내용을 한 줄로 명료하게 요약(summary)하여 포함하세요. **dates 배열의 길이는 frequency와 반드시 일치해야 합니다.** (예: 7회 발견 시 7개 항목 포함)
   - evolution_process: 지향 모습의 진화 과정 (stages 배열)

7. **weekly_insights (주간 인사이트)**
   - patterns: ${weekRange.start}부터 ${weekRange.end}까지의 기록에서 발견한 패턴 (pattern, description, evidence)
   - unexpected_connections: 예상치 못한 연결점 (connection, description, significance)

8. **title (주간 비비드 제목)**
   - 이번 주를 한 문장으로 요약하는 제목을 "~ 했던 주" 또는 "~ 했던 한 주" 형식으로 생성하세요.
   - 예시: "개발과 운동에 집중했던 주", "새로운 습관이 만들어 진 주", "자기계발과 휴식의 균형을 찾았던 주"
   - 제목은 간결하고 명확하며, 이번 주의 가장 중요한 활동이나 변화를 잘 표현해야 합니다.

9. **trend (주간 흐름 데이터)**
   - direction: 이번 주의 기록을 통해 드러난 ${userName ? `${userName}님이 ` : "사용자가 "}가고 있는 방향 (예: "자기계발과 성장에 집중하는 방향으로 나아가고 있는 사람")
   - core_value: 이번 주의 기록에서 가장 중요하게 여기는 가치 (예: "균형 잡힌 삶과 지속 가능한 성장을 추구하는 가치")
   - driving_force: 이번 주를 움직인 실제 원동력 (예: "새로운 목표를 향한 호기심과 실행력")
   - current_self: 요즘의 ${userName ? `${userName}님을 ` : "사용자를 "}한 문장으로 표현 (예: "변화를 두려워하지 않고 꾸준히 나아가는 사람")

**최종 확인: 모든 섹션에서 ${weekRange.start}부터 ${weekRange.end}까지의 전체 기간을 분석했는지 확인하세요.**
모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;
  return prompt;
}

/**
 * 주간 비비드 제목 생성 프롬프트
 * report 분석 결과를 바탕으로 "~ 했던 주" 형식의 제목 생성
 */
export function buildWeeklyTitlePrompt(
  report: WeeklyReport,
  weekRange: { start: string; end: string; timezone: string },
  userName?: string
): string {
  const dateRangeText = `${weekRange.start}부터 ${weekRange.end}까지`;
  
  const prompt = `${userName ? `${userName}님의 ` : ""}${dateRangeText} 주간 비비드 분석 결과를 바탕으로, 이번 주를 한 문장으로 요약하는 제목을 생성해주세요.

**제목 형식: "~ 했던 주" 또는 "~ 했던 한 주"**
**예시:**
- "개발과 운동에 집중했던 주"
- "새로운 습관이 만들어 진 주"
- "자기계발과 휴식의 균형을 찾았던 주"
- "프로젝트 완성과 성장을 동시에 이뤘던 주"

**분석 결과 요약:**
${report.weekly_vivid_summary?.summary || ""}

**핵심 포인트:**
${report.weekly_vivid_summary?.key_points?.map((kp: { point: string; dates: Array<{ date: string; summary: string }> }) => `- ${kp.point}`).join("\n") || ""}

**주요 키워드:**
${report.weekly_keywords_analysis?.vision_keywords_trend?.slice(0, 5).map((kw: { keyword: string; days: number; context: string; related_keywords: string[] }) => `- ${kw.keyword} (${kw.days}일)`).join("\n") || ""}

**사용자 특징:**
${report.user_characteristics_analysis?.top_5_characteristics?.slice(0, 3).map((c: { characteristic: string; frequency: number; dates: Array<{ date: string; summary: string }> }) => `- ${c.characteristic}`).join("\n") || ""}

위 분석 결과를 바탕으로, 이번 주의 가장 핵심적인 특징을 담은 제목을 "~ 했던 주" 형식으로 생성해주세요.
제목은 간결하고 명확하며, 이번 주의 가장 중요한 활동이나 변화를 잘 표현해야 합니다.
JSON 형식으로 {"title": "제목"}만 출력해주세요.`;

  return prompt;
}

/**
 * 주간 흐름 데이터(trend) 생성 프롬프트
 * report 분석 결과를 바탕으로 주간 흐름 데이터 생성
 */
export function buildWeeklyTrendPrompt(
  report: WeeklyReport,
  weekRange: { start: string; end: string; timezone: string },
  userName?: string
): string {
  const dateRangeText = `${weekRange.start}부터 ${weekRange.end}까지`;
  
  const prompt = `${userName ? `${userName}님의 ` : ""}${dateRangeText} 주간 비비드 리포트를 분석하여, 이번 주의 흐름을 나타내는 4가지 인사이트를 생성해주세요.

**분석 결과 요약:**
${report.weekly_vivid_summary?.summary || ""}

**핵심 포인트:**
${report.weekly_vivid_summary?.key_points?.map((kp: { point: string; dates: Array<{ date: string; summary: string }> }) => `- ${kp.point}`).join("\n") || ""}

**주요 키워드:**
${report.weekly_keywords_analysis?.vision_keywords_trend?.slice(0, 5).map((kw: { keyword: string; days: number; context: string; related_keywords: string[] }) => `- ${kw.keyword} (${kw.days}일)`).join("\n") || ""}

**사용자 특징:**
${report.user_characteristics_analysis?.top_5_characteristics?.slice(0, 3).map((c: { characteristic: string; frequency: number; dates: Array<{ date: string; summary: string }> }) => `- ${c.characteristic}`).join("\n") || ""}

**지향하는 모습:**
${report.aspired_traits_analysis?.top_5_aspired_traits?.slice(0, 3).map((t: { trait: string; frequency: number; dates: Array<{ date: string; summary: string }> }) => `- ${t.trait}`).join("\n") || ""}

**앞으로의 모습 종합:**
${report.future_vision_analysis?.integrated_summary || ""}

위 분석 결과를 바탕으로 다음 4가지 필드를 생성해주세요:

1. direction: 이번 주의 기록을 통해 드러난 ${userName ? `${userName}님이 ` : "사용자가 "}가고 있는 방향을 한 문장으로 작성
   예: "자기계발과 성장에 집중하는 방향으로 나아가고 있는 사람"

2. core_value: 이번 주의 기록에서 가장 중요하게 여기는 가치를 한 문장으로 작성
   예: "균형 잡힌 삶과 지속 가능한 성장을 추구하는 가치"

3. driving_force: 이번 주를 움직인 실제 원동력을 한 문장으로 작성
   예: "새로운 목표를 향한 호기심과 실행력"

4. current_self: 요즘의 ${userName ? `${userName}님을 ` : "사용자를 "}한 문장으로 표현
   예: "변화를 두려워하지 않고 꾸준히 나아가는 사람"

각 필드는 간결하고 명확하게 작성하세요.
JSON 형식으로 {"direction": "...", "core_value": "...", "driving_force": "...", "current_self": "..."}만 출력해주세요.`;

  return prompt;
}


