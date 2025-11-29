import { Card } from "../ui/card";
import { TrendingUp } from "lucide-react";

interface EmptyStateProps {
  type: "weekly" | "monthly";
}

export function EmptyState({ type }: EmptyStateProps) {
  return (
    <Card
      className="p-8 text-center"
      style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
    >
      <TrendingUp
        className="w-12 h-12 mx-auto mb-3"
        style={{ color: "#E0E0E0" }}
      />
      <p style={{ color: "#4E4B46", fontSize: "0.95rem" }}>
        아직 {type === "weekly" ? "주간" : "월간"} 데이터가 존재하지 않습니다.
      </p>
      <p
        style={{
          color: "#4E4B46",
          opacity: 0.6,
          fontSize: "0.85rem",
          marginTop: "0.5rem",
        }}
      >
        일상 기록을 작성하면 자동으로 {type === "weekly" ? "주간" : "월간"}{" "}
        요약이 생성됩니다.
      </p>
    </Card>
  );
}
