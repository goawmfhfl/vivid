import type { ReactNode } from "react";
import type { TodoListItem } from "@/types/daily-vivid";
import type { DailyReportData } from "../types";

export interface ReviewAddToScheduleProps {
  renderAddToScheduleButton: (contents: string) => ReactNode;
}

export interface ReviewScheduleRenderProps extends ReviewAddToScheduleProps {
  renderRescheduleButton: (item: TodoListItem) => ReactNode;
}

export interface ReviewSectionProps {
  view: DailyReportData;
}

export interface ReviewSuggestedTodosSectionProps extends ReviewSectionProps, ReviewAddToScheduleProps {}
