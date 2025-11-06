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
        return "#E5B96B";
    }
  };

  const getButtonColor = (type: Record["type"]) => {
    switch (type) {
      case RECORD_TYPES.INSIGHT:
        return "#8FA894"; // 더 진한 녹색
      case RECORD_TYPES.FEEDBACK:
        return "#7FA8C9"; // 더 진한 파란색
      case RECORD_TYPES.VISUALIZING:
        return "#D4A574"; // 더 진한 골든 옐로우
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
          style={{
            backgroundColor:
              !content.trim() || createRecordMutation.isPending
                ? "#D1D5DB"
                : getButtonColor(selectedType),
            color: "#FFFFFF",
            fontWeight: "600",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.5rem",
            transition: "all 0.2s ease-in-out",
            boxShadow:
              !content.trim() || createRecordMutation.isPending
                ? "none"
                : "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          className="hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="w-4 h-4 mr-2" />
          {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
        </Button>
      </div>
    </div>
  );
}
