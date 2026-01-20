"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export type AreaItem = {
  area: string;
  impact?: string; // 강점 영역용
  reason?: string; // 개선 영역용
  evidence: string[];
};

/**
 * 근거 드롭다운 컴포넌트
 * 기본적으로 접혀있고, 클릭하면 펼쳐지는 형태
 */
export function EvidenceDropdown({
  evidence,
  color,
  label = "근거",
}: {
  evidence: string[];
  color: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (evidence.length === 0) return null;

  return (
    <div
      className="pt-3 border-t"
      style={{ borderColor: `rgba(${color}, 0.2)` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 transition-all duration-200 hover:opacity-80"
      >
        <p
          className={cn(
            TYPOGRAPHY.caption.fontSize,
            TYPOGRAPHY.caption.fontWeight
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          {label} ({evidence.length}개)
        </p>
        <div className="flex items-center gap-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" style={{ color: `rgb(${color})` }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: `rgb(${color})` }} />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-col gap-2">
            {evidence.map((ev, eIdx) => (
              <div
                key={eIdx}
                className={cn(
                  TYPOGRAPHY.caption.fontSize,
                  "px-3 py-2 rounded-md"
                )}
                style={{
                  backgroundColor: `rgba(${color}, 0.15)`,
                  color: COLORS.text.secondary,
                  border: `1px solid rgba(${color}, 0.3)`,
                  fontSize: "0.7rem",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                }}
              >
                {ev}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface StrengthsWeaknessesCardProps {
  /** 강점 영역 목록 */
  strengths?: AreaItem[];
  /** 개선 영역 목록 */
  weaknesses?: AreaItem[];
  /** 강점 영역 색상 (RGB 값, 예: "127, 143, 122") */
  strengthsColor?: string;
  /** 개선 영역 색상 (RGB 값, 예: "181, 103, 74") */
  weaknessesColor?: string;
}

/**
 * 강점/개선 영역을 나란히 표시하는 카드 컴포넌트
 * 월간 비비드 리포트에서 공통으로 사용
 */
export function StrengthsWeaknessesCard({
  strengths = [],
  weaknesses = [],
  strengthsColor = "127, 143, 122",
  weaknessesColor = "181, 103, 74",
}: StrengthsWeaknessesCardProps) {
  const hasStrengths = strengths && strengths.length > 0;
  const hasWeaknesses = weaknesses && weaknesses.length > 0;

  if (!hasStrengths && !hasWeaknesses) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 강점 영역 */}
      {hasStrengths && (
        <div
          className="rounded-xl transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(${strengthsColor}, 0.12), rgba(${strengthsColor}, 0.06))`,
            border: `1.5px solid rgba(${strengthsColor}, 0.3)`,
            boxShadow: `0 2px 8px rgba(${strengthsColor}, 0.1)`,
          }}
        >
          {/* 헤더 */}
          <div
            className="p-4 pb-3 border-b"
            style={{ borderColor: `rgba(${strengthsColor}, 0.2)` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `rgba(${strengthsColor}, 0.25)`,
                  border: `1.5px solid rgba(${strengthsColor}, 0.4)`,
                }}
              >
                <ArrowUp
                  className="w-4 h-4"
                  style={{ color: `rgb(${strengthsColor})` }}
                />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  TYPOGRAPHY.body.fontWeight
                )}
                style={{ color: COLORS.text.primary }}
              >
                강점
              </p>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-3">
            {strengths.map((item, idx) => (
              <div
                key={idx}
                className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-md overflow-visible"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: `1px solid rgba(${strengthsColor}, 0.25)`,
                }}
              >
                {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                <div
                  className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `rgb(${strengthsColor})`,
                    border: `2px solid white`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                    transform: `rotate(-3deg)`,
                  }}
                >
                  <span
                    className={cn(
                      TYPOGRAPHY.caption.fontSize,
                      TYPOGRAPHY.caption.fontWeight
                    )}
                    style={{ color: "white" }}
                  >
                    {idx + 1}
                  </span>
                </div>
                {/* 영역 제목 */}
                <div className="flex items-start gap-3 mb-3">
                  <p
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight,
                      "flex-1"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {item.area}
                  </p>
                </div>

                {/* 영향 */}
                {item.impact && (
                  <div className="mb-3">
                    <p
                      className={cn(
                        TYPOGRAPHY.caption.fontSize,
                        TYPOGRAPHY.caption.fontWeight,
                        "mb-2"
                      )}
                      style={{ color: COLORS.text.tertiary }}
                    >
                      영향
                    </p>
                    <div
                      className="p-3 rounded-md"
                      style={{
                        backgroundColor: `rgba(${strengthsColor}, 0.1)`,
                      }}
                    >
                      <p
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {item.impact}
                      </p>
                    </div>
                  </div>
                )}

                {/* 근거 */}
                {item.evidence && item.evidence.length > 0 && (
                  <EvidenceDropdown
                    evidence={item.evidence}
                    color={strengthsColor}
                    label="근거"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 개선 영역 */}
      {hasWeaknesses && (
        <div
          className="rounded-xl transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(${weaknessesColor}, 0.12), rgba(${weaknessesColor}, 0.06))`,
            border: `1.5px solid rgba(${weaknessesColor}, 0.3)`,
            boxShadow: `0 2px 8px rgba(${weaknessesColor}, 0.1)`,
          }}
        >
          {/* 헤더 */}
          <div
            className="p-4 pb-3 border-b"
            style={{ borderColor: `rgba(${weaknessesColor}, 0.2)` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `rgba(${weaknessesColor}, 0.25)`,
                  border: `1.5px solid rgba(${weaknessesColor}, 0.4)`,
                }}
              >
                <ArrowDown
                  className="w-4 h-4"
                  style={{ color: `rgb(${weaknessesColor})` }}
                />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  TYPOGRAPHY.body.fontWeight
                )}
                style={{ color: COLORS.text.primary }}
              >
                개선
              </p>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-3">
            {weaknesses.map((item, idx) => (
              <div
                key={idx}
                className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-md overflow-visible"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: `1px solid rgba(${weaknessesColor}, 0.25)`,
                }}
              >
                {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                <div
                  className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `rgb(${weaknessesColor})`,
                    border: `2px solid white`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                    transform: `rotate(-3deg)`,
                  }}
                >
                  <span
                    className={cn(
                      TYPOGRAPHY.caption.fontSize,
                      TYPOGRAPHY.caption.fontWeight
                    )}
                    style={{ color: "white" }}
                  >
                    {idx + 1}
                  </span>
                </div>
                {/* 영역 제목 */}
                <div className="flex items-start gap-3 mb-3">
                  <p
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight,
                      "flex-1"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {item.area}
                  </p>
                </div>

                {/* 원인 */}
                {item.reason && (
                  <div className="mb-3">
                    <p
                      className={cn(
                        TYPOGRAPHY.caption.fontSize,
                        TYPOGRAPHY.caption.fontWeight,
                        "mb-2"
                      )}
                      style={{ color: COLORS.text.tertiary }}
                    >
                      원인
                    </p>
                    <div
                      className="p-3 rounded-md"
                      style={{
                        backgroundColor: `rgba(${weaknessesColor}, 0.1)`,
                      }}
                    >
                      <p
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* 근거 */}
                {item.evidence && item.evidence.length > 0 && (
                  <EvidenceDropdown
                    evidence={item.evidence}
                    color={weaknessesColor}
                    label="근거"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
