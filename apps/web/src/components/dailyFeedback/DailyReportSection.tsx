import {
  BookOpen,
  Sparkles,
  Lock,
  Users,
  Briefcase,
  Globe,
  User,
  TrendingUp,
} from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
import { SectionProps } from "./types";

export function DailyReportSection({ view, isPro = false }: SectionProps) {
  const triggerIcons = {
    people: Users,
    work: Briefcase,
    environment: Globe,
    self: User,
  };

  const triggerLabels = {
    people: "사람",
    work: "업무",
    environment: "환경",
    self: "자기 요인",
  };

  const behavioralLabels = {
    avoidance: "회피 행동",
    routine_attempt: "루틴 시도",
    routine_failure: "루틴 실패",
    impulsive: "즉흥 충동",
    planned: "계획적 행동",
  };

  // 감정 트리거 비중 계산
  const calculateTriggerWeights = () => {
    if (!view.emotion_triggers) return null;

    const total =
      view.emotion_triggers.people.length +
      view.emotion_triggers.work.length +
      view.emotion_triggers.environment.length +
      view.emotion_triggers.self.length;

    if (total === 0) return null;

    return {
      people: (view.emotion_triggers.people.length / total) * 100,
      work: (view.emotion_triggers.work.length / total) * 100,
      environment: (view.emotion_triggers.environment.length / total) * 100,
      self: (view.emotion_triggers.self.length / total) * 100,
    };
  };

  const triggerWeights = calculateTriggerWeights();

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          오늘의 일상
        </h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="space-y-4">
          {view.daily_summary && (
            <div>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.5rem",
                }}
              >
                요약
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#333333",
                  lineHeight: "1.8",
                  textAlign: "left",
                }}
              >
                {view.daily_summary}
              </p>
            </div>
          )}
          {view.daily_events && view.daily_events.length > 0 && (
            <div>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                오늘 있었던 일
              </p>
              <ul className="space-y-2">
                {view.daily_events.map((event, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#A8BBA8" }}
                    />
                    <p
                      className="text-sm"
                      style={{
                        color: "#333333",
                        lineHeight: "1.6",
                      }}
                    >
                      {event}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {view.lesson && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
                maxWidth: "fit-content",
              }}
            >
              <p
                className="text-sm"
                style={{
                  color: "#4E4B46",
                  lineHeight: "1.7",
                  textAlign: "left",
                }}
              >
                {view.lesson}
              </p>
            </div>
          )}
          {view.keywords && view.keywords.length > 0 && (
            <div className="pt-2 -mx-6 px-6">
              <ScrollingKeywords
                keywords={view.keywords}
                duration={25}
                gap="0.5rem"
                badgeStyle={{
                  backgroundColor: "#EAEDE9",
                  color: "#55685E",
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "9999px",
                }}
              />
            </div>
          )}

          {/* 감정 트리거 (Pro 전용) */}
          {isPro && view.emotion_triggers && triggerWeights && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: "#A8BBA8" }} />
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6B7A6F",
                  }}
                >
                  감정 트리거 (Pro)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {Object.entries(triggerIcons).map(([key, Icon]) => {
                  const weight =
                    triggerWeights[key as keyof typeof triggerWeights];
                  const triggers =
                    view.emotion_triggers![
                      key as keyof typeof view.emotion_triggers
                    ];

                  return (
                    <Card
                      key={key}
                      className="p-3"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #E6E4DE",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          className="w-4 h-4"
                          style={{ color: "#A8BBA8" }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#333333" }}
                        >
                          {triggerLabels[key as keyof typeof triggerLabels]}
                        </span>
                        <span
                          className="text-xs ml-auto"
                          style={{ color: "#6B7A6F" }}
                        >
                          {weight.toFixed(0)}%
                        </span>
                      </div>
                      {triggers && triggers.length > 0 && (
                        <div className="space-y-1">
                          {triggers.map((trigger, idx) => (
                            <p
                              key={idx}
                              className="text-xs"
                              style={{ color: "#4E4B46" }}
                            >
                              • {trigger}
                            </p>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 감정 트리거 (Free 모드: Pro 업그레이드 유도) */}
          {!isPro && (
            <Card
              className="p-4"
              style={{
                backgroundColor: "#FAFAF8",
                border: "1px solid #E6E4DE",
              }}
            >
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5" style={{ color: "#6B7A6F" }} />
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{
                      color: "#4E4B46",
                    }}
                  >
                    왜 이렇게 느꼈는지 알고 싶으신가요?
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      lineHeight: "1.5",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Pro 멤버십에서는 오늘의 감정을 만든 사건·사람·상황을
                    카테고리별로 정리해 드립니다. "나는 왜 이렇게 느꼈을까?" 그
                    답을 패턴으로 발견해보세요.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 행동 단서 (Pro 전용) */}
          {isPro && view.behavioral_clues && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: "#A8BBA8" }} />
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6B7A6F",
                  }}
                >
                  행동 단서 (Pro)
                </p>
              </div>
              <div className="space-y-2">
                {Object.entries(behavioralLabels).map(([key, label]) => {
                  const clues =
                    view.behavioral_clues![
                      key as keyof typeof view.behavioral_clues
                    ];

                  if (!clues || clues.length === 0) return null;

                  return (
                    <div key={key} className="pl-2">
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: "#6B7A6F" }}
                      >
                        {label}
                      </p>
                      <ul className="space-y-1">
                        {clues.map((clue, idx) => (
                          <li
                            key={idx}
                            className="text-xs flex items-start gap-2"
                            style={{ color: "#4E4B46" }}
                          >
                            <span style={{ color: "#A8BBA8" }}>•</span>
                            <span>{clue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 행동 단서 (Free 모드: Pro 업그레이드 유도) */}
          {!isPro && (
            <Card
              className="p-4"
              style={{
                backgroundColor: "#FAFAF8",
                border: "1px solid #E6E4DE",
              }}
            >
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5" style={{ color: "#6B7A6F" }} />
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{
                      color: "#4E4B46",
                    }}
                  >
                    내 행동 패턴을 이해하고 싶으신가요?
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      lineHeight: "1.5",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Pro 멤버십에서는 오늘 기록 속에서 나타나는 행동 패턴을
                    분석해 드립니다. 회피, 루틴 시도, 계획적 행동 등 내가
                    반복하는 패턴을 발견하면, 더 나은 선택을 할 수 있어요.
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#6B7A6F",
                      lineHeight: "1.5",
                      fontStyle: "italic",
                    }}
                  >
                    같은 행동을 반복하면, 같은 결과가 반복돼요. 지금 기록을
                    성장으로 바꿔보세요.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>
      {/* AI 코멘트 (Pro 전용) */}
      {isPro && view.ai_comment && (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <div>
            <p
              className="text-xs"
              style={{
                color: "#6B7A6F",
                marginBottom: "0.5rem",
              }}
            >
              AI 코멘트
            </p>
            <p
              className="text-sm italic"
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
              }}
            >
              {view.ai_comment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
