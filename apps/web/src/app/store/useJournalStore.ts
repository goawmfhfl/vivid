import { create } from "zustand";
import type { Entry, PeriodSummary } from "@/types/Entry";

type JournalState = {
  entries: Entry[];
  summaries: PeriodSummary[];
  addEntry: (title: string, content: string) => void;
  removeEntry: (id: string) => void;
  generateSummary: (
    type: "weekly" | "monthly",
    weekNumber?: number,
    monthNumber?: number,
    year?: number
  ) => void;
  selectSummary: (summary: PeriodSummary) => void;
  clear: () => void;
};

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  summaries: [],
  addEntry: (title, content) =>
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: crypto.randomUUID(),
          content: `${title}: ${content}`,
          timestamp: new Date(),
        },
      ],
    })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  generateSummary: (type, weekNumber, monthNumber, year) => {
    // 샘플 요약 생성 로직
    const id =
      type === "weekly"
        ? `${year}-w${weekNumber?.toString().padStart(2, "0")}-${crypto
            .randomUUID()
            .slice(0, 8)}`
        : `${year}-m${monthNumber?.toString().padStart(2, "0")}-${crypto
            .randomUUID()
            .slice(0, 8)}`;

    const newSummary: PeriodSummary = {
      id,
      type,
      period:
        type === "weekly"
          ? `${year}년 ${weekNumber}주차`
          : `${year}년 ${monthNumber}월`,
      dateRange:
        type === "weekly"
          ? `${year}년 ${weekNumber}주차`
          : `${year}년 ${monthNumber}월`,
      weekNumber,
      monthNumber,
      year,
      totalEntries: Math.floor(Math.random() * 10) + 1,
      overview: "이 기간 동안 전반적으로 긍정적인 변화가 있었습니다.",
      keyInsights: [
        "샘플 인사이트 1: 이 기간 동안 긍정적인 변화가 있었습니다.",
        "샘플 인사이트 2: 새로운 습관 형성에 성공했습니다.",
      ],
      emotionalTrends: "안정적이고 긍정적인 감정 상태를 유지했습니다.",
      growthAreas: [
        "샘플 성장 영역 1: 더 나은 시간 관리가 필요합니다.",
        "샘플 성장 영역 2: 운동 루틴을 유지하세요.",
      ],
      highlights: [
        "샘플 하이라이트 1: 중요한 프로젝트를 완료했습니다.",
        "샘플 하이라이트 2: 새로운 기술을 배웠습니다.",
      ],
      nextSteps: "다음 주/월에는 더 체계적인 계획을 세워보겠습니다.",
      createdAt: new Date(),
    };

    set((state) => ({
      summaries: [...state.summaries, newSummary],
    }));
  },
  selectSummary: (summary) => {
    console.log("Selected summary:", summary);
    // 선택된 요약에 대한 추가 로직 (예: 상세 페이지로 이동)
  },
  clear: () => set({ entries: [], summaries: [] }),
}));
