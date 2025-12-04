import { CheckCircle2, XCircle, Lock } from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 피드백
        </h2>
      </div>

      {/* Positives Top 3 */}
      {executionReport.positives_top3 && executionReport.positives_top3.length > 0 && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" style={{ color: "#6B7A6F" }} />
            <p className="text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
              잘한 점
            </p>
          </div>
          <ul className="space-y-2">
            {executionReport.positives_top3.map((positive, idx) => (
              <li
                key={idx}
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary }}
              >
                • {positive}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Improvements Top 3 */}
      {executionReport.improvements_top3 &&
        executionReport.improvements_top3.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" style={{ color: "#B89A7A" }} />
              <p className="text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                개선할 점
              </p>
            </div>
            <ul className="space-y-2">
              {executionReport.improvements_top3.map((improvement, idx) => (
                <li
                  key={idx}
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.text.primary }}
                >
                  • {improvement}
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* AI Feedback Summary */}
      {executionReport.ai_feedback_summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{ backgroundColor: "#F7F8F6", border: "1px solid #E6E4DE" }}
        >
          <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
            AI 종합 피드백
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
            {executionReport.ai_feedback_summary}
          </p>
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
                더 깊은 피드백 분석이 필요하신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 피드백 패턴, 정체성 분석, 개선-행동 정렬을 시각화해
                드립니다. 기록을 성장으로 바꾸는 당신만의 피드백 지도를 함께 만들어보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && (
        <div className="space-y-4">
          {/* Feedback Patterns */}
          {executionReport.feedback_patterns && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                피드백 패턴
              </p>
              {/* TODO: 피드백 패턴 시각화 */}
            </Card>
          )}

          {/* Growth Insights */}
          {executionReport.growth_insights && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                성장 인사이트
              </p>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                {executionReport.growth_insights.summary}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

