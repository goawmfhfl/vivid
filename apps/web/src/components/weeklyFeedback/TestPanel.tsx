"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Code,
  GripVertical,
} from "lucide-react";
import { COLORS } from "@/lib/design-system";
import type { WeeklyReportData } from "./report/types";

interface TestPanelProps {
  view: WeeklyReportData;
  isPro: boolean;
  onTogglePro: (isPro: boolean) => void;
}

/**
 * 개발 환경에서만 사용하는 테스트 패널
 * 섹션별 데이터 상태와 Pro/Free 모드 전환을 제공
 */
export function TestPanel({ view, isPro, onTogglePro }: TestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showFullData, setShowFullData] = useState(false);

  // 드래그 관련 state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // 개발 환경 체크 (프로덕션에서는 숨김)
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) return null;

  // 섹션별 상세 정보 정의 (새로운 구조 반영)
  const sectionDefinitions = [
    {
      name: "Header",
      component: "ReportHeader",
      description: "주간 범위, 정합도 점수, 주간 개요",
      fields: [
        { name: "week_range", path: "view.week_range", isPro: false },
        { name: "integrity_score", path: "view.integrity_score", isPro: false },
        { name: "title", path: "view.weekly_overview.title", isPro: false },
        {
          name: "narrative",
          path: "view.weekly_overview.narrative",
          isPro: false,
        },
        {
          name: "top_keywords",
          path: "view.weekly_overview.top_keywords",
          isPro: false,
        },
        {
          name: "ai_overall_comment",
          path: "view.weekly_overview.ai_overall_comment",
          isPro: false,
        },
      ],
      condition: "항상 표시",
    },
    {
      name: "Daily Life",
      component: "DailyLifeSection",
      description: "이번 주의 일상 리포트",
      fields: [
        {
          name: "summary",
          path: "view.daily_life_report.summary",
          isPro: false,
        },
        {
          name: "daily_summaries_trend",
          path: "view.daily_life_report.daily_summaries_trend",
          isPro: true,
        },
        {
          name: "events_pattern",
          path: "view.daily_life_report.events_pattern",
          isPro: true,
        },
        {
          name: "emotion_triggers_analysis",
          path: "view.daily_life_report.emotion_triggers_analysis",
          isPro: true,
        },
        {
          name: "behavioral_patterns",
          path: "view.daily_life_report.behavioral_patterns",
          isPro: true,
        },
        {
          name: "keywords_analysis",
          path: "view.daily_life_report.keywords_analysis",
          isPro: true,
        },
      ],
      condition: "daily_life_report.summary !== ''",
    },
    {
      name: "Emotion",
      component: "EmotionSection",
      description: "주간 감정 개요, 감정 패턴, 트리거 분석",
      fields: [
        {
          name: "ai_mood_valence",
          path: "view.emotion_report?.ai_mood_valence",
          isPro: false,
        },
        {
          name: "ai_mood_arousal",
          path: "view.emotion_report?.ai_mood_arousal",
          isPro: false,
        },
        {
          name: "dominant_emotion",
          path: "view.emotion_report?.dominant_emotion",
          isPro: false,
        },
        {
          name: "valence_explanation",
          path: "view.emotion_report?.valence_explanation",
          isPro: false,
        },
        {
          name: "arousal_explanation",
          path: "view.emotion_report?.arousal_explanation",
          isPro: false,
        },
        {
          name: "daily_emotions",
          path: "view.emotion_report?.daily_emotions",
          isPro: false,
        },
      ],
      condition: "emotion_report !== null",
    },
    {
      name: "Vision",
      component: "VisionSection",
      description: "이번 주의 비전 리포트",
      fields: [
        {
          name: "vision_summary",
          path: "view.vision_report.vision_summary",
          isPro: false,
        },
        {
          name: "vision_consistency",
          path: "view.vision_report.vision_consistency",
          isPro: true,
        },
        {
          name: "goals_pattern",
          path: "view.vision_report.goals_pattern",
          isPro: true,
        },
        {
          name: "next_week_vision_focus",
          path: "view.vision_report.next_week_vision_focus",
          isPro: true,
        },
      ],
      condition: "vision_report.vision_summary.trim() !== ''",
    },
    {
      name: "Insight",
      component: "InsightSection",
      description: "이번 주의 인사이트 리포트",
      fields: [
        {
          name: "core_insights",
          path: "view.insight_report.core_insights",
          isPro: false,
        },
        {
          name: "meta_questions_highlight",
          path: "view.insight_report.meta_questions_highlight",
          isPro: false,
        },
        {
          name: "insight_patterns",
          path: "view.insight_report.insight_patterns",
          isPro: true,
        },
        {
          name: "growth_insights",
          path: "view.insight_report.growth_insights",
          isPro: true,
        },
      ],
      condition: "insight_report.core_insights.length > 0",
    },
    {
      name: "Execution",
      component: "ExecutionSection",
      description: "이번 주의 피드백 리포트",
      fields: [
        {
          name: "positives_top3",
          path: "view.execution_report.positives_top3",
          isPro: false,
        },
        {
          name: "improvements_top3",
          path: "view.execution_report.improvements_top3",
          isPro: false,
        },
        {
          name: "ai_feedback_summary",
          path: "view.execution_report.ai_feedback_summary",
          isPro: false,
        },
        {
          name: "feedback_patterns",
          path: "view.execution_report.feedback_patterns",
          isPro: true,
        },
        {
          name: "growth_insights",
          path: "view.execution_report.growth_insights",
          isPro: true,
        },
      ],
      condition:
        "execution_report.positives_top3.length > 0 || execution_report.improvements_top3.length > 0",
    },
    {
      name: "Closing",
      component: "ClosingSection",
      description: "이번 주의 마무리 리포트",
      fields: [
        {
          name: "weekly_one_liner",
          path: "view.closing_report.call_to_action?.weekly_one_liner",
          isPro: false,
        },
        {
          name: "next_week_objective",
          path: "view.closing_report.call_to_action?.next_week_objective",
          isPro: false,
        },
        {
          name: "actions",
          path: "view.closing_report.call_to_action?.actions",
          isPro: false,
        },
        {
          name: "this_week_identity",
          path: "view.closing_report.this_week_identity",
          isPro: true,
        },
        {
          name: "growth_story",
          path: "view.closing_report.growth_story",
          isPro: true,
        },
      ],
      condition:
        "closing_report.call_to_action?.weekly_one_liner.trim() !== ''",
    },
  ];

  // 필드 값 가져오기 헬퍼
  const getFieldValue = (path: string) => {
    const parts = path.split(".");
    let value: any = view;
    for (const part of parts.slice(1)) {
      // 옵셔널 체이닝 처리
      if (part.includes("?.")) {
        const cleanPart = part.replace("?.", "");
        value = value?.[cleanPart];
      } else {
        value = value?.[part];
      }
    }
    return value;
  };

  // 섹션별 데이터 검증 (새로운 구조 반영)
  const sections = sectionDefinitions.map((def) => {
    const hasData = (() => {
      switch (def.name) {
        case "Header":
          return true;
        case "Daily Life":
          return !!(
            view.daily_life_report?.summary &&
            view.daily_life_report.summary.trim()
          );
        case "Emotion":
          return view.emotion_report !== null;
        case "Vision":
          return !!(
            view.vision_report?.vision_summary &&
            view.vision_report.vision_summary.trim()
          );
        case "Insight":
          return (
            view.insight_report?.core_insights &&
            view.insight_report.core_insights.length > 0
          );
        case "Execution":
          return (
            (view.execution_report?.positives_top3 &&
              view.execution_report.positives_top3.length > 0) ||
            (view.execution_report?.improvements_top3 &&
              view.execution_report.improvements_top3.length > 0)
          );
        case "Closing":
          return !!(
            view.closing_report?.call_to_action?.weekly_one_liner &&
            view.closing_report.call_to_action.weekly_one_liner.trim()
          );
        default:
          return false;
      }
    })();

    const proFields = def.fields.filter((f) => f.isPro);
    const allFields = def.fields.map((field) => {
      const value = getFieldValue(field.path);

      return {
        ...field,
        value,
        hasValue: (() => {
          if (value === null || value === undefined) return false;
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === "string") return value.trim() !== "";
          if (typeof value === "object") return Object.keys(value).length > 0;
          return true;
        })(),
      };
    });

    return {
      ...def,
      hasData,
      proFields,
      allFields,
    };
  });

  const selectedSectionData = sections.find((s) => s.name === selectedSection);

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      setIsDragging(true);
      const rect = panelRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && panelRef.current) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const panelWidth = panelRef.current.offsetWidth;
        const panelHeight = panelRef.current.offsetHeight;
        const maxX = window.innerWidth - panelWidth;
        const maxY = window.innerHeight - panelHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={panelRef}
      className="fixed z-50"
      style={{
        top: position.y || 80,
        right: position.x === 0 ? 16 : "auto",
        left: position.x > 0 ? position.x : "auto",
        maxWidth: selectedSection ? "600px" : "400px",
        width: "calc(100vw - 2rem)",
        maxHeight: "calc(100vh - 8rem)",
        color: COLORS.text.primary,
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      <Card
        style={{
          backgroundColor: COLORS.background.card,
          border: `2px solid ${
            isPro ? COLORS.brand.primary : COLORS.border.light
          }`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div className="p-4">
          {/* 헤더 */}
          <div
            className="flex items-center justify-between mb-3"
            onMouseDown={handleMouseDown}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <div className="flex items-center gap-2">
              <GripVertical
                className="w-4 h-4"
                style={{
                  color: COLORS.text.muted,
                  opacity: 0.6,
                }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isPro
                    ? COLORS.brand.primary
                    : COLORS.text.muted,
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: COLORS.text.primary,
                }}
              >
                테스트 패널 (Dev Only) - 주간
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullData(!showFullData)}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: showFullData
                    ? COLORS.brand.primary
                    : COLORS.text.primary,
                }}
                title="전체 데이터 구조 보기"
              >
                <Code className="w-3 h-3" style={{ color: "inherit" }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataPreview(!showDataPreview)}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: showDataPreview
                    ? COLORS.brand.primary
                    : COLORS.text.primary,
                }}
                title={
                  showDataPreview
                    ? "데이터 미리보기 숨기기"
                    : "데이터 미리보기 보기"
                }
              >
                {showDataPreview ? (
                  <EyeOff className="w-3 h-3" style={{ color: "inherit" }} />
                ) : (
                  <Eye className="w-3 h-3" style={{ color: "inherit" }} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  setSelectedSection(null);
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: COLORS.text.primary,
                }}
              >
                {isExpanded ? "접기" : "펼치기"}
              </Button>
            </div>
          </div>

          {/* Pro/Free 토글 */}
          <div
            className="mb-3 p-2 rounded"
            style={{ backgroundColor: COLORS.background.hover }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  fontWeight: "500",
                }}
              >
                멤버십 모드
              </span>
              <Button
                size="sm"
                onClick={() => onTogglePro(!isPro)}
                style={{
                  backgroundColor: isPro
                    ? COLORS.brand.primary
                    : COLORS.border.light,
                  color: isPro ? "white" : COLORS.text.primary,
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                }}
              >
                {isPro ? "Pro" : "Free"}
              </Button>
            </div>
          </div>

          {/* 전체 데이터 구조 보기 */}
          {showFullData && (
            <div
              className="mb-3 p-3 rounded text-xs overflow-auto"
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${COLORS.border.light}`,
                maxHeight: "200px",
                fontFamily: "monospace",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#000000",
                }}
              >
                {JSON.stringify(view, null, 2)}
              </pre>
            </div>
          )}

          {/* 섹션 상세 정보 */}
          {selectedSectionData && (
            <div
              className="mb-3 p-3 rounded"
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${COLORS.border.light}`,
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: COLORS.text.primary,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {selectedSectionData.name} 섹션
                  </h4>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: COLORS.text.tertiary,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {selectedSectionData.description}
                  </p>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: COLORS.text.muted,
                      fontFamily: "monospace",
                    }}
                  >
                    조건: {selectedSectionData.condition}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSection(null)}
                  style={{ padding: "0.25rem 0.5rem", color: "#000000" }}
                >
                  ✕
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {selectedSectionData.allFields.map((field) => {
                  const value = field.value;
                  const displayValue = (() => {
                    if (value === null) return "null";
                    if (value === undefined) return "undefined";
                    if (Array.isArray(value))
                      return `[${value.length}개] ${JSON.stringify(
                        value.slice(0, 2)
                      )}${value.length > 2 ? "..." : ""}`;
                    if (typeof value === "string") {
                      return value.length > 100
                        ? value.substring(0, 100) + "..."
                        : value;
                    }
                    if (typeof value === "object") {
                      return JSON.stringify(value).substring(0, 100) + "...";
                    }
                    return String(value);
                  })();

                  return (
                    <div
                      key={field.name}
                      className="p-2 rounded text-xs"
                      style={{
                        backgroundColor: field.hasValue
                          ? COLORS.background.hover
                          : COLORS.background.base,
                        border: `1px solid ${
                          field.hasValue
                            ? COLORS.border.light
                            : COLORS.border.input
                        }`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {field.hasValue ? (
                            <CheckCircle2
                              className="w-3 h-3"
                              style={{ color: COLORS.status.success }}
                            />
                          ) : (
                            <XCircle
                              className="w-3 h-3"
                              style={{ color: COLORS.status.error }}
                            />
                          )}
                          <span
                            style={{
                              fontWeight: "600",
                              color: COLORS.text.primary,
                            }}
                          >
                            {field.name}
                          </span>
                          {field.isPro && (
                            <span
                              className="px-1 rounded text-xs"
                              style={{
                                backgroundColor: COLORS.brand.primary,
                                color: "white",
                                fontSize: "0.65rem",
                              }}
                            >
                              Pro
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            color: COLORS.text.tertiary,
                            fontSize: "0.65rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {field.path}
                        </span>
                      </div>
                      {showDataPreview && (
                        <div
                          className="mt-1 pl-5 text-xs rounded p-1"
                          style={{
                            backgroundColor: COLORS.background.card,
                            color: "#000000",
                            fontFamily: "monospace",
                            wordBreak: "break-word",
                            fontWeight: "500",
                          }}
                        >
                          {displayValue}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 섹션별 상태 */}
          {isExpanded && !selectedSection && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sections.map((section) => (
                <div
                  key={section.name}
                  className="p-2 rounded cursor-pointer transition-colors"
                  style={{
                    backgroundColor: section.hasData
                      ? COLORS.background.base
                      : COLORS.background.hover,
                    border: `1px solid ${
                      section.hasData
                        ? COLORS.border.light
                        : COLORS.border.input
                    }`,
                  }}
                  onClick={() => setSelectedSection(section.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      COLORS.background.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = section.hasData
                      ? COLORS.background.base
                      : COLORS.background.hover;
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      {section.hasData ? (
                        <CheckCircle2
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: COLORS.status.success }}
                        />
                      ) : (
                        <XCircle
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: COLORS.status.error }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: COLORS.text.primary,
                          }}
                        >
                          {section.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            style={{
                              fontSize: "0.65rem",
                              color: COLORS.text.secondary,
                              fontWeight: "500",
                            }}
                          >
                            {section.component}
                          </span>
                          {section.proFields.length > 0 && (
                            <div className="flex items-center gap-1">
                              {section.proFields.map((field, idx) => (
                                <div
                                  key={idx}
                                  className="w-2 h-2 rounded-full border"
                                  style={{
                                    backgroundColor: getFieldValue(field.path)
                                      ? COLORS.brand.primary
                                      : COLORS.background.base,
                                    borderColor: getFieldValue(field.path)
                                      ? COLORS.brand.primary
                                      : COLORS.border.light,
                                  }}
                                  title={field.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: COLORS.text.secondary }}
                      />
                    </div>
                  </div>
                  {showDataPreview && section.hasData && (
                    <div
                      className="mt-1 pl-6 text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: COLORS.text.primary,
                          fontWeight: "500",
                        }}
                      >
                        {section.description}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: COLORS.text.secondary,
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          fontWeight: "500",
                        }}
                      >
                        조건: {section.condition}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 요약 정보 */}
          {!isExpanded && !selectedSection && (
            <div
              className="text-xs font-medium"
              style={{ color: COLORS.text.secondary }}
            >
              {sections.filter((s) => s.hasData).length} / {sections.length}{" "}
              섹션 활성화
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
