import type { Record } from "./types";


export function buildReportPrompt(
  records: Record[],
  date: string,
  dayOfWeek: string,
  _isPro: boolean = false,
  userName?: string,
  personaContext?: string
): string {
  const targetRecords = records.filter(
    (r) =>
      r.type === "vivid" || r.type === "dream" || r.type === "review"
  );

  if (targetRecords.length === 0) {
    return "";
  }

  const personaBlock =
    personaContext && personaContext.trim()
      ? personaContext.trim() + "\n\n"
      : "";

  const honorificRule =
    userName && userName !== "회원"
      ? `응답 문장에서 사용자를 지칭할 때는 반드시 '${(userName)}'으로 호칭하고, '당신'이라는 단어를 사용하지 마세요. (예: 본명이 '최재영'이면 '재영님'으로 호칭)\n\n`
      : "응답 문장에서 '당신'이라는 단어를 사용하지 마세요. 사용자를 지칭할 때는 '회원님' 등으로 호칭하세요.\n\n";

  // Pro/Free 동일한 상세 프롬프트 사용 (Free는 Flash 모델로 비용 절감)
  const instruction = [
    "VIVID 리포트를 생성하세요.",
    "아래 JSON 스키마에 맞게 채워주세요.",
    "",
    "VIVID 기록은 세 가지 질문으로 구성되어 있습니다:",
    "- Q1: 오늘 하루를 어떻게 보낼까? (현재 모습)",
    "- Q2: 앞으로의 나는 어떤 모습일까? (미래 비전)",
    "- Q3: 오늘의 나는 어떤 하루를 보냈을까? (회고/실행)",
    "",
    "### 📝 오늘의 VIVID (현재 모습) - Q1 분석",
    "1) current_summary:",
    "- Q1에 대한 답변을 분석하여 오늘 기록한 VIVID 내용의 요약을 작성합니다.",
    "- 하루의 핵심 내용을 간결하게 정리하되, 구체적인 인사이트와 맥락을 포함하여 최대 400자 이내로 작성하세요.",
    "",
    "2) current_evaluation:",
    "- Q1에 대한 답변을 바탕으로 오늘의 VIVID 기록에 대한 AI 평가를 작성합니다.",
    "- 현재 상태에 대한 객관적 분석을 담백하고 따뜻한 톤으로 작성하되, 최대 250자 이내로 작성하세요.",
    "",
    "3) current_keywords:",
    "- Q1 답변에서 자주 등장한 키워드를 추출합니다.",
    "- 현재 관심사와 상태를 나타내는 핵심 단어들로 5~8개 정도 뽑아주세요.",
    "",
    "### 🎯 앞으로의 나의 모습 (미래 비전) - Q2 분석",
    "4) future_summary:",
    "- Q2에 대한 답변을 분석하여 기록에서 드러난 '앞으로 되고 싶은 모습' 요약을 작성합니다.",
    "- 미래 비전의 핵심 내용을 간결하게 정리하되, 구체적인 인사이트와 맥락을 포함하여 최대 400자 이내로 작성하세요.",
    "",
    "5) future_evaluation:",
    "- Q2에 대한 답변을 바탕으로 그 비전에 대한 AI 평가를 작성합니다.",
    "- 비전의 명확성과 실현 가능성을 분석하되, 최대 250자 이내로 작성하세요.",
    "",
    "6) future_keywords:",
    "- Q2 답변에서 자주 등장한 키워드를 추출합니다.",
    "- 지향하는 가치와 목표를 나타내는 핵심 단어들로 5~8개 정도 뽑아주세요.",
    "",
    "### 🔎 회고 인사이트 - Q3 분석",
    "7) retrospective_summary:",
    "- Q3가 있을 때만 회고 요약을 작성합니다. 없으면 반드시 null로 반환합니다.",
    "- 오늘의 실행/경험을 간결하게 정리하되, 구체적인 맥락을 포함합니다.",
    "",
    "8) retrospective_evaluation:",
    "- Q3가 있을 때만 회고 평가를 작성합니다. 없으면 반드시 null로 반환합니다.",
    "- 오늘의 회고에 어울리는 피드백을 담백하고 따뜻한 톤으로 작성합니다.",
    "",
    "### 📊 일치도 분석",
    "9) alignment_score:",
    "- Q1과 Q2의 내용이 얼마나 유사한지 단순 비교해 0-100점으로 산정합니다",
    "- 기준: 핵심 키워드/주제의 겹침 정도만 반영하세요",
    "- 높은 점수(80점 이상): 유사한 키워드·주제가 많이 겹침",
    "- 중간 점수(50-79점): 일부만 겹침",
    "- 낮은 점수(50점 미만): 거의 겹치지 않음",
    "- 과도한 해석 없이 유사성만 판단하세요",
    "- 결과는 가능한 한 빠르게 산출하세요",
    "",
    "10) alignment_analysis_points:",
    "- Q1과 Q2 사이에서 핵심적으로 겹치는 키워드나 주제를 분석합니다.",
    "- 점수 산정의 핵심 근거를 1~3개의 짧은 문장이나 키워드로 리스트업합니다.",
    '- 예시: ["\'성장\'이라는 공통 키워드", "아침 운동에 대한 의지가 일치함", "새로운 도전에 대한 긍정적 태도"]',
    "- 겹치는 주제가 적으면 \"공통 주제가 거의 없음\"과 같이 명시하세요.",
    "",
    "### ⚡ 실행력 점수 (Q1 <-> Q3)",
    "11) execution_score:",
    "- Q3가 있을 경우: Q1(계획)과 Q3(실행)의 일치도를 0-100점으로 산정합니다.",
    "- Q3가 없으면 반드시 null로 반환합니다.",
    "",
    "12) execution_analysis_points:",
    "- Q3가 있을 경우에만 핵심 근거 1~3개를 작성합니다. 없으면 null.",
    "",
    "### 🔍 사용자 특성 분석",
    "13) user_characteristics:",
    "- 기록 패턴과 내용을 분석해 도출한 사용자 특성을 최대 5가지 작성합니다.",
    "- '너는 이런 사람이다'라고 낙인찍지 말고, 가능성과 방향성을 보여주는 문장으로 작성하세요.",
    '- 예: "자기 성찰을 중시하는", "미래 지향적인", "감정 표현이 풍부한" 등',
    "",
    "14) aspired_traits:",
    "- 오늘의 VIVID 기록(Q1, Q2 모두)에서 드러난 지향 모습을 최대 5가지 작성합니다.",
    "- 사용자가 추구하는 가치와 방향성을 나타내는 특성으로 작성하세요.",
    '- 예: "균형 잡힌 삶을 추구하는", "창의적인 문제 해결자", "타인과의 깊은 연결을 원하는" 등',
    "",
    "톤은 담백하고 과하지 않게, 사용자를 조용히 응원하는 호스트처럼 작성하세요.",
    "",
    honorificRule.trim(),
  ].join("\n");

  let prompt =
    personaBlock +
    `아래는 ${date} (${dayOfWeek}) 하루의 VIVID 기록입니다.\n${instruction}\n\n`;

  targetRecords.forEach((record, idx) => {
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
