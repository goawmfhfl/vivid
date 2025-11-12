import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";

interface RecordFormProps {
  onSuccess?: () => void;
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [content, setContent] = useState("");
  const createRecordMutation = useCreateRecord();

  const handleSubmit = () => {
    if (content.trim()) {
      createRecordMutation.mutate(
        { content },
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
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="오늘의 기록을 자유롭게 작성하세요..."
        className="min-h-[100px] mb-3 resize-none text-sm focus:outline-none focus:ring-0"
        style={{
          backgroundColor: "white",
          color: "#333333",
          lineHeight: "1.6",
          border: "1px solid #E5E7EB",
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
                : "#6B7A6F",
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
