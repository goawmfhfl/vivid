"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  animated?: boolean;
  duration?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, animated = true, duration = 1000, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const animatedPercentage = useCountUp(percentage, duration, animated);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
