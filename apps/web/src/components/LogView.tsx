"use client";

import { useState } from "react";
import {
  getLocalStartOfDay,
  parseISODateToLocalDate,
} from "./logs/calendar-utils";
import {
  useLogViewData,
  useSelectedDateRecords,
  useHasDailyFeedback,
  useDateLabels,
} from "./logs/useLogViewData";
import { LogViewHeader } from "./logs/LogViewHeader";
import { CalendarSection } from "./logs/CalendarSection";
import { SelectedDateSection } from "./logs/SelectedDateSection";
import { DailyFeedbackButton } from "./logs/DailyFeedbackButton";
import { CreateDailyFeedbackButton } from "./logs/CreateDailyFeedbackButton";

type LogViewProps = {
  onSelectDate?: (date: Date) => void;
};

export function LogView({ onSelectDate }: LogViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    getLocalStartOfDay()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getLocalStartOfDay()
  );

  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth() + 1;

  const { records, dailyFeedbackDates, logs, isLoading } = useLogViewData(
    currentYear,
    currentMonth
  );

  const selectedDateRecords = useSelectedDateRecords(records, selectedDate);
  const hasDailyFeedback = useHasDailyFeedback(
    dailyFeedbackDates,
    selectedDate
  );
  const { isToday, selectedDateLabel, selectedMonthLabel } = useDateLabels(
    selectedDate,
    selectedMonth
  );

  const handleSelectDate = (isoDate: string) => {
    const date = parseISODateToLocalDate(isoDate);
    setSelectedDate(date);
    setSelectedMonth(date);
    onSelectDate?.(date);
  };

  const handlePrevMonth = () => {
    setSelectedMonth((prev) =>
      getLocalStartOfDay(new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    );
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) =>
      getLocalStartOfDay(new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <LogViewHeader
          year={currentYear}
          month={currentMonth}
          recordCount={records.length}
          isLoading={isLoading}
        />

        <CalendarSection
          year={currentYear}
          month={currentMonth}
          monthLabel={selectedMonthLabel}
          logs={logs}
          selectedDate={selectedDate}
          isLoading={isLoading}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <SelectedDateSection
          dateLabel={selectedDateLabel}
          isToday={isToday}
          records={selectedDateRecords}
        />

        {hasDailyFeedback ? (
          <DailyFeedbackButton selectedDate={selectedDate} />
        ) : (
          selectedDateRecords.length > 0 && (
            <CreateDailyFeedbackButton selectedDate={selectedDate} />
          )
        )}
      </div>
    </div>
  );
}
