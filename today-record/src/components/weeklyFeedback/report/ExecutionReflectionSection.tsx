import { AlertCircle, BarChart3, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "../../ui/card";

type ExecutionReflectionSectionProps = {
  positives: string[];
  improvements: string[];
  aiFeedbackSummary: string;
};

export function ExecutionReflectionSection({
  positives,
  improvements,
  aiFeedbackSummary,
}: ExecutionReflectionSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          실행 패턴 회고
        </h2>
      </div>

      {/* Positives & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Positives */}
        <Card
          className="p-4 sm:p-5"
          style={{
            backgroundColor: "#F0F5F0",
            border: "1px solid #D5E3D5",
          }}
        >
          <p
            className="text-xs mb-2.5 sm:mb-3"
            style={{ color: "#6B7A6F" }}
          >
            이번 주 잘한 점
          </p>
          <ul className="space-y-2.5">
            {positives.map((positive, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "#A8BBA8" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333" }}
                >
                  {positive}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Improvements */}
        <Card
          className="p-4 sm:p-5"
          style={{
            backgroundColor: "#FDF6F0",
            border: "1px solid #F0DCC8",
          }}
        >
          <p
            className="text-xs mb-2.5 sm:mb-3"
            style={{ color: "#6B7A6F" }}
          >
            보완할 점
          </p>
          <ul className="space-y-2.5">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "#D08C60" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333" }}
                >
                  {improvement}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* AI Feedback Summary */}
      <div
        className="p-4 sm:p-5 rounded-xl flex gap-3"
        style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
      >
        <Sparkles
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: "#6B7A6F" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
            실행 종합 피드백
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#4E4B46" }}
          >
            {aiFeedbackSummary}
          </p>
        </div>
      </div>
    </div>
  );
}
