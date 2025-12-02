import { COLORS } from "@/lib/design-system";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-medium"
          style={{ color: COLORS.text.tertiary }}
        >
          단계 {currentStep} / {totalSteps}
        </span>
        <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{
          backgroundColor: COLORS.border.light,
        }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            backgroundColor: COLORS.brand.primary,
          }}
        />
      </div>
    </div>
  );
}
