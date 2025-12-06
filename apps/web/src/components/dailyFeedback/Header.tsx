"use client";

import { Lightbulb } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function HeaderSection({ view }: SectionProps) {
  return (
    <div className="mb-10">
      <div
        className="p-8 rounded-3xl mb-6"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
        }}
      >
        <div className="mb-4">
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

      {/* Summary Section 통합 */}
      {view.summary_key_points && view.summary_key_points.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A8BBA8" }}
            >
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <h2
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: "#333333" }}
            >
              전체 요약
            </h2>
          </div>
          <Card
            className="p-6 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
          >
            <div className="space-y-4">
              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "#6B7A6F",
                    marginBottom: "0.75rem",
                  }}
                >
                  핵심 포인트
                </p>
                <ul className="space-y-2">
                  {view.summary_key_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: "#A8BBA8" }}
                      />
                      <p
                        className="text-sm"
                        style={{
                          color: "#333333",
                          lineHeight: "1.6",
                        }}
                      >
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
