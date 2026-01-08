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
        {view.narrative_summary && view.narrative_summary.trim() && (
          <div
            className="py-5 px-6 rounded-2xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <p className="text-sm" style={{ lineHeight: "1.7", opacity: 0.95 }}>
              {view.narrative_summary}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
