import type { Record } from "../../daily-vivid/types";

/**
 * 기록 기반 월간 비비드 프롬프트 생성
 * vivid-records의 실제 기록을 기반으로 월간 피드백 생성
 */
export function buildVividReportPromptFromRecords(
  records: Record[],
  month: string,
  dateRange: { start_date: string; end_date: string },
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

  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;
  const dateRangeText = `${dateRange.start_date}부터 ${dateRange.end_date}까지`;
  const includedDates = Array.from(recordsByDate.keys()).sort();
  const actualDatesText = includedDates.join(", ");

  let prompt = `아래는 ${userName ? `${userName}님의 ` : ""}${monthLabel} (${dateRangeText}) 한 달간의 VIVID 기록입니다.

**중요: 분석해야 할 날짜 범위는 ${dateRange.start_date}부터 ${dateRange.end_date}까지입니다.**
**실제로 포함된 기록 날짜: ${actualDatesText} (총 ${records.length}개 기록)**

VIVID 기록은 두 가지 질문으로 구성되어 있습니다:
- Q1: 오늘 하루를 어떻게 보낼까? (현재 모습)
- Q2: 앞으로의 나는 어떤 모습일까? (미래 비전)

위 스키마에 따라 월간 비비드 리포트(report)를 생성하여 JSON만 출력하세요.\n\n`;

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

  prompt += `\n\n위 기록들을 종합하여 월간 비비드 리포트(report)의 5개 섹션을 모두 생성하세요:

**⚠️ 중요: 반드시 ${dateRange.start_date}부터 ${dateRange.end_date}까지의 전체 기간을 분석해야 합니다.**
**실제 포함된 기록 날짜: ${actualDatesText} (총 ${records.length}개 기록)**
**만약 특정 날짜의 기록이 없다면, 해당 날짜를 명시적으로 언급하고 전체 기간(${dateRange.start_date} ~ ${dateRange.end_date})의 맥락에서 분석하세요.**

## 5개 섹션 구성:

### 1. 비전 진화 스토리 (30%)
- Q2 기록("앞으로의 나는 어떤 모습일까?")을 분석하여 한 달 동안 "앞으로의 나"가 어떻게 변했는지 추적하세요.
- core_visions: 반복적으로 등장한 비전들을 추출하고, 각 비전의 일관성(consistency, 0-1)을 계산하세요. 각 비전이 등장한 날짜를 포함하세요.
- priority_shifts: 비전의 우선순위가 바뀐 시점과 이유를 분석하세요. 구체적인 날짜와 함께 제시하세요.

### 2. 현재-미래 일치도 분석 (25%)
- Q1(오늘의 계획)과 Q2(미래 비전)의 일치도를 분석하세요.
- gap_analysis: 현재 상태와 원하는 상태 사이의 가장 큰 격차를 찾고, 실행 가능한 액션을 제안하세요.
- biggest_gaps: 각 격차에 대해 current_state, desired_state, gap_description, actionable_steps를 구체적으로 작성하세요.

### 3. 하루 패턴 인사이트 (20%)
- Q1 기록("오늘 하루를 어떻게 보낼까?")을 분석하여 반복되는 패턴을 발견하세요.
- recurring_patterns: 한 달 동안 반복된 하루 패턴을 찾고, 각 패턴의 영향(positive/neutral/negative)을 평가하세요. 패턴이 나타난 날짜를 포함하세요.
- weekly_evolution: 주차별로 하루가 어떻게 달라졌는지 서사적으로 정리하세요.
- evaluation_themes: 기록에서 반복되는 강점과 개선점을 추출하세요.

### 4. 특성-비전 매칭 (15%)
- 기록 전체를 분석하여 사용자의 특성과 지향하는 모습을 추출하세요.
- trait_mapping: 현재 특성과 지향 특성을 매칭하고, 각각의 일치도 점수를 계산하세요 (0-1).
- trait_evolution: 한 달 동안 강해진 특성, 새로 나타난 특성, 사라진 특성을 추적하세요. 구체적인 날짜와 함께 제시하세요.
- focus_traits: 다음 달에 집중할 특성을 선별하고, 구체적인 월간 액션을 제안하세요.

### 5. 실행 가능한 다음 달 플랜 (10%)
- 위 4개 섹션의 분석 결과를 바탕으로 구체적이고 실행 가능한 다음 달 플랜을 제안하세요.
- focus_areas: 다음 달에 집중할 3가지 영역을 선정하고, 각 영역의 현재 상태와 원하는 상태를 명확히 제시하세요.
- maintain_patterns: 유지할 좋은 패턴과 그 이유, 유지 방법을 제안하세요.
- experiment_patterns: 시도해볼 새로운 패턴과 그 이유, 시작 방법을 제안하세요.

**최종 확인: 모든 섹션에서 ${dateRange.start_date}부터 ${dateRange.end_date}까지의 전체 기간을 분석했는지 확인하세요.**
모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;

  return prompt;
}
