import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function FinalSection({ view }: SectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>오늘의 마무리</h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{
          background: "linear-gradient(135deg, #6B7A6F 0%, #55685E 100%)",
          color: "white",
          border: "none",
        }}
      >
        <div className="mb-3">
          <p
            style={{
              fontSize: "0.85rem",
              opacity: 0.9,
              marginBottom: "0.5rem",
            }}
          >
            하루 점수
          </p>
          <div className="flex items-center gap-6">
            <p
              style={{
                fontSize: "2.5rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {view.integrity_score}
            </p>
            <div
              className="relative flex-1 overflow-hidden rounded-full"
              style={{
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                className="h-full transition-all duration-300 ease-in-out rounded-full"
                style={{
                  width: `${view.integrity_score * 10}%`,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              />
            </div>
          </div>
        </div>
        <p style={{ fontSize: "0.9rem", lineHeight: "1.6", opacity: 0.95 }}>
          {view.integrity_reason}
        </p>
      </Card>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Sparkles
            className="w-6 h-6 flex-shrink-0"
            style={{ color: "#A8BBA8" }}
          />
          <p
            style={{ color: "#333333", fontSize: "1.15rem", lineHeight: "1.8" }}
          >
            {view.ai_message}
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card
          className="p-5"
          style={{ backgroundColor: "#F4F6F4", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            성장 포인트
          </p>
          <p
            style={{ color: "#333333", lineHeight: "1.7", fontSize: "0.95rem" }}
          >
            {view.growth_point}
          </p>
        </Card>
        <Card
          className="p-5"
          style={{ backgroundColor: "#F9F3EF", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            조정 포인트
          </p>
          <p
            style={{ color: "#333333", lineHeight: "1.7", fontSize: "0.95rem" }}
          >
            {view.adjustment_point}
          </p>
        </Card>
      </div>
      <Card
        className="p-6"
        style={{ backgroundColor: "#8FA894", color: "white", border: "none" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.9,
                marginBottom: "0.5rem",
              }}
            >
              내일의 포커스
            </p>
            <p style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
              {view.tomorrow_focus}
            </p>
          </div>
          <ArrowRight
            className="w-6 h-6 flex-shrink-0 ml-4"
            style={{ opacity: 0.8 }}
          />
        </div>
      </Card>
    </div>
  );
}
