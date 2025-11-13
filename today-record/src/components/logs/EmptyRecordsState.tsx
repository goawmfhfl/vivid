import { Card } from "../ui/card";
import { FileText } from "lucide-react";

export function EmptyRecordsState() {
  return (
    <Card
      className="p-8 text-center"
      style={{
        backgroundColor: "white",
        border: "1px solid #EFE9E3",
        borderRadius: "16px",
      }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#F8F9FA" }}
        >
          <FileText className="w-8 h-8" style={{ color: "#6B7A6F" }} />
        </div>
        <h3
          style={{
            color: "#333333",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        >
          기록이 없습니다
        </h3>
      </div>
    </Card>
  );
}
