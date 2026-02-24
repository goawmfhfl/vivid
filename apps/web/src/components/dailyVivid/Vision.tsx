import { Target } from "lucide-react";
import { COLORS } from "@/lib/design-system";
import { SectionHeader } from "../common/feedback";
import { SectionProps } from "./types";
import { CurrentVividSection } from "./CurrentVividSection";
import { FutureVisionSection } from "./FutureVisionSection";
import { AlignmentAnalysisSection } from "./AlignmentAnalysisSection";
import { UserCharacteristicsSection } from "./UserCharacteristicsSection";
import { TodoSection } from "./TodoSection";
import { TodayFeedbackSection } from "./TodayFeedbackSection";

export function VisionSection({ view, todoLists, isGeneratingTodo, isPro = false, todayFeedback, isLoadingInsight = false }: SectionProps) {
  const currentColor = COLORS.dailyVivid.current;

  return (
    <div className="mb-16">
      <SectionHeader
        icon={Target}
        iconGradient={currentColor}
        title="오늘의 VIVID"
        description="기록을 통해, 나다운 삶을 선명하게"
      />
      <CurrentVividSection view={view} />
      <FutureVisionSection view={view} />
      <AlignmentAnalysisSection view={view} isPro={isPro} />
      <UserCharacteristicsSection view={view} isPro={isPro} />
      <TodoSection 
        view={view} 
        todoLists={todoLists} 
        isGeneratingTodo={isGeneratingTodo}
      />
      <TodayFeedbackSection
        todayFeedback={todayFeedback ?? null}
        isLoading={isLoadingInsight}
        isGeneratingTodo={isGeneratingTodo}
      />
    </div>
  );
}
