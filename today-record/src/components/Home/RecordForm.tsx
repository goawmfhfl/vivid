import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord, type Record } from "../../hooks/useRecords";
import { RECORD_TYPES } from "../../constants";

interface RecordFormProps {
  onSuccess?: () => void;
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [selectedType, setSelectedType] = useState<Record["type"]>(
    RECORD_TYPES.INSIGHT
  );
  const [content, setContent] = useState("");
  const createRecordMutation = useCreateRecord();

  const getTypeLabel = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "인사이트";
      case RECORD_TYPES.FEEDBACK:
        return "피드백";
      case RECORD_TYPES.VISUALIZING:
        return "시각화";
    }
  };

  const getTypeColor = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "#A8BBA8";
      case RECORD_TYPES.FEEDBACK:
        return "#A3BFD9";
      case RECORD_TYPES.VISUALIZING:
        return "#8FA894";
    }
  };

  const getPlaceholder = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "오늘의 인사이트를 기록하세요...";
      case RECORD_TYPES.FEEDBACK:
        return "오늘의 피드백을 기록하세요...";
      case RECORD_TYPES.VISUALIZING:
        return "오늘의 시각화를 기록하세요...";
    }
  };

  const handleSubmit = () => {
    if (content.trim()) {
      createRecordMutation.mutate(
        { type: selectedType, content },
        {
          onSuccess: () => {
            setContent("");
            onSuccess?.();
          },
          onError: (error) => {
            console.error("기록 생성 실패:", error.message);
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="mb-6 p-5 rounded-2xl"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      <div className="flex gap-2 mb-4">
        {(
          [
            RECORD_TYPES.INSIGHT,
            RECORD_TYPES.FEEDBACK,
            RECORD_TYPES.VISUALIZING,
          ] as const
        ).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className="px-3 py-1.5 rounded-full transition-all text-sm"
            style={{
              backgroundColor:
                selectedType === type ? getTypeColor(type) : "transparent",
              color: selectedType === type ? "white" : "#4E4B46",
              border: selectedType === type ? "none" : "1px solid #E5E7EB",
            }}
          >
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder(selectedType)}
        className="min-h-[100px] mb-3 resize-none text-sm focus:outline-none focus:ring-0"
        style={{
          backgroundColor: "white",
          color: "#333333",
          lineHeight: "1.6",
          border: `1px solid ${getTypeColor(selectedType)}`,
          borderRadius: "0.5rem",
        }}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || createRecordMutation.isPending}
          size="sm"
          style={{
            backgroundColor: getTypeColor(selectedType),
            color: "white",
          }}
          className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
        </Button>
      </div>
    </div>
  );
}
