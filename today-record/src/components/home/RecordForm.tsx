import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";

interface RecordFormProps {
  onSuccess?: () => void;
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createRecordMutation = useCreateRecord();

  // textarea 높이 자동 조정
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 높이를 초기화하여 정확한 scrollHeight 계산
      textarea.style.height = "auto";
      // scrollHeight에 맞춰 높이 조정 (최소 100px, 최대 300px)
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 100), 300);
      textarea.style.height = `${newHeight}px`;

      // 최대 높이에 도달했을 때만 스크롤 활성화
      if (scrollHeight > 300) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim()) {
      createRecordMutation.mutate(
        { content },
        {
          onSuccess: () => {
            setContent("");
            // textarea 높이 초기화
            if (textareaRef.current) {
              textareaRef.current.style.height = "100px";
            }
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
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="오늘의 기록을 자유롭게 작성하세요..."
        className="mb-3 resize-none text-sm focus:outline-none focus:ring-0"
        style={{
          backgroundColor: "white",
          color: "#333333",
          lineHeight: "1.6",
          border: "1px solid #E5E7EB",
          borderRadius: "0.5rem",
          minHeight: "100px",
          maxHeight: "300px",
          transition: "height 0.1s ease-out",
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
