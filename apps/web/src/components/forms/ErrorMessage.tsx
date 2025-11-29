"use client";

import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md ${className}`}
      style={{ fontSize: "0.9rem" }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {message}
      </div>
    </div>
  );
}
