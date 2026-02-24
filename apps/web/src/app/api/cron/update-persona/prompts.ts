type VividPersonaRecord = {
  kst_date: string;
  type: string;
  content: string;
  created_at: string;
};

type TodoItem = {
  contents: string;
  is_checked: boolean;
  scheduled_at: string | null;
  created_at: string;
};

export function buildUserPersonaPrompt(params: {
  records: VividPersonaRecord[];
  todos: TodoItem[];
  startDate: string;
  endDate: string;
  existingPersona: Record<string, unknown> | null;
}): string {
  const { records, todos, startDate, endDate, existingPersona } = params;

  const header = `아래는 ${startDate}부터 ${endDate}까지 최근 7일간의 VIVID 기록과 투두 리스트입니다.
VIVID 기록은 다음 타입으로 구성됩니다:
- vivid: Q1 (오늘 하루를 어떻게 보낼까?)
- dream: Q2 (앞으로의 나는 어떤 모습일까?)
- review: Q3 (오늘의 나는 어떤 하루를 보냈을까?)`;

  const body = records
    .map((record, index) => {
      const createdAt = new Date(record.created_at);
      const kstTime = createdAt.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });
      const title = `${index + 1}. [${record.kst_date} ${kstTime}] (${record.type})`;
      return `${title}\n${record.content}`;
    })
    .join("\n\n");

  const todoSection = todos.length > 0
    ? `\n\n[최근 투두 리스트]\n${todos
        .map(
          (t) =>
            `- ${t.contents} (${t.is_checked ? "완료" : "미완료"}${
              t.scheduled_at ? `, 일정: ${t.scheduled_at}` : ""
            })`
        )
        .join("\n")}`
    : "\n\n[최근 투두 리스트]\n없음";

  const personaSection = existingPersona
    ? `\n\n[기존 User Persona]\n${JSON.stringify(existingPersona, null, 2)}`
    : "\n\n[기존 User Persona]\n없음";

  return `${header}\n\n${body}${todoSection}${personaSection}\n\n위 정보를 바탕으로 새로운 User Persona를 생성하세요.`;
}
