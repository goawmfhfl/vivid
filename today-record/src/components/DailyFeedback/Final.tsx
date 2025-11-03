import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
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
          background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
          color: "white",
          border: "none",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>하루 점수</p>
            <p style={{ fontSize: "2.5rem", marginTop: "0.25rem" }}>
              {view.integrity_score}
            </p>
          </div>
          <Progress
            value={view.integrity_score * 10}
            className="w-32"
            style={{ height: "8px" }}
          />
        </div>
        <p style={{ fontSize: "0.9rem", lineHeight: "1.6", opacity: 0.95 }}>
          {view.integrity_reason}
        </p>
      </Card>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "2px solid #A8BBA8" }}
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
          style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
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
          style={{ backgroundColor: "#FDF6F0", border: "1px solid #F0DCC8" }}
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
        style={{ backgroundColor: "#A3BFD9", color: "white", border: "none" }}
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
