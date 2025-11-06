import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { type Record } from "../../hooks/useRecords";

interface RecordItemProps {
  record: Record;
  onEdit: (record: Record) => void;
  onDelete: (id: number) => void;
}

export function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
  const getTypeLabel = (type: Record["type"]) => {
    switch (type) {
      case "insight":
        return "인사이트";
      case "feedback":
        return "피드백";
      case "visualizing":
        return "시각화";
    }
  };

  const getTypeColor = (type: Record["type"]) => {
    switch (type) {
      case "insight":
        return "#A8BBA8";
      case "feedback":
        return "#A3BFD9";
      case "visualizing":
        return "#8FA894";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? "오전" : "오후";
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: "white",
        border: "1px solid #EFE9E3",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            style={{
              backgroundColor: getTypeColor(record.type),
              color: "white",
              fontSize: "0.75rem",
              padding: "0.25rem 0.75rem",
            }}
          >
            {getTypeLabel(record.type)}
          </Badge>
          <span
            style={{
              color: "#4E4B46",
              opacity: 0.5,
              fontSize: "0.8rem",
            }}
          >
            {formatTime(record.created_at)}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" style={{ color: "#6B7A6F" }}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(record)}>
              <Pencil className="w-4 h-4 mr-2" />
              수정하기
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(record.id)}
              style={{ color: "#B1736C" }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제하기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        style={{
          color: "#333333",
          lineHeight: "1.6",
          fontSize: "0.95rem",
        }}
      >
        {record.content}
      </p>
    </div>
  );
}
