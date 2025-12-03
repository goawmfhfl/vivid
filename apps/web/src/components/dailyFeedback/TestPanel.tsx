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
  Info,
  GripVertical,
} from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import type { DailyReportData } from "./types";

interface TestPanelProps {
  view: DailyReportData;
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

  // 섹션별 상세 정보 정의
  const sectionDefinitions = [
    {
      name: "Header",
      component: "HeaderSection",
      description: "날짜, 요일, 점수, 전체 요약, 핵심 포인트 (Pro/Free 차이는 품질로만 구분)",
      fields: [
        { name: "date", path: "view.date", isPro: false },
        { name: "dayOfWeek", path: "view.dayOfWeek", isPro: false },
        { name: "integrity_score", path: "view.integrity_score", isPro: false },
        {
          name: "narrative_summary",
          path: "view.narrative_summary",
          isPro: false,
        },
        {
          name: "summary_key_points",
          path: "view.summary_key_points",
          isPro: false,
        },
      ],
      condition: "항상 표시",
    },
    {
      name: "Daily",
      component: "DailyReportSection",
      description: "일상 기록 요약, 서사, 키워드",
      fields: [
        { name: "daily_summary", path: "view.daily_summary", isPro: false },
        { name: "narrative", path: "view.narrative", isPro: false },
        { name: "keywords", path: "view.keywords", isPro: false },
        { name: "lesson", path: "view.lesson", isPro: false },
        { name: "ai_comment", path: "view.ai_comment", isPro: false },
        {
          name: "detailed_narrative",
          path: "view.detailed_narrative",
          isPro: true,
        },
        {
          name: "context_analysis",
          path: "view.context_analysis",
          isPro: true,
        },
      ],
      condition: "daily_summary.trim() !== ''",
    },
    {
      name: "Emotion",
      component: "EmotionSection",
      description: "감정 흐름, 감정 영역, 시간대별 감정",
      fields: [
        { name: "emotion_curve", path: "view.emotion_curve", isPro: false },
        { name: "ai_mood_valence", path: "view.ai_mood_valence", isPro: false },
        { name: "ai_mood_arousal", path: "view.ai_mood_arousal", isPro: false },
        {
          name: "dominant_emotion",
          path: "view.dominant_emotion",
          isPro: false,
        },
        {
          name: "emotion_quadrant",
          path: "view.emotion_quadrant",
          isPro: false,
        },
        {
          name: "emotion_quadrant_explanation",
          path: "view.emotion_quadrant_explanation",
          isPro: false,
        },
        {
          name: "emotion_timeline",
          path: "view.emotion_timeline",
          isPro: false,
        },
      ],
      condition: "emotion_curve.length > 0",
    },
    {
      name: "Dream",
      component: "VisionSection",
      description: "시각화 요약, 자기 평가, 키워드",
      fields: [
        { name: "vision_summary", path: "view.vision_summary", isPro: false },
        { name: "vision_self", path: "view.vision_self", isPro: false },
        { name: "vision_keywords", path: "view.vision_keywords", isPro: false },
        {
          name: "reminder_sentence",
          path: "view.reminder_sentence",
          isPro: false,
        },
        {
          name: "vision_ai_feedback",
          path: "view.vision_ai_feedback",
          isPro: false,
        },
      ],
      condition: "vision_summary.trim() !== ''",
    },
    {
      name: "Insight",
      component: "InsightSection",
      description: "핵심 인사이트, 학습 출처, 메타 질문",
      fields: [
        { name: "core_insight", path: "view.core_insight", isPro: false },
        { name: "learning_source", path: "view.learning_source", isPro: false },
        { name: "meta_question", path: "view.meta_question", isPro: false },
        {
          name: "insight_ai_comment",
          path: "view.insight_ai_comment",
          isPro: false,
        },
      ],
      condition: "core_insight.trim() !== ''",
    },
    {
      name: "Feedback",
      component: "FeedbackSection",
      description: "핵심 피드백, 잘한 점, 개선할 점",
      fields: [
        { name: "core_feedback", path: "view.core_feedback", isPro: false },
        { name: "positives", path: "view.positives", isPro: false },
        { name: "improvements", path: "view.improvements", isPro: false },
        {
          name: "feedback_ai_comment",
          path: "view.feedback_ai_comment",
          isPro: false,
        },
        { name: "ai_message", path: "view.ai_message", isPro: false },
      ],
      condition: "core_feedback.trim() !== ''",
    },
    {
      name: "Final",
      component: "FinalSection",
      description: "하루 정리, 내일 집중, 성장 포인트",
      fields: [
        { name: "closing_message", path: "view.closing_message", isPro: false },
        { name: "tomorrow_focus", path: "view.tomorrow_focus", isPro: true },
        { name: "growth_point", path: "view.growth_point", isPro: true },
        {
          name: "adjustment_point",
          path: "view.adjustment_point",
          isPro: true,
        },
        {
          name: "integrity_reason",
          path: "view.integrity_reason",
          isPro: false,
        },
      ],
      condition: "closing_message.trim() !== ''",
    },
  ];

  // 필드 값 가져오기 헬퍼
  const getFieldValue = (path: string) => {
    const parts = path.split(".");
    let value: any = view;
    for (const part of parts.slice(1)) {
      value = value?.[part];
    }
    return value;
  };

  // 섹션별 데이터 검증
  const sections = sectionDefinitions.map((def) => {
    const hasData = (() => {
      switch (def.name) {
        case "Header":
          return true;
        case "Daily":
          return !!(view.daily_summary && view.daily_summary.trim());
        case "Emotion":
          return !!(view.emotion_curve && view.emotion_curve.length > 0);
        case "Dream":
          return !!(view.vision_summary && view.vision_summary.trim());
        case "Insight":
          return !!(view.core_insight && view.core_insight.trim());
        case "Feedback":
          return !!(view.core_feedback && view.core_feedback.trim());
        case "Final":
          return !!(view.closing_message && view.closing_message.trim());
        default:
          return false;
      }
    })();

    const proFields = def.fields.filter((f) => f.isPro);
    const allFields = def.fields.map((field) => ({
      ...field,
      value: getFieldValue(field.path),
      hasValue: (() => {
        const val = getFieldValue(field.path);
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "string") return val.trim() !== "";
        return true;
      })(),
    }));

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
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // 화면 경계 내에 유지
        const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 400);
        const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 200);
        
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
      className="fixed z-50 cursor-move"
      style={{
        top: position.y || 80,
        right: position.x ? "auto" : 16,
        left: position.x ? position.x : "auto",
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
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
                테스트 패널 (Dev Only)
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
