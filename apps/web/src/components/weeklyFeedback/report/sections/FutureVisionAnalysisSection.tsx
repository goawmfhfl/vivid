import type { VividReport } from "@/types/weekly-feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ContentCard, GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type FutureVisionAnalysisSectionProps = {
  futureVisionAnalysis: VividReport["future_vision_analysis"];
};

export function FutureVisionAnalysisSection({
  futureVisionAnalysis,
}: FutureVisionAnalysisSectionProps) {
  if (!futureVisionAnalysis) return null;

  return (
    <ScrollAnimation delay={300}>
      <div className="space-y-5">
      <ContentCard
        label="앞으로의 모습 종합 분석"
        content={futureVisionAnalysis.integrated_summary}
        gradientColor="163, 191, 217"
        sectionNumber={3}
        sectionNumberColor="#A3BFD9"
      />
      {futureVisionAnalysis.consistency_analysis && (
        <GradientCard gradientColor="163, 191, 217">
          <p
            className={cn(
              TYPOGRAPHY.label.fontSize,
              TYPOGRAPHY.label.fontWeight,
              TYPOGRAPHY.label.letterSpacing,
              "mb-3 uppercase"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            일관성 분석
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {futureVisionAnalysis.consistency_analysis.consistent_themes &&
              futureVisionAnalysis.consistency_analysis.consistent_themes
                .length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(163, 191, 217, 0.2)",
                  }}
                >
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    일관성 있는 비전
                  </p>
                  <div className="space-y-2.5">
                    {futureVisionAnalysis.consistency_analysis.consistent_themes.map(
                      (theme, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className="w-1 h-1 rounded-full mt-2.5 flex-shrink-0"
                            style={{ 
                              backgroundColor: "#4CAF50",
                              boxShadow: `0 0 0 3px rgba(76, 175, 80, 0.15)`,
                            }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "flex-1"
                            )}
                            style={{
                              color: COLORS.text.primary,
                            }}
                          >
                            {theme}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            {futureVisionAnalysis.consistency_analysis.changing_themes &&
              futureVisionAnalysis.consistency_analysis.changing_themes
                .length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(163, 191, 217, 0.2)",
                  }}
                >
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    변화하는 비전
                  </p>
                  <div className="space-y-2.5">
                    {futureVisionAnalysis.consistency_analysis.changing_themes.map(
                      (theme, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className="w-1 h-1 rounded-full mt-2.5 flex-shrink-0"
                            style={{ 
                              backgroundColor: "#FF9800",
                              boxShadow: `0 0 0 3px rgba(255, 152, 0, 0.15)`,
                            }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "flex-1"
                            )}
                            style={{
                              color: COLORS.text.primary,
                            }}
                          >
                            {theme}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mt-3"
            )}
            style={{
              color: COLORS.text.secondary,
            }}
          >
            {futureVisionAnalysis.consistency_analysis.analysis}
          </p>
        </GradientCard>
      )}
      </div>
    </ScrollAnimation>
  );
}
