import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading: boolean;
}

export function MonthNavigation({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  isLoading,
}: MonthNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevMonth}
        disabled={isLoading}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: "#6B7A6F" }}
        aria-label="이전 달"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h2 className="text-lg font-semibold" style={{ color: "#333333" }}>
        {monthLabel}
      </h2>

      <button
        onClick={onNextMonth}
        disabled={isLoading}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: "#6B7A6F" }}
        aria-label="다음 달"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
