import { useMemo } from "react";
import { useRecordsByMonth } from "@/hooks/useRecordsByMonth";
import { useDailyVividDatesByMonth } from "@/hooks/useDailyVividDatesByMonth";
import {
  CalendarLogMap,
  getLocalStartOfDay,
  isSameDay,
  toISODate,
} from "./calendar-utils";
import type { Record } from "@/hooks/useRecords";

/**
 * LogView에서 사용하는 데이터 페칭 및 변환 로직
 */
export function useLogViewData(year: number, month: number) {
  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useRecordsByMonth(year, month);

  const {
    data: dailyVividDates = [],
    isLoading: isLoadingFeedback,
    error: feedbackError,
  } = useDailyVividDatesByMonth(year, month);

  const isLoading = isLoadingRecords || isLoadingFeedback;

  // 캘린더 표시용 맵 생성
  const logs = useMemo(() => {
    const logMap: CalendarLogMap = {};

    // Records 표시
    records.forEach((record: Record) => {
      const isoDate = record.kst_date;
      if (!logMap[isoDate]) {
        logMap[isoDate] = { hasLog: false, hasDailyVivid: false };
      }
      logMap[isoDate].hasLog = true;
    });

    // Daily Vivid 표시
    dailyVividDates.forEach((date) => {
      if (!logMap[date]) {
        logMap[date] = { hasLog: false, hasDailyVivid: false };
      }
      logMap[date].hasDailyVivid = true;
    });

    return logMap;
  }, [records, dailyVividDates]);

  return {
    records,
    dailyVividDates,
    logs,
    isLoading,
    errors: { recordsError, feedbackError },
  };
}

/**
 * 선택된 날짜의 records 필터링
 */
export function useSelectedDateRecords(records: Record[], selectedDate: Date) {
  return useMemo(() => {
    const selectedIsoDate = toISODate(selectedDate);
    return records.filter((record) => record.kst_date === selectedIsoDate);
  }, [records, selectedDate]);
}

/**
 * 선택된 날짜에 daily-vivid가 있는지 확인
 */
export function useHasDailyVivid(
  dailyVividDates: string[],
  selectedDate: Date
) {
  return useMemo(() => {
    const selectedIsoDate = toISODate(selectedDate);
    return dailyVividDates.includes(selectedIsoDate);
  }, [dailyVividDates, selectedDate]);
}

/**
 * 날짜 관련 유틸리티
 */
export function useDateLabels(selectedDate: Date, selectedMonth: Date) {
  const isToday = useMemo(
    () => isSameDay(selectedDate, getLocalStartOfDay()),
    [selectedDate]
  );

  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    [selectedDate]
  );

  const selectedMonthLabel = useMemo(
    () =>
      selectedMonth.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      }),
    [selectedMonth]
  );

  return {
    isToday,
    selectedDateLabel,
    selectedMonthLabel,
  };
}
