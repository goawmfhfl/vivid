"use client";

import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface ErrorDisplayProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showMessage?: boolean;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}

const sizeMap = {
  sm: {
    container: "w-10 h-10",
    icon: "w-5 h-5",
    message: "text-sm",
  },
  md: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
    message: "text-base",
  },
  lg: {
    container: "w-20 h-20",
    icon: "w-10 h-10",
    message: "text-lg",
  },
};

/**
 * 공통 에러 표시 컴포넌트
 * 타임라인, 모달 등 다양한 곳에서 재사용 가능
 */
export function ErrorDisplay({
  message,
  size = "md",
  className = "",
  showMessage = true,
  icon,
  onRetry,
  retryLabel = "다시 시도",
}: ErrorDisplayProps) {
  const sizes = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${showMessage ? "mb-4" : ""}`}>
        <div
          className={`${sizes.container} rounded-full mx-auto flex items-center justify-center`}
          style={{ backgroundColor: "#FEF2F2" }}
        >
          {icon || (
            <AlertCircle className={sizes.icon} style={{ color: "#DC2626" }} />
          )}
        </div>
      </div>
      {showMessage && message && (
        <div className="text-center">
          <p
            className={sizes.message}
            style={{
              color: "#DC2626",
              textAlign: "center",
              marginBottom: onRetry ? "1rem" : "0",
              whiteSpace: "pre-line",
            }}
          >
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#55685E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6B7A6F";
              }}
            >
              {retryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
