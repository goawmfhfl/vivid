"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Entry, DailyFeedback, PeriodSummary } from "@/types/Entry";

interface JournalContextType {
  entries: Entry[];
  dailyFeedbackMap: Map<string, DailyFeedback>;
  currentDailyFeedback: DailyFeedback | null;
  selectedDate: Date | null;
  periodSummary: PeriodSummary | null;
  addEntry: (content: string) => void;
  editEntry: (id: string, content: string) => void;
  deleteEntry: (id: string) => void;
  generateFeedback: (forDate?: Date) => void;
  generatePeriodSummary: (
    type: "weekly" | "monthly",
    customStartDate?: Date,
    customEndDate?: Date
  ) => void;
  viewDayDetail: (date: Date) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function JournalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyFeedbackMap, setDailyFeedbackMap] = useState<
    Map<string, DailyFeedback>
  >(new Map());
  const [currentDailyFeedback, setCurrentDailyFeedback] =
    useState<DailyFeedback | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(
    null
  );

  const addEntry = (content: string) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const editEntry = (id: string, content: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, content } : entry))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const generateFeedback = (forDate?: Date) => {
    const targetDate = forDate || new Date();
    const dateKey = targetDate.toISOString().split("T")[0];
    const mockFeedback: DailyFeedback = {
      date: targetDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      summary:
        "오늘은 감정적으로 안정적인 하루를 보내셨네요. 업무에 대한 명확한 인사이트를 기록하며 자기 성찰의 시간을 가졌습니다.",
      strengths: [
        "구체적이고 근거 있는 판단을 내렸어요",
        "감정을 솔직하게 기록하고 인지했어요",
        "작은 성취에도 감사함을 표현했어요",
      ],
      improvements: [
        "휴식 시간을 더 확보해보세요",
        "타인과의 소통 빈도를 늘려보면 좋겠어요",
      ],
      recommendation:
        "내일은 오전 중 짧은 산책을 추가하고, 점심 후 10분간 명상 시간을 가져보세요. 감정 에너지를 재충전할 수 있을 거예요.",
    };
    setDailyFeedbackMap((prev) => new Map(prev.set(dateKey, mockFeedback)));
    setCurrentDailyFeedback(mockFeedback);
    router.push("/feedback");
  };

  const generatePeriodSummary = (
    type: "weekly" | "monthly",
    customStartDate?: Date,
    customEndDate?: Date
  ) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;
    let dateRangeLabel: string;

    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
      periodLabel = "커스텀 기간";
      dateRangeLabel = `${startDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })}`;
    } else if (type === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = now;
      periodLabel = "이번 주";
      dateRangeLabel = `${startDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })}`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      periodLabel = now.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      });
      dateRangeLabel = `${startDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })}`;
    }

    const periodEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const mockSummary: PeriodSummary = {
      id: `summary-${type}-${Date.now()}`,
      createdAt: new Date(),
      period: periodLabel,
      type,
      dateRange: dateRangeLabel,
      totalEntries: periodEntries.length,
      overview:
        type === "weekly"
          ? "이번 주는 자기 성찰과 업무 효율성 사이에서 균형을 찾으려는 노력이 돋보였습니다. 감정적으로는 안정적이었으나, 가끔 과부하를 느끼는 순간들이 있었습니다."
          : "이번 달은 성장과 도전의 시간이었습니다. 새로운 시도를 두려워하지 않았고, 실패에서도 배움을 얻으려는 자세가 인상적이었습니다. 전반적으로 자기 인식 수준이 높아진 한 달이었습니다.",
      keyInsights:
        type === "weekly"
          ? [
              "아침 루틴이 하루 전체의 생산성에 큰 영향을 미친다는 것을 발견했어요",
              "타인의 피드백을 수용하는 능력이 향상되었어요",
              "감정 기복이 있을 때 글쓰기가 효과적인 대처법임을 깨달았어요",
            ]
          : [
              "장기적 목표를 세우고 작은 단계로 나누어 실행하는 능력이 생겼어요",
              "자기 돌봄의 중요성을 인지하고 실천하기 시작했어요",
              "완벽주의 성향을 조금씩 내려놓고 과정을 즐기게 되었어요",
              "의미 있는 관계에 더 많은 에너지를 투자하게 되었어요",
            ],
      emotionalTrends:
        type === "weekly"
          ? "주 초반에는 에너지가 높았으나, 주 중반 약간의 피로감을 느꼈습니다. 주말로 갈수록 회복되는 패턴을 보였어요."
          : "월 초에는 새로운 시작에 대한 설렘이 컸고, 중반에는 현실적인 어려움과 마주하며 감정 기복이 있었습니다. 월말로 갈수록 안정감을 되찾고 성취감을 느꼈어요.",
      growthAreas:
        type === "weekly"
          ? [
              "스트레스 관리: 업무 과부하 시 조기에 감지하고 대응하기",
              '경계 설정: 타인의 요청에 적절히 "아니오"라고 말하기',
            ]
          : [
              "일관성: 좋은 습관을 꾸준히 유지하는 능력 기르기",
              "자기 연민: 실수나 실패 후 자신을 너무 가혹하게 대하지 않기",
              "깊은 집중: 산만함을 줄이고 몰입하는 시간 늘리기",
            ],
      highlights:
        type === "weekly"
          ? [
              "어려운 대화를 피하지 않고 솔직하게 나눴어요",
              "새로운 기술을 배우는 데 시간을 투자했어요",
              "운동 루틴을 3일 연속 지켰어요",
            ]
          : [
              "중요한 프로젝트를 성공적으로 마무리했어요",
              "오랜만에 가족과 깊은 대화를 나눴어요",
              "건강 검진을 받고 자기 관리를 시작했어요",
              "새로운 취미를 발견하고 즐겼어요",
            ],
      nextSteps:
        type === "weekly"
          ? '다음 주에는 하루 10분 명상 루틴을 추가하고, 업무 시작 전 "오늘의 우선순위 3가지"를 정하는 습관을 만들어보세요. 또한 주 중 하루는 디지털 디톡스 시간을 가져보세요.'
          : "다음 달에는 월초에 구체적인 목표를 3개 설정하고, 매주 진행 상황을 점검해보세요. 또한 월 2회 자연 속에서 산책하는 시간을 계획에 포함시키고, 감사 일기를 주 3회 이상 작성해보세요.",
    };

    setPeriodSummary(mockSummary);
    router.push("/summary");
  };

  const viewDayDetail = (date: Date) => {
    setSelectedDate(date);
    router.push("/daydetail");
  };

  const value: JournalContextType = {
    entries,
    dailyFeedbackMap,
    currentDailyFeedback,
    selectedDate,
    periodSummary,
    addEntry,
    editEntry,
    deleteEntry,
    generateFeedback,
    generatePeriodSummary,
    viewDayDetail,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <JournalContext.Provider value={value}>
        {children}
      </JournalContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
