import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
} from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

export type DailyReportData = {
  // Header
  date: string; // "2025-11-03"
  dayOfWeek: string; // "월요일"
  integrity_score: number; // 0-10
  narrative_summary: string;
  emotion_curve: string[]; // ["불안", "몰입", "안도"]

  // Section 1: Daily Summary
  narrative: string;
  lesson: string;
  keywords: string[];
  daily_ai_comment: string;

  // Section 2: Visualization Review
  vision_summary: string;
  vision_self: string;
  vision_keywords: string[];
  reminder_sentence: string;
  vision_ai_feedback: string;

  // Section 3: Insight Analysis
  core_insight: string;
  learning_source: string;
  meta_question: string;
  insight_ai_comment: string;

  // Section 4: Feedback Review
  core_feedback: string;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string;

  // Section 5: Final Message
  ai_message: string;
  growth_point: string;
  adjustment_point: string;
  tomorrow_focus: string;
  integrity_reason: string;
};

type DailyFeedbackViewProps = {
  data?: DailyReportData;
  onBack: () => void;
};

// Dummy Data
export const dummyData: DailyReportData = {
  // Header
  date: "2025-01-21",
  dayOfWeek: "화요일",
  integrity_score: 7,
  narrative_summary:
    "오늘은 새로운 프로젝트를 시작하며 기대와 불안이 교차했던 하루였다. 점심 시간에 친구와의 대화를 통해 새로운 관점을 얻었고, 오후에는 집중력이 높아져서 생산적인 작업을 할 수 있었다.",
  emotion_curve: ["불안", "몰입", "안도"],

  // Section 1: Daily Summary
  narrative:
    "오늘은 2025년 첫 번째 주요 프로젝트의 기획 단계를 시작했다. 아침에는 다소 불안했지만, 팀원들과의 브레인스토밍 세션에서 아이디어가 폭발적으로 나왔다. 점심시간에는 오랜만에 만난 친구와 깊은 대화를 나누며 내 선택에 대한 확신을 얻었다. 오후에는 집중력을 발휘해서 계획서 초안을 완성했고, 저녁에는 가족과 함께 식사하며 하루를 마무리했다.",
  lesson:
    "불안은 시작의 자연스러운 감정이지만, 한 걸음씩 나아가면 자신감으로 변한다.",
  keywords: ["프로젝트 시작", "집중력", "대화", "기획", "팀워크"],
  daily_ai_comment:
    "오늘 하루는 변화의 시작점이었습니다. 불안감을 감추지 않고 직면한 용기와, 한 걸음씩 나아간 행동력이 인상적입니다. 특히 점심 대화에서 얻은 인사이트를 바로 오후 작업에 연결한 점이 훌륭했습니다.",

  // Section 2: Visualization Review
  vision_summary:
    "올해는 더 나은 버전의 나를 만들어가며, 새로운 도전을 두려워하지 않는 해가 되고 싶다.",
  vision_self:
    "오늘 프로젝트 기획을 시작하면서 내 비전과 실제 행동이 일치하는지 점검했다. 계획은 구체적이었지만, 실행 단계에서는 여전히 망설임이 있었다.",
  vision_keywords: ["성장", "도전", "자신감", "실행력", "균형"],
  reminder_sentence:
    "완벽을 기다리지 말고 시작하라. 작은 실수가 쌓여 큰 성과가 된다.",
  vision_ai_feedback:
    "비전과 현실 사이의 간극을 인식하고 있다는 점이 좋습니다. 작은 실천으로 간극을 좁혀나가세요.",

  // Section 3: Insight Analysis
  core_insight:
    "불안은 미래에 대한 불확실성에서 나오지만, 그것은 동시에 성장의 신호이기도 하다. 오늘의 불안을 직면하면서 내가 얼마나 성장했는지 느낄 수 있었다.",
  learning_source: "점심 대화에서 친구가 공유한 경험",
  meta_question: "내일은 어떤 작은 도전을 시작할 수 있을까?",
  insight_ai_comment:
    "불안을 성장의 신호로 해석하는 관점이 성숙한 인사이트입니다. 이 깨달음이 내일의 행동 변화로 이어질 것입니다.",

  // Section 4: Feedback Review
  core_feedback:
    "오늘은 계획을 세우고 실행의 첫 단계를 밟았다. 불안감을 느꼈지만 피하지 않고 작업을 시작한 점이 가장 잘한 부분이다. 다만 중간에 휴식 없이 오래 작업해서 집중력이 떨어진 순간이 있었으니, 내일은 시간 관리를 더 세밀하게 해야겠다.",
  positives: [
    "불안감을 직면하고 행동으로 옮긴 용기",
    "팀원들과의 협업에서 적극적으로 아이디어를 제시",
    "친구와의 대화를 통해 인사이트를 얻고 바로 적용",
    "프로젝트 계획서 초안을 시간 내에 완성",
  ],
  improvements: [
    "작업 중 휴식 시간을 명확히 구분하기",
    "완벽주의를 조금 덜 하기 - 초안은 완벽할 필요 없음",
    "불안할 때 혼자 고민하기보다 주변 사람들에게 조언 구하기",
  ],
  feedback_ai_comment:
    "실행력이 돋보이는 하루였습니다. 잘한 점들이 구체적이고 행동 지향적입니다. 개선점도 현실적이며 실천 가능합니다.",

  // Section 5: Final Message
  ai_message:
    "오늘 하루도 수고하셨습니다. 변화의 시작은 항상 불안함과 함께 하지만, 당신은 그 불안을 성장의 동력으로 바꿨습니다. 작은 시작이 모여 큰 변화가 되니, 내일도 한 걸음씩 나아가세요.",
  growth_point:
    "불안을 직면하고 행동으로 전환하는 능력이 이전보다 향상되었다. 또한 대화를 통해 인사이트를 얻고 즉시 적용하는 연결력도 발전했다.",
  adjustment_point:
    "작업 효율성을 높이기 위해 휴식 시간을 의식적으로 배치하고, 완벽주의를 조금 완화하여 더 빠르게 반복하며 개선하는 방식으로 전환해보세요.",
  tomorrow_focus:
    "프로젝트 계획서를 한 번 더 검토하고, 팀원들과 피드백을 나눈 후 실행 단계로 넘어가기",
  integrity_reason:
    "오늘 하루 계획한 대로 실행했고, 불안함에도 불구하고 프로젝트를 시작한 용기와 실행력이 점수를 올렸습니다.",
};

export function DailyFeedbackView({
  data = dummyData,
  onBack,
}: DailyFeedbackViewProps) {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
          style={{ color: "#6B7A6F" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        {/* Header Section - Today Overview */}
        <div className="mb-10">
          <div
            className="p-8 rounded-3xl mb-6"
            style={{
              background: "linear-gradient(135deg, #A8BBA8 0%, #8FA894 100%)",
              color: "white",
            }}
          >
            {/* Date & Score */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
                  {data.date}
                </h1>
                <p style={{ opacity: 0.9, fontSize: "1rem" }}>
                  {data.dayOfWeek}
                </p>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {data.integrity_score}
                  </span>
                </div>
                <p
                  className="inline-block whitespace-nowrap text-nowrap"
                  style={{ opacity: 0.8, fontSize: "0.75rem" }}
                >
                  하루 점수
                </p>
              </div>
            </div>
            {/* Narrative Summary - Hero Text */}
            <div
              className="py-5 px-6 rounded-2xl"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <p
                style={{ fontSize: "1.1rem", lineHeight: "1.7", opacity: 0.95 }}
              >
                {data.narrative_summary}
              </p>
            </div>
            {/* Emotion Curve */}
            <div className="mt-5">
              <p
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.8,
                  marginBottom: "0.75rem",
                }}
              >
                감정의 흐름
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {data.emotion_curve.map((emotion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        color: "white",
                        padding: "0.5rem 1rem",
                        fontSize: "0.9rem",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {emotion}
                    </Badge>
                    {index < data.emotion_curve.length - 1 && (
                      <ArrowRight
                        className="w-4 h-4 flex-shrink-0"
                        style={{ opacity: 0.6 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Daily Summary */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A8BBA8" }}
            >
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
              오늘의 전체 흐름
            </h2>
          </div>
          <Card
            className="p-6 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <div className="space-y-4">
              <div>
                <p
                  style={{
                    color: "#333333",
                    lineHeight: "1.8",
                    fontSize: "1rem",
                  }}
                >
                  {data.narrative}
                </p>
              </div>

              {data.lesson && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "#FAFAF8",
                    borderLeft: "3px solid #A8BBA8",
                  }}
                >
                  <p
                    style={{
                      color: "#4E4B46",
                      lineHeight: "1.7",
                      fontSize: "0.95rem",
                    }}
                  >
                    {data.lesson}
                  </p>
                </div>
              )}
              {/* Keywords */}
              {data.keywords && data.keywords.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {data.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        style={{
                          backgroundColor: "#E8EFE8",
                          color: "#6B7A6F",
                          padding: "0.4rem 0.85rem",
                          fontSize: "0.85rem",
                          border: "none",
                        }}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          {/* AI Comment - Quote Style */}
          {data.daily_ai_comment && (
            <div
              className="p-5 rounded-xl flex gap-3"
              style={{
                backgroundColor: "#F5F7F5",
                border: "1px solid #E0E5E0",
              }}
            >
              <Sparkles
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "#A8BBA8" }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7A6F",
                    marginBottom: "0.5rem",
                  }}
                >
                  AI 코멘트
                </p>
                <p
                  style={{
                    color: "#4E4B46",
                    lineHeight: "1.7",
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                  }}
                >
                  {data.daily_ai_comment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Visualization Review */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A3BFD9" }}
            >
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
              오늘의 비전과 방향
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                비전 요약
              </p>
              <p
                style={{
                  color: "#333333",
                  lineHeight: "1.7",
                  fontSize: "0.95rem",
                }}
              >
                {data.vision_summary}
              </p>
            </Card>
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                자기 평가
              </p>
              <p
                style={{
                  color: "#333333",
                  lineHeight: "1.7",
                  fontSize: "0.95rem",
                }}
              >
                {data.vision_self}
              </p>
            </Card>
          </div>
          {/* Vision Keywords - Horizontal Scroll */}
          {data.vision_keywords && data.vision_keywords.length > 0 && (
            <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4">
              <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                {data.vision_keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    style={{
                      backgroundColor: "#E5EEF5",
                      color: "#5A7A8F",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Reminder Sentence - Highlight Card */}
          {data.reminder_sentence && (
            <Card
              className="p-5 mb-4"
              style={{
                backgroundColor: "#A3BFD9",
                color: "white",
                border: "none",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.9,
                  marginBottom: "0.5rem",
                }}
              >
                오늘의 리마인더
              </p>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
                {data.reminder_sentence}
              </p>
            </Card>
          )}
          {/* AI Feedback - Small Text */}
          {data.vision_ai_feedback && (
            <div className="flex gap-2 items-start">
              <Sparkles
                className="w-4 h-4 flex-shrink-0 mt-1"
                style={{ color: "#A3BFD9", opacity: 0.7 }}
              />
              <p
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.6",
                  fontSize: "0.85rem",
                }}
              >
                {data.vision_ai_feedback}
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Insight Analysis */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#D08C60" }}
            >
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
              오늘의 깨달음
            </h2>
          </div>
          {/* Core Insight - Large Text Card */}
          <Card
            className="p-6 mb-4"
            style={{
              backgroundColor: "white",
              border: "2px solid #D08C60",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "#D08C60",
                marginBottom: "0.75rem",
              }}
            >
              핵심 인사이트
            </p>
            <p
              style={{
                color: "#333333",
                fontSize: "1.15rem",
                lineHeight: "1.7",
              }}
            >
              {data.core_insight}
            </p>
            {data.learning_source && (
              <p
                style={{
                  color: "#6B7A6F",
                  fontSize: "0.85rem",
                  marginTop: "0.75rem",
                }}
              >
                출처: {data.learning_source}
              </p>
            )}
          </Card>
          {/* Meta Question - Accent Box */}
          {data.meta_question && (
            <Card
              className="p-5 mb-4"
              style={{
                backgroundColor: "#FDF6F0",
                border: "1px solid #F0DCC8",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#D08C60",
                  marginBottom: "0.5rem",
                }}
              >
                내일의 질문
              </p>
              <p
                style={{
                  color: "#4E4B46",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              >
                {data.meta_question}
              </p>
            </Card>
          )}
          {/* AI Comment - Side Note Style */}
          {data.insight_ai_comment && (
            <div
              className="p-4 rounded-lg flex gap-3"
              style={{
                backgroundColor: "#F5F7F5",
                borderLeft: "3px solid #D08C60",
              }}
            >
              <Sparkles
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#D08C60" }}
              />
              <p
                style={{
                  color: "#4E4B46",
                  lineHeight: "1.7",
                  fontSize: "0.9rem",
                }}
              >
                {data.insight_ai_comment}
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Feedback Review */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A8BBA8" }}
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
              오늘의 자기 피드백
            </h2>
          </div>
          {/* Core Feedback */}
          {data.core_feedback && (
            <Card
              className="p-5 mb-4"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p
                style={{
                  color: "#333333",
                  lineHeight: "1.7",
                  fontSize: "1rem",
                }}
              >
                {data.core_feedback}
              </p>
            </Card>
          )}
          {/* Positives & Improvements - 2 Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Positives */}
            <Card
              className="p-5"
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                잘한 점
              </p>
              <ul className="space-y-2">
                {data.positives.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#A8BBA8" }}
                    />
                    <p
                      style={{
                        color: "#333333",
                        lineHeight: "1.6",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
            {/* Improvements */}
            <Card
              className="p-5"
              style={{
                backgroundColor: "#FDF6F0",
                border: "1px solid #F0DCC8",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                개선할 점
              </p>
              <ul className="space-y-2">
                {data.improvements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#D08C60" }}
                    />
                    <p
                      style={{
                        color: "#333333",
                        lineHeight: "1.6",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          {/* AI Comment - Conclusion Style */}
          {data.feedback_ai_comment && (
            <div
              className="p-5 rounded-xl flex gap-3"
              style={{
                backgroundColor: "#F5F7F5",
                border: "1px solid #E0E5E0",
              }}
            >
              <Sparkles
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "#6B7A6F" }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7A6F",
                    marginBottom: "0.5rem",
                  }}
                >
                  피드백 종합
                </p>
                <p
                  style={{
                    color: "#4E4B46",
                    lineHeight: "1.7",
                    fontSize: "0.9rem",
                  }}
                >
                  {data.feedback_ai_comment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Final Message */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6B7A6F" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
              오늘의 마무리
            </h2>
          </div>
          {/* Integrity Score Card */}
          <Card
            className="p-6 mb-4"
            style={{
              background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
              color: "white",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p
                  className="inline-block whitespace-nowrap text-nowrap"
                  style={{ fontSize: "0.85rem", opacity: 0.9 }}
                >
                  하루 점수
                </p>
                <p style={{ fontSize: "2.5rem", marginTop: "0.25rem" }}>
                  {data.integrity_score}
                </p>
              </div>
              <Progress
                value={data.integrity_score * 10}
                className="w-32"
                style={{ height: "8px" }}
              />
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.6", opacity: 0.95 }}>
              {data.integrity_reason}
            </p>
          </Card>
          {/* Main AI Message - Most Emphasized */}
          <Card
            className="p-6 mb-4"
            style={{
              backgroundColor: "white",
              border: "2px solid #A8BBA8",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Sparkles
                className="w-6 h-6 flex-shrink-0"
                style={{ color: "#A8BBA8" }}
              />
              <p
                style={{
                  color: "#333333",
                  fontSize: "1.15rem",
                  lineHeight: "1.8",
                }}
              >
                {data.ai_message}
              </p>
            </div>
          </Card>
          {/* Growth & Adjustment Points - 2 Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card
              className="p-5"
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                성장 포인트
              </p>
              <p
                style={{
                  color: "#333333",
                  lineHeight: "1.7",
                  fontSize: "0.95rem",
                }}
              >
                {data.growth_point}
              </p>
            </Card>
            <Card
              className="p-5"
              style={{
                backgroundColor: "#FDF6F0",
                border: "1px solid #F0DCC8",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                조정 포인트
              </p>
              <p
                style={{
                  color: "#333333",
                  lineHeight: "1.7",
                  fontSize: "0.95rem",
                }}
              >
                {data.adjustment_point}
              </p>
            </Card>
          </div>
          {/* Tomorrow Focus - CTA Style */}
          <Card
            className="p-6"
            style={{
              backgroundColor: "#A3BFD9",
              color: "white",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    opacity: 0.9,
                    marginBottom: "0.5rem",
                  }}
                >
                  내일의 포커스
                </p>
                <p style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
                  {data.tomorrow_focus}
                </p>
              </div>
              <ArrowRight
                className="w-6 h-6 flex-shrink-0 ml-4"
                style={{ opacity: 0.8 }}
              />
            </div>
          </Card>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onBack}
            className="rounded-full px-8 py-6"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            새로운 기록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
