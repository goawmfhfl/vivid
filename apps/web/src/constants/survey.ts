/**
 * 설문 질문 구조
 * 5개 섹션: 1~4는 점수형(0~5), 5는 자유의견
 */

export interface SurveyQuestion {
  id: string;
  text: string;
}

export interface SurveySection {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "1",
    title: "나를 이해해주는 경험",
    questions: [
      {
        id: "1-1",
        text: "VIVID를 사용하며 내가 어떤 상황에서 에너지를 얻고, 또 어떤 상황에서 에너지를 잃는지 알게 되었나요?",
      },
      {
        id: "1-2",
        text: "나의 기록들이 공통적으로 가리키고 있는 '나만의 반복적인 행동 습관'이나 '사고의 흐름'을 알게되었나요?",
      },
      {
        id: "1-3",
        text: "과거의 기록을 다시 읽지 않아도, VIVID 리포트 덕분에 나의 성장 포인트를 파악하는 시간이 단축되었나요?",
      },
      {
        id: "1-4",
        text: "막연하게 '열심히 살았다'는 느낌 대신, 기록을 통해 어떻게 발전했는지 증거를 찾으셨나요?",
      },
    ],
  },
  {
    id: "2",
    title: "기록을 성장으로 정리",
    questions: [
      {
        id: "2-1",
        text: "과거의 기록과 비교했을 때, 내가 조금씩 나아지고 있다는 확신(성장 체감)을 얻으셨나요?",
      },
      {
        id: "2-2",
        text: "리포트에서 제공하는 인사이트가 요약을 넘어 나에게 '새로운 시각'을 제시하나요?",
      },
      {
        id: "2-3",
        text: "VIVID가 정리해 준 과거의 데이터 덕분에, 새로운 문제를 마주했을 때 더 빠르고 현명하게 판단할 수 있게 되었나요?",
      },
      {
        id: "2-4",
        text: "기록하는 데 들인 시간 대비, VIVID가 뽑아낸 분석 결과가 그 이상의 가치(성찰의 깊이, 시간 절약 등)를 제공한다고 느끼시나요?",
      },
    ],
  },
  {
    id: "3",
    title: "비전 중심의 자기 설계",
    questions: [
      {
        id: "3-1",
        text: "리포트의 제안을 보고 실제로 오늘 하루의 행동을 바꾸거나 시도해 본 적이 있나요?",
      },
      {
        id: "3-2",
        text: "내가 되고 싶은 '새로운 나의 모습(페르소나)'을 구체적으로 그려나가는 데 도움이 되었나요?",
      },
      {
        id: "3-3",
        text: "나의 비전과 상관없는 불필요한 일에 에너지를 쓰고 있지는 않은지, 리포트를 통해 냉정하게 점검하게 되었나요?",
      },
    ],
  },
  {
    id: "4",
    title: "앱 사용 경험",
    questions: [
      {
        id: "4-1",
        text: "VIVID를 처음 켰을 때, 어디에 무엇을 기록해야 할지 한눈에 알아보기 쉬웠나요?",
      },
      {
        id: "4-2",
        text: "생각이 났을 때 바로 기록할 수 있을 만큼 앱을 켜고 글을 쓰는 과정이 매끄러웠나요?",
      },
      {
        id: "4-3",
        text: "AI가 보내준 리포트를 읽을 때, 글자 크기나 화면 구성이 눈에 잘 들어오고 읽기 편했나요?",
      },
      {
        id: "4-4",
        text: "앱을 사용하는 동안 화면이 멈추거나, AI 리포트를 기다리는 시간이 지루하다고 느껴지지는 않았나요?",
      },
    ],
  },
  {
    id: "5",
    title: "자유의견",
    questions: [
      {
        id: "5-1",
        text: "아무 의견이라도 괜찮으니 작성해주시면 적극 참고하겠습니다 :)",
      },
    ],
  },
];

export const SCORE_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
export type SurveyScore = (typeof SCORE_OPTIONS)[number];

/** 점수형 질문 ID 목록 (섹션 1~4) */
export const SURVEY_SCORE_QUESTION_IDS = [
  "1-1", "1-2", "1-3", "1-4",
  "2-1", "2-2", "2-3", "2-4",
  "3-1", "3-2", "3-3",
  "4-1", "4-2", "4-3", "4-4",
] as const;

export type SurveyScoreQuestionId = (typeof SURVEY_SCORE_QUESTION_IDS)[number];

/** 질문 ID로 질문 텍스트 맵 */
export function getQuestionTextById(id: string): string {
  for (const section of SURVEY_SECTIONS) {
    const q = section.questions.find((q) => q.id === id);
    if (q) return q.text;
  }
  return id;
}
