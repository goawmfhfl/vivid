// Weekly Report Data Type
import type {
  VividReport,
  ClosingReport,
  WeekRange,
} from "@/types/weekly-feedback";

export type WeeklyReportData = {
  week_range: WeekRange;
  vivid_report: VividReport;
  closing_report: ClosingReport;
};
