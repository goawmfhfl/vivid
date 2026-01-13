import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { WeeklyReportData } from "./report/types";
import { VividSection } from "./report/VividSection";
import { COLORS, SPACING } from "@/lib/design-system";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VividFeedbackSection } from "../feedback/VividFeedbackSection";

// 타입 재export
export type { WeeklyReportData } from "./report/types";

type WeeklyFeedbackReportProps = {
  data: WeeklyReportData;
  onBack: () => void;
  isPro?: boolean;
  onTogglePro?: (isPro: boolean) => void;
};

export function WeeklyFeedbackReport({
  data,
  onBack,
  isPro = false,
  onTogglePro: _onTogglePro = () => {},
}: WeeklyFeedbackReportProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const userName =
    currentUser?.user_metadata?.name &&
    typeof currentUser.user_metadata.name === "string"
      ? currentUser.user_metadata.name
      : undefined;

  const handleGoToAnalysis = () => {
    router.push("/reports/weekly");
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div
        className={`${SPACING.page.maxWidth} mx-auto ${SPACING.page.padding}`}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: COLORS.brand.primary }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        {/* 이번 주 비비드 */}
        {data.vivid_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-12">
              <VividSection
                vividReport={data.vivid_report}
                isPro={isPro}
                userName={userName}
              />
            </div>
          </ScrollAnimation>
        )}

        {/* 피드백 섹션 */}
        <ScrollAnimation delay={300}>
          <VividFeedbackSection pageType="weekly" />
        </ScrollAnimation>

        {/* Bottom Action */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleGoToAnalysis}
            className="rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base flex items-center gap-2"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            <BarChart3 className="w-4 h-4" />
            분석 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
