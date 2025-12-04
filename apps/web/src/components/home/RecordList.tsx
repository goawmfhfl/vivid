"use client";

import { useState, useMemo } from "react";
import { PenLine } from "lucide-react";
import { RecordItem } from "../common/RecordItem";
import { type Record } from "../../hooks/useRecords";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import { getKSTDateString } from "@/lib/date-utils";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

interface RecordListProps {
  records: Record[];
  isLoading: boolean;
  error?: unknown;
  onEdit: (record: Record) => void;
  onDelete: (id: number) => void;
  onRetry?: () => void;
}

export function RecordList({
  records,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
}: RecordListProps) {
  const [retryCount, setRetryCount] = useState(0);

  const todayRecords = records.filter((record) => {
    const todayKST = getKSTDateString();
    return record.kst_date === todayKST;
  });

  // 오늘의 총 글자 수 계산
  const totalCharCount = useMemo(() => {
    return todayRecords.reduce((total, record) => {
      return total + (record.content?.length || 0);
    }, 0);
  }, [todayRecords]);

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
        <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
          오늘의 타임라인
        </h2>
        <div className="py-8">
          <LoadingSpinner
            message="기록을 불러오는 중..."
            size="md"
            showMessage={true}
          />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="mb-6">
        <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
          오늘의 타임라인
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
  if (todayRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <PenLine
          className="w-12 h-12 mx-auto mb-3"
          style={{ color: "#A8BBA8", opacity: 0.5 }}
        />
        <p
          style={{
            color: "#4E4B46",
            opacity: 0.6,
            fontSize: "0.9rem",
          }}
        >
          오늘의 첫 기록을 시작해보세요
        </p>
      </div>
    );
  }

  // Records List
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ color: "#333333", fontSize: "1.1rem" }}>
          오늘의 타임라인
        </h2>
        {totalCharCount > 0 && (
          <span
            className={TYPOGRAPHY.caption.fontSize}
            style={{
              color: COLORS.text.muted,
              opacity: 0.6,
              fontSize: "0.75rem",
            }}
          >
            총 {totalCharCount.toLocaleString()}자
          </span>
        )}
      </div>

      <div className="space-y-3">
        {todayRecords.map((record) => (
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
