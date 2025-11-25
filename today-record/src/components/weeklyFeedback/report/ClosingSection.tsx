import { CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "../../ui/card";

type ClosingSectionProps = {
  weeklyOneLiner: string;
  nextWeekObjective: string;
  callToAction: string[];
};

export function ClosingSection({
  weeklyOneLiner,
  nextWeekObjective,
  callToAction,
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
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          이번 주의 결론
        </h2>
      </div>

      {/* Weekly One-Liner - Main Conclusion */}
      <Card
        className="p-6 sm:p-8 mb-4"
        style={{
          background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
          color: "white",
          border: "none",
        }}
      >
        <p className="text-base sm:text-lg leading-relaxed text-center">
          &ldquo;{weeklyOneLiner}&rdquo;
        </p>
      </Card>

      {/* Next Week Objective */}
      <Card
        className="p-5 sm:p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          다음 주 방향
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#333333" }}
        >
          {nextWeekObjective}
        </p>
      </Card>

      {/* Call to Action - Checklist Style */}
      <Card
        className="p-5 sm:p-6"
        style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
      >
        <p
          className="text-xs mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          다음 주 실행 계획
        </p>
        <ul className="space-y-2.5">
          {callToAction.map((action, index) => (
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
                style={{ color: "#333333" }}
              >
                {action}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
