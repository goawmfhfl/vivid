"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Sparkles } from "lucide-react";
import { Calendar } from "./logs/Calendar";
import {
  CalendarLogMap,
  getLocalStartOfDay,
  isSameDay,
  parseISODateToLocalDate,
  toISODate,
} from "./logs/calendar-utils";
import { useRecordsByMonth } from "@/hooks/useRecordsByMonth";
import { useDailyFeedbackDatesByMonth } from "@/hooks/useDailyFeedbackDatesByMonth";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import type { Record } from "@/hooks/useRecords";

type LogViewProps = {
  onSelectDate?: (date: Date) => void;
};

export function LogView({ onSelectDate }: LogViewProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    getLocalStartOfDay()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getLocalStartOfDay()
  );

  // 현재 선택된 월의 데이터만 조회
  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth() + 1;

  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useRecordsByMonth(currentYear, currentMonth);

  const {
    data: dailyFeedbackDates = [],
    isLoading: isLoadingFeedback,
    error: feedbackError,
  } = useDailyFeedbackDatesByMonth(currentYear, currentMonth);

  const isLoading = isLoadingRecords || isLoadingFeedback;

  // 캘린더 표시용 맵 생성
  const logs = useMemo(() => {
    const logMap: CalendarLogMap = {};

    // Records 표시
    records.forEach((record: Record) => {
      const isoDate = record.kst_date;
      if (!logMap[isoDate]) {
        logMap[isoDate] = { hasLog: false, hasDailyFeedback: false };
      }
      logMap[isoDate].hasLog = true;
    });

    // Daily Feedback 표시
    dailyFeedbackDates.forEach((date) => {
      if (!logMap[date]) {
        logMap[date] = { hasLog: false, hasDailyFeedback: false };
      }
      logMap[date].hasDailyFeedback = true;
    });

    return logMap;
  }, [records, dailyFeedbackDates]);

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

  // 선택된 날짜의 records 필터링
  const selectedDateRecords = useMemo(() => {
    const selectedIsoDate = toISODate(selectedDate);
    return records.filter(
      (record: Record) => record.kst_date === selectedIsoDate
    );
  }, [records, selectedDate]);

  // 선택된 날짜에 daily-feedback이 있는지 확인
  const hasDailyFeedbackForSelectedDate = useMemo(() => {
    const selectedIsoDate = toISODate(selectedDate);
    return dailyFeedbackDates.includes(selectedIsoDate);
  }, [dailyFeedbackDates, selectedDate]);

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

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="mb-1" style={{ color: "#333333", fontSize: "1.5rem" }}>
            지난 기록
          </h1>
          <p style={{ color: "#4E4B46", opacity: 0.7, fontSize: "0.9rem" }}>
            {isLoading
              ? "로딩 중..."
              : `${currentYear}년 ${currentMonth}월: ${records.length}개의 기록`}
          </p>
        </header>

        {/* Calendar */}
        <Card className="p-6 mb-6 rounded-xl border bg-white border-[#EFE9E3]">
          {isLoading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
          {/* 월/년도 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: "#6B7A6F" }}
              aria-label="이전 달"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h2 className="text-lg font-semibold" style={{ color: "#333333" }}>
              {selectedMonthLabel}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: "#6B7A6F" }}
              aria-label="다음 달"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 캘린더 그리드 */}
          {!isLoading && (
            <Calendar
              year={selectedMonth.getFullYear()}
              month={selectedMonth.getMonth() + 1}
              logs={logs}
              onSelectDate={handleSelectDate}
              locale="ko"
              startOfWeek="sun"
              selectedDate={selectedDate}
            />
          )}
        </Card>

        {/* 선택된 날짜의 기록들 */}
        <div className="mb-6">
          <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
            {selectedDateLabel}
            {isToday && " (오늘)"}
          </h2>

          {selectedDateRecords.length > 0 ? (
            <div className="space-y-3">
              {selectedDateRecords.map((record: Record) => (
                <Card
                  key={record.id}
                  className="p-4"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #EFE9E3",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {new Date(record.created_at).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <p
                        style={{
                          color: "#333333",
                          lineHeight: "1.6",
                          fontSize: "0.9rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {record.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card
              className="p-8 text-center"
              style={{
                backgroundColor: "white",
                border: "1px solid #EFE9E3",
                borderRadius: "16px",
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#F8F9FA" }}
                >
                  <FileText className="w-8 h-8" style={{ color: "#6B7A6F" }} />
                </div>
                <h3
                  style={{
                    color: "#333333",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  기록이 없습니다
                </h3>
              </div>
            </Card>
          )}
        </div>

        {/* AI 리뷰 버튼 */}
        {hasDailyFeedbackForSelectedDate && (
          <div className="flex justify-center">
            <Button
              onClick={() => {
                const dateStr = toISODate(selectedDate);
                router.push(`/feedback/${dateStr}`);
              }}
              className="rounded-full px-6 py-3 flex items-center gap-2"
              style={{
                backgroundColor: "#A8BBA8",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              <Sparkles className="w-4 h-4" />
              AI 리뷰 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
