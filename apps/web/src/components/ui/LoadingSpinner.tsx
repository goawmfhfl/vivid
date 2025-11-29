"use client";

import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showMessage?: boolean;
  icon?: ReactNode;
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
 * 공통 로딩 스피너 컴포넌트
 * 모달, 타임라인 등 다양한 곳에서 재사용 가능
 */
export function LoadingSpinner({
  message,
  size = "md",
  className = "",
  showMessage = true,
  icon,
}: LoadingSpinnerProps) {
  const sizes = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-pulse ${showMessage ? "mb-4" : ""}`}>
        <div
          className={`${sizes.container} rounded-full mx-auto flex items-center justify-center`}
          style={{ backgroundColor: "#EFE9E3" }}
        >
          {icon || (
            <Sparkles className={sizes.icon} style={{ color: "#6B7A6F" }} />
          )}
        </div>
      </div>
      {showMessage && message && (
        <p
          className={sizes.message}
          style={{
            color: "#4E4B46",
            textAlign: "center",
            marginTop: "0.5rem",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
