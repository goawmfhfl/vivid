import { Target } from "lucide-react";
import { COLORS } from "@/lib/design-system";
import { SectionHeader } from "../common/feedback";
import { SectionProps } from "./types";
import { CurrentVividSection } from "./CurrentVividSection";
import { FutureVisionSection } from "./FutureVisionSection";
import { RetrospectiveSection } from "./RetrospectiveSection";
import { AlignmentAnalysisSection } from "./AlignmentAnalysisSection";
import { ExecutionAnalysisSection } from "./ExecutionAnalysisSection";
import { UserCharacteristicsSection } from "./UserCharacteristicsSection";

export function VisionSection({ view, isPro: _isPro = false }: SectionProps) {
  const currentColor = COLORS.dailyVivid.current;

  

  return (
    <div className="mb-16">
      <SectionHeader
        icon={Target}
        iconGradient={currentColor}
        title="오늘의 VIVID"
        description="기륵올 통해, 나다운 삶을 선명하게"
      />
      <CurrentVividSection view={view} />
      <FutureVisionSection view={view} />
      <RetrospectiveSection view={view} />
      <AlignmentAnalysisSection view={view} />
      <ExecutionAnalysisSection view={view} />
      <UserCharacteristicsSection view={view} />
    </div>
  );
}
