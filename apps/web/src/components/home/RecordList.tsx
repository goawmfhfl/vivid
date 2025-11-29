"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { RecordItem } from "../home/RecordItem";
import { type Record } from "../../hooks/useRecords";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import { useEnvironment } from "@/hooks/useEnvironment";
import { Button } from "../ui/button";
import { getKSTDateString } from "@/lib/date-utils";

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
  const { isTest } = useEnvironment();
  const [testError, setTestError] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const todayRecords = records.filter((record) => {
    const todayKST = getKSTDateString();
    return record.kst_date === todayKST;
  });

  // 테스트용 핸들러
  const handleTestError = () => {
    setTestError(true);
  };

  const handleTestLoading = () => {
    setTestLoading(true);
    setTimeout(() => {
      setTestLoading(false);
    }, 3000);
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    if (onRetry) onRetry();
  };

  // 실제 에러 또는 테스트 에러
  const hasError = error || testError;
  // 실제 로딩 또는 테스트 로딩
  const isActuallyLoading = isLoading || testLoading;

  // 에러 메시지 계산 (비테스트 환경에서는 실제 에러 메시지 노출)
  const resolvedErrorMessage = (() => {
    if (testError) {
      const base = "테스트 에러입니다. 이 메시지는 테스트용입니다.";
      return retryCount > 0
        ? `${base}\n다시 시도 후에도 오류가 반복적으로 발생하면 문의 부탁드립니다.`
        : base;
    }
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
  if (isActuallyLoading) {
    return (
      <div className="mb-6">
        <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
          오늘의 타임라인
        </h2>
        {/* 테스트용 버튼 (개발 환경에서만 표시) */}
        {isTest && (
          <div
            className="mb-4 p-3 rounded-lg border-2 border-dashed"
            style={{ backgroundColor: "#FFF8E7", borderColor: "#E5B96B" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#B8860B" }}
            >
              🧪 타임ライン 테스트 (개발 환경)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleTestLoading}
                size="sm"
                style={{
                  backgroundColor: "#6B7A6F",
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                로딩 테스트
              </Button>
              <Button
                onClick={handleTestError}
                size="sm"
                variant="outline"
                style={{
                  borderColor: "#DC2626",
                  color: "#DC2626",
                  fontSize: "0.75rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                에러 테스트
              </Button>
            </div>
          </div>
        )}
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
  if (hasError) {
    return (
      <div className="mb-6">
        <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
          오늘의 타임라인
        </h2>
        {/* 테스트용 버튼 (개발 환경에서만 표시) */}
        {isTest && (
          <div
            className="mb-4 p-3 rounded-lg border-2 border-dashed"
            style={{ backgroundColor: "#FFF8E7", borderColor: "#E5B96B" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#B8860B" }}
            >
              🧪 타임라인 테스트 (개발 환경)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleTestLoading}
                size="sm"
                style={{
                  backgroundColor: "#6B7A6F",
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                로딩 테스트
              </Button>
              <Button
                onClick={handleTestError}
                size="sm"
                variant="outline"
                style={{
                  borderColor: "#DC2626",
                  color: "#DC2626",
                  fontSize: "0.75rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                에러 테스트
              </Button>
            </div>
          </div>
        )}
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
      <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
        오늘의 타임라인
      </h2>
      {/* 테스트용 버튼 (개발 환경에서만 표시) */}
      {isTest && (
        <div
          className="mb-4 p-3 rounded-lg border-2 border-dashed"
          style={{ backgroundColor: "#FFF8E7", borderColor: "#E5B96B" }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#B8860B" }}
          >
            🧪 타임라인 테스트 (개발 환경)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestLoading}
              size="sm"
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
                fontSize: "0.75rem",
                padding: "0.4rem 0.8rem",
              }}
            >
              로딩 테스트
            </Button>
            <Button
              onClick={handleTestError}
              size="sm"
              variant="outline"
              style={{
                borderColor: "#DC2626",
                color: "#DC2626",
                fontSize: "0.75rem",
                padding: "0.4rem 0.8rem",
              }}
            >
              에러 테스트
            </Button>
          </div>
        </div>
      )}
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
