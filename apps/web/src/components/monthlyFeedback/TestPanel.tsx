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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { COLORS } from "@/lib/design-system";
import type { MonthlyFeedbackNew } from "@/types/monthly-feedback-new";

interface TestPanelProps {
  view: MonthlyFeedbackNew;
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

  // 섹션별 상세 정보 정의
  const sectionDefinitions = [
    {
      name: "Header",
      component: "MonthlyReportHeader",
      description: "월간 범위, 제목",
      fields: [
        { name: "month_label", path: "view.month_label", isPro: false },
        { name: "date_range", path: "view.date_range", isPro: false },
        { name: "title", path: "view.title", isPro: false },
        { name: "recorded_days", path: "view.recorded_days", isPro: false },
        { name: "total_days", path: "view.total_days", isPro: false },
      ],
      condition: "항상 표시",
    },
    {
      name: "Vivid Report",
      component: "VividSection",
      description: "월간 비비드 리포트 (5개 섹션)",
      fields: [
        {
          name: "vision_evolution",
          path: "view.vivid_report.vision_evolution",
          isPro: false,
        },
        {
          name: "alignment_analysis",
          path: "view.vivid_report.alignment_analysis",
          isPro: false,
        },
        {
          name: "daily_life_patterns",
          path: "view.vivid_report.daily_life_patterns",
          isPro: false,
        },
        {
          name: "identity_alignment",
          path: "view.vivid_report.identity_alignment",
          isPro: false,
        },
        {
          name: "next_month_plan",
          path: "view.vivid_report.next_month_plan",
          isPro: false,
        },
      ],
      condition: "vivid_report !== null",
    },
  ];

  // 필드 값 가져오기 헬퍼 함수
  const getFieldValue = (path: string) => {
    // "view." 제거
    const pathWithoutView = path.replace(/^view\./, "");

    // 옵셔널 체이닝(`?.`)과 일반 점(`.`)을 모두 분리
    const parts = pathWithoutView.split(/\?\.|\./).filter(Boolean);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = view;
    for (const part of parts) {
      // 모든 접근에 옵셔널 체이닝 사용 (null/undefined 안전)
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    return value;
  };

  // 섹션별 데이터 검증 (조건 평가 포함)
  const sectionsWithData = sectionDefinitions.map((section) => {
    // 조건 평가 (안전한 방식)
    const hasData = (() => {
      switch (section.name) {
        case "Header":
          return true;
        case "Vivid Report":
          return !!(
            view.vivid_report !== null &&
            view.vivid_report !== undefined
          );
        default:
          return false;
      }
    })();

    const allFields = section.fields.map((field) => {
      const value = getFieldValue(field.path);

      const hasValue = (() => {
        if (value === null || value === undefined) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim() !== "";
        if (typeof value === "object") return Object.keys(value).length > 0;
        return true;
      })();

      return {
        ...field,
        value,
        hasValue,
      };
    });

    const hasAnyData = hasData && allFields.some((f) => f.hasValue);
    const proFields = allFields.filter((f) => f.isPro);
    const freeFields = allFields.filter((f) => !f.isPro);
    const hasProData = hasData && proFields.some((f) => f.hasValue);
    const hasFreeData = hasData && freeFields.some((f) => f.hasValue);

    return {
      ...section,
      allFields,
      hasAnyData,
      hasProData,
      hasFreeData,
    };
  });

  const selectedSectionData = sectionsWithData.find(
    (s) => s.name === selectedSection
  );

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

        const maxX = window.innerWidth - panelRef.current.offsetWidth;
        const maxY = window.innerHeight - panelRef.current.offsetHeight;

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

  // 개발 환경 체크 (프로덕션에서는 숨김)
  if (!isDev) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{
        top: position.y || 80,
        right: position.x === 0 ? 16 : "auto",
        left: position.x > 0 ? position.x : "auto",
        maxWidth: selectedSection ? "600px" : isExpanded ? "400px" : "280px",
        width: isExpanded ? "calc(100vw - 2rem)" : "auto",
        maxHeight: isExpanded ? "calc(100vh - 8rem)" : "auto",
        color: COLORS.text.primary,
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      <Card
        className="transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: COLORS.background.card,
          border: `2px solid ${
            isPro ? COLORS.brand.primary : COLORS.border.light
          }`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            padding: isExpanded ? "1rem" : "0.5rem 0.75rem",
          }}
        >
          {/* 헤더 - 접었을 때도 작게 표시 */}
          <div
            className="flex items-center justify-between"
            onMouseDown={handleMouseDown}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              marginBottom: isExpanded ? "0.75rem" : "0",
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical
                className="w-3 h-3 flex-shrink-0"
                style={{
                  color: COLORS.text.muted,
                  opacity: 0.6,
                }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isPro
                    ? COLORS.brand.primary
                    : COLORS.text.muted,
                }}
              />
              <span
                className="truncate"
                style={{
                  fontSize: isExpanded ? "0.875rem" : "0.75rem",
                  fontWeight: "600",
                  color: COLORS.text.primary,
                }}
              >
                {isExpanded ? "테스트 패널 (Dev Only) - 월간" : "월간 테스트"}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isExpanded && (
                <>
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
                      <EyeOff
                        className="w-3 h-3"
                        style={{ color: "inherit" }}
                      />
                    ) : (
                      <Eye className="w-3 h-3" style={{ color: "inherit" }} />
                    )}
                  </Button>
                </>
              )}
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
                title={isExpanded ? "접기" : "펼치기"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* 접었을 때 간단한 정보만 표시 */}
          {!isExpanded && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: COLORS.text.secondary,
                  }}
                >
                  멤버십:
                </span>
                <Button
                  size="sm"
                  onClick={() => onTogglePro(!isPro)}
                  style={{
                    backgroundColor: isPro
                      ? COLORS.brand.primary
                      : COLORS.border.light,
                    color: isPro ? "white" : COLORS.text.primary,
                    fontSize: "0.65rem",
                    padding: "0.125rem 0.5rem",
                    height: "auto",
                  }}
                >
                  {isPro ? "Pro" : "Free"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: COLORS.text.secondary,
                  }}
                >
                  섹션:
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: COLORS.text.primary,
                    fontWeight: "600",
                  }}
                >
                  {sectionsWithData.filter((s) => s.hasAnyData).length}/
                  {sectionsWithData.length}
                </span>
              </div>
            </div>
          )}

          {/* 펼쳤을 때 전체 내용 표시 */}
          {isExpanded && (
            <>
              {/* Pro/Free 토글 */}
              <div
                className="mb-3 p-2 rounded transition-all duration-200"
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
                  className="mb-3 p-3 rounded text-xs overflow-auto transition-all duration-200"
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
                      color: COLORS.text.primary,
                    }}
                  >
                    {JSON.stringify(view, null, 2)}
                  </pre>
                </div>
              )}

              {/* 섹션 상세 정보 */}
              {selectedSectionData && (
                <div
                  className="mb-3 p-3 rounded transition-all duration-200"
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
                      style={{
                        padding: "0.25rem 0.5rem",
                        color: COLORS.text.primary,
                      }}
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
                          return (
                            JSON.stringify(value).substring(0, 100) + "..."
                          );
                        }
                        return String(value);
                      })();

                      return (
                        <div
                          key={field.name}
                          className="p-2 rounded text-xs transition-all duration-150 hover:opacity-80"
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
                              {field.path.split(".").pop()}
                            </span>
                          </div>
                          {showDataPreview && (
                            <div
                              className="mt-1 p-1 rounded text-xs"
                              style={{
                                backgroundColor: COLORS.background.base,
                                color: COLORS.text.secondary,
                                fontFamily: "monospace",
                                wordBreak: "break-word",
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

              {/* 섹션 리스트 */}
              {!selectedSection && (
                <div className="space-y-1.5">
                  {sectionsWithData.map((section) => (
                    <div
                      key={section.name}
                      className="p-2 rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                      onClick={() => setSelectedSection(section.name)}
                      style={{
                        backgroundColor: section.hasAnyData
                          ? COLORS.background.hover
                          : COLORS.background.base,
                        border: `1px solid ${
                          section.hasAnyData
                            ? COLORS.border.light
                            : COLORS.border.input
                        }`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {section.hasAnyData ? (
                            <CheckCircle2
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: COLORS.status.success }}
                            />
                          ) : (
                            <XCircle
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: COLORS.status.error }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {section.name}
                              </span>
                              {section.hasProData && (
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
                            <p
                              className="truncate"
                              style={{
                                fontSize: "0.7rem",
                                color: COLORS.text.tertiary,
                                marginTop: "0.125rem",
                              }}
                            >
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: COLORS.text.muted }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
