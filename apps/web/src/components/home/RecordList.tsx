"use client";

import { useState, useMemo } from "react";
import { PenLine } from "lucide-react";
import { RecordItem } from "../common/RecordItem";
import { type Record } from "../../hooks/useRecords";
import { RecordItemSkeleton } from "../ui/Skeleton";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import { getKSTDateString } from "@/lib/date-utils";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface RecordListProps {
  records: Record[];
  isLoading: boolean;
  error?: unknown;
  onEdit: (record: Record) => void;
  onDelete: (id: number) => void;
  onRetry?: () => void;
  selectedDate?: string; // YYYY-MM-DD 형식, 선택한 날짜
}

export function RecordList({
  records,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
  selectedDate,
}: RecordListProps) {
  const [retryCount, setRetryCount] = useState(0);

  // 선택한 날짜 또는 오늘 날짜로 필터링
  const targetDate = selectedDate || getKSTDateString();
  const filteredRecords = records.filter((record) => {
    return record.kst_date === targetDate;
  });

  const isToday = !selectedDate || selectedDate === getKSTDateString();

  // 선택한 날짜의 총 글자 수 계산
  const totalCharCount = useMemo(() => {
    return filteredRecords.reduce((total, record) => {
      return total + (record.content?.length || 0);
    }, 0);
  }, [filteredRecords]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    if (onRetry) onRetry();
  };

  // 에러 메시지 계산
  const resolvedErrorMessage = (() => {
    let base = "기록을 불러오는데 실패했습니다.";
    if (error) {
      if (error instanceof Error) {
        base = error.message || base;
      } else {
        try {
          base = JSON.stringify(error);
        } catch {
          base = String(error);
        }
      }
    }
    return retryCount > 0
      ? `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`
      : base;
  })();

  // Loading State
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2
          className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight, "mb-4")}
          style={{ color: COLORS.text.primary }}
        >
          {isToday ? "오늘의 타임라인" : "타임라인"}
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecordItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="mb-6">
        <h2
          className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight, "mb-4")}
          style={{ color: COLORS.text.primary }}
        >
          {isToday ? "오늘의 타임라인" : "타임라인"}
        </h2>
        <div className="py-8">
          <ErrorDisplay
            message={resolvedErrorMessage}
            size="md"
            showMessage={true}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // Empty State
  if (filteredRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <PenLine
          className="w-12 h-12 mx-auto mb-3"
          style={{ color: "#A8BBA8", opacity: 0.5 }}
        />
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{
            color: COLORS.text.secondary,
            opacity: 0.6,
          }}
        >
          {isToday
            ? "오늘의 첫 기록을 시작해보세요"
            : "이 날짜에는 기록이 없습니다"}
        </p>
      </div>
    );
  }

  // Records List
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2
          className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          {isToday ? "오늘의 타임라인" : "타임라인"}
        </h2>
        {totalCharCount > 0 && (
          <span
            className={cn(TYPOGRAPHY.caption.fontSize, TYPOGRAPHY.caption.fontWeight)}
            style={{
              color: COLORS.text.muted,
              opacity: 0.6,
            }}
          >
            총 {totalCharCount.toLocaleString()}자
          </span>
        )}
      </div>

      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <RecordItem
            key={record.id}
            record={record}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
