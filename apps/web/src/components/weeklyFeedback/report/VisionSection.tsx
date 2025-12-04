import { Target, Lock } from "lucide-react";
import { Card } from "../../ui/card";
import type { VisionReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

export function VisionSection({
  visionReport,
  isPro = false,
}: VisionSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 비전
        </h2>
      </div>

      {/* Vision Summary */}
      {visionReport.vision_summary && (
        <Card
          className="p-4 sm:p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
            {visionReport.vision_summary}
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
                더 깊은 비전 분석이 필요하신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 이번 주의 비전 일관성, 목표 패턴, 정체성 정렬을
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 비전 지도를 함께
                만들어보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && (
        <div className="space-y-4">
          {/* Vision Consistency */}
          {visionReport.vision_consistency && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                비전 일관성
              </p>
              {/* TODO: 비전 일관성 시각화 */}
            </Card>
          )}

          {/* Goals Pattern */}
          {visionReport.goals_pattern && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                목표 패턴
              </p>
              {/* TODO: 목표 패턴 시각화 */}
            </Card>
          )}

          {/* Next Week Vision Focus */}
          {visionReport.next_week_vision_focus && (
            <Card
              className="p-5 sm:p-6"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <p className="text-xs mb-2.5 sm:mb-3" style={{ color: COLORS.text.secondary }}>
                다음 주 비전 포커스
              </p>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
                {visionReport.next_week_vision_focus.summary}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

