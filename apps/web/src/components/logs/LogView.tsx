"use client";

import { useState } from "react";
import { getLocalStartOfDay, parseISODateToLocalDate } from "./calendar-utils";
import {
  useLogViewData,
  useSelectedDateRecords,
  useHasDailyFeedback,
  useDateLabels,
} from "./useLogViewData";
import { AppHeader } from "../common/AppHeader";
import { CalendarSection } from "./CalendarSection";
import { SelectedDateSection } from "./SelectedDateSection";
import { DailyFeedbackButton } from "./DailyFeedbackButton";
import { CreateDailyFeedbackButton } from "./CreateDailyFeedbackButton";
import { EditRecordDialog } from "../home/EditRecordDialog";
import { DeleteRecordDialog } from "../home/DeleteRecordDialog";
import { type Record } from "@/hooks/useRecords";

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
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);

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

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = (open: boolean) => {
    if (!open) {
      setIsEditDialogOpen(false);
      setEditingRecord(null);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingRecordId(id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AppHeader
          title="지난 기록"
          subtitle={
            isLoading
              ? "로딩 중..."
              : `${currentYear}년 ${currentMonth}월: ${records.length}개의 기록`
          }
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {hasDailyFeedback ? (
          <DailyFeedbackButton selectedDate={selectedDate} />
        ) : (
          selectedDateRecords.length > 0 && (
            <CreateDailyFeedbackButton selectedDate={selectedDate} />
          )
        )}
      </div>

      {/* 편집 다이얼로그 */}
      <EditRecordDialog
        record={editingRecord}
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
      />

      {/* 삭제 다이얼로그 */}
      <DeleteRecordDialog
        recordId={deletingRecordId}
        open={deletingRecordId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRecordId(null);
          }
        }}
      />
    </div>
  );
}
