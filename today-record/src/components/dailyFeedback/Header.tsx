"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { SectionProps } from "./types";
import { useCountUp } from "@/hooks/useCountUp";

export function HeaderSection({ view }: SectionProps) {
  const [displayScore] = useCountUp({
    targetValue: view.integrity_score ?? 0,
    duration: 1000,
    delay: 500,
  });

  return (
    <div className="mb-10">
      <div
        className="p-8 rounded-3xl mb-6"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-semibold"
              style={{ marginBottom: "0.25rem" }}
            >
              {view.date}
            </h1>
            <p className="text-sm" style={{ opacity: 0.9 }}>
              {view.dayOfWeek}
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-1"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <span className="text-xl font-semibold">{displayScore}</span>
            </div>
            <p
              className="text-xs inline-block whitespace-nowrap"
              style={{ opacity: 0.8 }}
            >
              하루 점수
            </p>
          </div>
        </div>
        <div
          className="py-5 px-6 rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          <p className="text-sm" style={{ lineHeight: "1.7", opacity: 0.95 }}>
            {view.narrative_summary}
          </p>
        </div>
      </div>
    </div>
  );
}
