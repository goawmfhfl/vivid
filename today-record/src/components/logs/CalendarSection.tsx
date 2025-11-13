import { Card } from "../ui/card";
import { Calendar } from "./Calendar";
import { MonthNavigation } from "./MonthNavigation";
import type { CalendarLogMap } from "./calendar-utils";

interface CalendarSectionProps {
  year: number;
  month: number;
  monthLabel: string;
  logs: CalendarLogMap;
  selectedDate: Date;
  isLoading: boolean;
  onSelectDate: (isoDate: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarSection({
  year,
  month,
  monthLabel,
  logs,
  selectedDate,
  isLoading,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarSectionProps) {
  return (
    <Card className="p-6 mb-6 rounded-xl border bg-white border-[#EFE9E3]">
      <MonthNavigation
        monthLabel={monthLabel}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        isLoading={isLoading}
      />

      <Calendar
        year={year}
        month={month}
        logs={logs}
        onSelectDate={onSelectDate}
        locale="ko"
        startOfWeek="sun"
        selectedDate={selectedDate}
      />
    </Card>
  );
}
