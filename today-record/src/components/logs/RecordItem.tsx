import { Card } from "../ui/card";
import type { Record } from "@/hooks/useRecords";

interface RecordItemProps {
  record: Record;
}

export function RecordItem({ record }: RecordItemProps) {
  const timeString = new Date(record.created_at).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="p-4"
      style={{
        backgroundColor: "white",
        border: "1px solid #EFE9E3",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              style={{ color: "#4E4B46", opacity: 0.6, fontSize: "0.85rem" }}
            >
              {timeString}
            </span>
          </div>
          <p
            style={{
              color: "#333333",
              lineHeight: "1.6",
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {record.content}
          </p>
        </div>
      </div>
    </Card>
  );
}
