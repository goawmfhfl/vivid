"use client";

import {
  CheckCircle2,
  XCircle,
  Lock,
  BarChart3,
  TrendingUp,
  User,
  Target,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/monthly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

const EXECUTION_COLOR = COLORS.brand.primary; // #6B7A6F

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
  const router = useRouter();

  if (!executionReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: EXECUTION_COLOR }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 피드백
        </h2>
      </div>

      {/* Positives Top 3 - 모든 사용자 */}
      {Array.isArray(executionReport.positives_top3) &&
        executionReport.positives_top3.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{
              backgroundColor: COLORS.background.card,
              border: "1px solid #E6E4DE",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#E8EFE8" }}
              >
                <Star className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  잘한 점 Top 3
                </p>
                <ul className="space-y-2">
                  {executionReport.positives_top3.map((positive, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: COLORS.text.primary }}
                    >
                      <span
                        className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EXECUTION_COLOR }}
                      />
                      <span style={{ lineHeight: "1.6" }}>{positive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Improvement Areas */}
          {Array.isArray(executionReport.improvement_areas) &&
            executionReport.improvement_areas.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                    }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      개선 영역
                    </p>
                    <ul className="space-y-2">
                      {executionReport.improvement_areas.map((area, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: EXECUTION_COLOR }}
                          />
                          <span style={{ lineHeight: "1.6" }}>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

          {/* Action Items */}
          {Array.isArray(executionReport.action_items) &&
            executionReport.action_items.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      실행 계획
                    </p>
                    <ul className="space-y-2">
                      {executionReport.action_items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <CheckCircle2
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: EXECUTION_COLOR }}
                          />
                          <span style={{ lineHeight: "1.6" }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.3) 0%, rgba(107, 122, 111, 0.15) 100%)",
                border: "1px solid rgba(107, 122, 111, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: EXECUTION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 피드백 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(107, 122, 111, 0.2)",
                    color: EXECUTION_COLOR,
                    letterSpacing: "0.5px",
                  }}
                >
                  PRO
                </span>
              </div>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.6",
                }}
              >
                Pro 멤버십에서는 이번 달의 개선 영역, 실행 계획, 성장 지표를
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 피드백 지도를
                함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: EXECUTION_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
