import type { WeeklyReport } from "@/types/weekly-vivid";
import type { MonthlyReport } from "@/types/monthly-vivid";
import type {
  UserPersonaGrowthInsights,
  UserPersonaIdentity,
  UserPersonaPatterns,
} from "@/types/user-persona";

export const membershipPreviewCopy = {
  heroTitle: "VIVID 프로에게 주어지는 혜택",
  heroDescription:
    "",
  weeklyMonthlyTitle: "주간/월간 VIVID 종합 리포트",
  weeklyMonthlyDescription:
    "자주 떠오르는 키워드와 한 달간 쌓인 비전 변화를 통해, 내가 어디로 가고 있는지 한눈에 볼 수 있어요.",
  growthTitle: "한눈에 보는 성장 인사이트",
  growthDescription:
    "정체성·지향·명확도와 몰입·에너지·걸림돌의 균형을 함께 확인하며 나를 더 입체적으로 이해할 수 있어요.",
  balanceTitle: "삶의 균형",
  balanceDescription:
    "이번 주 시간을 어디에 쓰고 있는지, 반복되는 패턴과 놓치고 있는 영역까지 함께 살펴볼 수 있어요.",
  reviewsTitle: "유저들이 남긴 리뷰",
  reviewsDescription:
    "VIVID를 먼저 경험한 사용자들이 어떤 만족감을 느꼈는지, 실제 평점과 코멘트로 확인해보세요.",
} as const;

export const membershipWeeklyKeywordsPreview: WeeklyReport["weekly_keywords_analysis"] =
  {
    vision_keywords_trend: [
      {
        keyword: "자기계발",
        days: 5,
        context:
          "퇴근 후 영어 공부와 독서를 꾸준히 이어가며, 내 삶을 조금씩 더 단단하게 만들고 싶다는 생각이 반복해서 나타났어요.",
        related_keywords: ["영어 공부", "독서 루틴", "미래 준비"],
      },
      {
        keyword: "건강한 루틴",
        days: 4,
        context:
          "아침 스트레칭, 가벼운 산책, 규칙적인 수면이 하루 컨디션을 바꾼다는 걸 체감했어요.",
        related_keywords: ["수면", "산책", "스트레칭"],
      },
      {
        keyword: "재테크 습관",
        days: 3,
        context:
          "큰 목표보다도 소비를 이해하고 작은 저축 습관을 들이는 일이 먼저라는 생각이 생겼어요.",
        related_keywords: ["가계부", "소비 점검", "저축"],
      },
      {
        keyword: "감정 회복",
        days: 3,
        context:
          "하루 중 잠깐이라도 내 감정을 정리하는 시간이 있어야 다시 집중할 수 있다는 걸 자주 떠올렸어요.",
        related_keywords: ["저널링", "혼자만의 시간", "회복"],
      },
    ],
  };

export const membershipMonthlyVisionPreview: MonthlyReport["vision_evolution"] = {
  core_visions: [
    {
      vision: "건강한 루틴으로 컨디션의 바닥을 낮추지 않는 사람",
      consistency: 0.84,
      first_date: "03.01",
      last_date: "03.28",
      evolution_story:
        "처음엔 단순히 일찍 자고 싶다는 바람에 가까웠지만, 한 달이 지나며 수면·가벼운 운동·식사 리듬이 일의 집중력까지 연결된다는 인식으로 확장되었어요.",
    },
    {
      vision: "불안에 끌려가지 않고 내 선택에 확신을 갖는 사람",
      consistency: 0.77,
      first_date: "03.03",
      last_date: "03.27",
      evolution_story:
        "타인의 속도를 따라가는 대신, 나에게 맞는 페이스를 지키는 것이 더 중요하다는 감각이 여러 기록에서 반복적으로 드러났어요.",
    },
  ],
  priority_shifts: [],
};

export const membershipGrowthInsightsPreview: UserPersonaGrowthInsights = {
  self_clarity_index: 83,
  pattern_balance_score: 78,
  self_clarity_rationale:
    "기록 전반에서 '나는 어떤 삶을 원하나'에 대한 기준이 비교적 선명하게 드러나요. 특히 건강한 루틴과 감정 회복, 미래를 위한 준비가 반복적으로 연결됩니다.",
  pattern_balance_rationale:
    "몰입과 회복의 리듬을 만들려는 시도가 보이지만, 바쁜 일정이 겹치는 주에는 회복 시간이 먼저 줄어드는 패턴이 남아 있어요.",
};

export const membershipIdentityPreview: UserPersonaIdentity = {
  traits: ["감각적인 실행가", "스스로를 점검하는 사람", "꾸준함을 만들고 싶은 사람"],
  ideal_self: [
    "내 페이스를 지키면서도 성장하는 사람",
    "건강한 루틴이 삶의 기본값이 된 사람",
    "일과 취향을 둘 다 놓치지 않는 사람",
  ],
  driving_forces: ["자기효능감", "안정적인 일상", "취향 있는 삶"],
};

export const membershipPatternsPreview: UserPersonaPatterns = {
  flow_moments: [
    "퇴근 후 조용한 카페에서 오늘을 정리할 때",
    "할 일을 2~3개로 압축해 집중할 때",
    "산책 후 다시 책상 앞에 앉았을 때",
  ],
  energy_sources: ["수면이 확보된 아침", "좋아하는 음악", "관계에서 오는 안정감"],
  stumbling_blocks: ["예상보다 긴 업무", "쌓이는 피로를 미루는 습관", "비교에서 오는 조급함"],
};

export const membershipTodoBalancePreview: NonNullable<
  WeeklyReport["completed_todos_insights"]
> = {
  uses_todo_list: true,
  completed_by_category: [],
  time_investment_summary:
    "이번 주는 일의 완성도를 챙기면서도 자기계발과 회복 시간을 일정 수준 유지하려는 흔적이 보여요. 다만 주 후반으로 갈수록 건강과 휴식 시간이 조금씩 줄어드는 경향이 있습니다.",
  time_investment_breakdown: [
    { category: "업무", percentage: 42 },
    { category: "자기계발", percentage: 24 },
    { category: "건강", percentage: 18 },
    { category: "관계/취미", percentage: 16 },
  ],
  repetitive_patterns: [
    "중요한 일은 오전에 몰아서 처리할 때 가장 만족도가 높았어요.",
    "퇴근 후 30분만이라도 책상에 앉으면 자기계발 루틴이 이어졌어요.",
    "피곤한 날일수록 산책이나 샤워 같은 짧은 회복 행동이 다음 행동을 살렸어요.",
  ],
  new_areas: [
    "가계부를 다시 시작하며 소비 습관을 점검했어요.",
    "주말 오전을 온전히 나를 위한 시간으로 비워두기 시작했어요.",
  ],
  incomplete_patterns: [
    "운동은 하고 싶지만 늦은 퇴근이 이어지면 가장 먼저 밀렸어요.",
    "생각 정리는 자주 했지만, 구체적인 재무 계획으로 이어지지는 못했어요.",
  ],
};
