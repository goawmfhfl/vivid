import { Lightbulb, Lock } from "lucide-react";
import { Card } from "../../ui/card";
import type { InsightReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";

type InsightSectionProps = {
  insightReport: InsightReport;
  isPro?: boolean;
};

export function InsightSection({
  insightReport,
  isPro = false,
}: InsightSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#F4C430" }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 인사이트
        </h2>
      </div>

      {/* Core Insights */}
      {insightReport.core_insights && insightReport.core_insights.length > 0 && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-3" style={{ color: COLORS.text.secondary }}>
            핵심 인사이트
          </p>
          <ul className="space-y-3">
            {insightReport.core_insights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3"
                style={{ color: COLORS.text.primary }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "#F4C430", color: "white" }}
                >
                  <span className="text-xs font-semibold">{idx + 1}</span>
                </div>
                <p className="text-sm leading-relaxed flex-1">{insight}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Meta Questions Highlight */}
      {insightReport.meta_questions_highlight &&
        insightReport.meta_questions_highlight.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
          >
            <p className="text-xs mb-3" style={{ color: COLORS.text.secondary }}>
              메타 질문
            </p>
            <ul className="space-y-2">
              {insightReport.meta_questions_highlight.map((question, idx) => (
                <li
                  key={idx}
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.text.primary }}
                >
                  • {question}
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* Free 모드: Pro 업그레이드 유도 */}
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
                style={{ color: COLORS.text.primary }}
              >
                인사이트를 행동으로 옮기고 싶으신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 이번 주의 인사이트 패턴, 강점 발견, 행동 정렬을
                시각화해 드립니다. 깨달음이 그냥 감탄으로 끝나지 않고, 당신의 성장으로
                이어지도록 도와드려요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && (
        <div className="space-y-4">
          {/* Insight Patterns */}
          {insightReport.insight_patterns && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                인사이트 패턴
              </p>
              {/* TODO: 인사이트 패턴 시각화 */}
            </Card>
          )}

          {/* Growth Insights */}
          {insightReport.growth_insights && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                성장 인사이트
              </p>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                {insightReport.growth_insights.summary}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

