import { useState, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";

interface RecordFormProps {
  onSuccess?: () => void;
}

const STORAGE_KEY = "record-form-draft";

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createRecordMutation = useCreateRecord();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage에서 초기값 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        setContent(savedContent);
      }
    }
  }, []);

  // localStorage에 저장하는 함수 (debounce 적용)
  const saveToLocalStorage = useCallback((value: string) => {
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // debounce된 저장 함수
  const debouncedSave = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveToLocalStorage(value);
      }, 500); // 500ms debounce
    },
    [saveToLocalStorage]
  );

  // 페이지를 떠날 때 저장 (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (content.trim()) {
        saveToLocalStorage(content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [content, saveToLocalStorage]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // textarea 높이 자동 조정
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 100), 300);
      textarea.style.height = `${newHeight}px`;

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
            // localStorage에서도 삭제
            if (typeof window !== "undefined") {
              localStorage.removeItem(STORAGE_KEY);
            }
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

  // content 변경 시 localStorage에 저장
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent);
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
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        placeholder="오늘의 기록을 자유롭게 작성하세요..."
        className="mb-3 resize-none focus:outline-none focus:ring-0"
        style={{
          backgroundColor: "white",
          color: "#333333",
          fontSize: "16px", // iOS 자동 줌 방지: 최소 16px
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
