import { CheckCircle2, Sparkles, Lock } from "lucide-react";
import { Card } from "../../ui/card";
import type { ClosingReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";

type ClosingSectionProps = {
  closingReport: ClosingReport;
  isPro?: boolean;
};

export function ClosingSection({
  closingReport,
  isPro = false,
}: ClosingSectionProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 마무리
        </h2>
      </div>

      {/* Weekly One-Liner - Main Conclusion */}
      {closingReport.call_to_action?.weekly_one_liner && (
        <Card
          className="p-6 sm:p-8 mb-4"
          style={{
            background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
            color: "white",
            border: "none",
          }}
        >
          <p className="text-base sm:text-lg leading-relaxed text-center">
            &ldquo;{closingReport.call_to_action.weekly_one_liner}&rdquo;
          </p>
        </Card>
      )}

      {/* Next Week Objective */}
      {closingReport.call_to_action?.next_week_objective && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
            다음 주 방향
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
            {closingReport.call_to_action.next_week_objective}
          </p>
        </Card>
      )}

      {/* Call to Action - Checklist Style */}
      {closingReport.call_to_action?.actions &&
        closingReport.call_to_action.actions.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
          >
            <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
              다음 주 실행 계획
            </p>
            <ul className="space-y-2.5">
              {closingReport.call_to_action.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: "#A8BBA8", backgroundColor: "white" }}
                  >
                    <CheckCircle2
                      className="w-3 h-3"
                      style={{ color: "#A8BBA8" }}
                    />
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.primary }}
                  >
                    {action}
                  </p>
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
                이번 주의 나를 더 깊이 이해하고 싶으신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 이번 주의 정체성 변화, 성장 스토리, 강점과 개선 영역을
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 정체성 지도를 함께
                만들어보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && (
        <div className="space-y-4">
          {/* This Week Identity */}
          {closingReport.this_week_identity && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                이번 주의 나는
              </p>
              {/* TODO: 정체성 시각화 */}
            </Card>
          )}

          {/* Growth Story */}
          {closingReport.growth_story && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                성장 스토리
              </p>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                {closingReport.growth_story}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
