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
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
              {view.date}
            </h1>
            <p style={{ opacity: 0.9, fontSize: "1rem" }}>{view.dayOfWeek}</p>
          </div>
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-1"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <span style={{ fontSize: "1.5rem" }}>{displayScore}</span>
            </div>
            <p
              className="inline-block whitespace-nowrap text-nowrap"
              style={{ opacity: 0.8, fontSize: "0.75rem" }}
            >
              하루 점수
            </p>
          </div>
        </div>
        <div
          className="py-5 px-6 rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          <p style={{ fontSize: "1.1rem", lineHeight: "1.7", opacity: 0.95 }}>
            {view.narrative_summary}
          </p>
        </div>
        <div className="mt-5">
          <p
            style={{
              fontSize: "0.85rem",
              opacity: 0.85,
              marginBottom: "0.75rem",
            }}
          >
            감정의 흐름
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {view.emotion_curve.map((emotion, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {emotion}
                </Badge>
                {index < view.emotion_curve.length - 1 && (
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ opacity: 0.6 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
