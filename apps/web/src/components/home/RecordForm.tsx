import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";
import { COLORS, TYPOGRAPHY, SPACING, CARD_STYLES } from "@/lib/design-system";
import { getKSTDateString } from "@/lib/date-utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  RECORD_TYPES,
  RECORD_TYPE_COLORS,
  type RecordType,
} from "../signup/RecordTypeCard";

interface RecordFormProps {
  onSuccess?: () => void;
  selectedDate?: string; // YYYY-MM-DD
}

const STORAGE_KEY = "record-form-draft";

export function RecordForm({ onSuccess, selectedDate }: RecordFormProps) {
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createRecordMutation = useCreateRecord();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { data: currentUser } = useCurrentUser();

  // 날짜 상태 계산
  const todayIso = getKSTDateString();
  const targetDateIso = selectedDate || todayIso;
  const isFuture = targetDateIso > todayIso;

  // 사용자의 recordTypes 가져오기 및 첫 번째 타입을 기본값으로 설정
  useEffect(() => {
    if (currentUser?.user_metadata?.recordTypes) {
      const recordTypes = currentUser.user_metadata.recordTypes as string[];
      if (recordTypes.length > 0 && !selectedType) {
        setSelectedType(recordTypes[0] as RecordType);
      }
    } else if (!selectedType) {
      // recordTypes가 없으면 기본값으로 "daily" 설정
      setSelectedType("daily");
    }
  }, [currentUser, selectedType]);

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
      const newHeight = Math.max(scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [content]);

  const handleSubmit = () => {
    if (isFuture) return;
    // selectedType이 없으면 기본값 "daily" 사용
    const recordType = selectedType || "daily";
    if (content.trim()) {
      createRecordMutation.mutate(
        {
          content,
          type: recordType,
          ...(selectedDate && { kst_date: selectedDate }),
        },
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

  const recordType = selectedType || "daily";
  const typeColors = RECORD_TYPE_COLORS[recordType];
  const availableTypes = (currentUser?.user_metadata?.recordTypes as
    | string[]
    | undefined) || ["daily"]; // 기본값으로 "daily" 포함

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        showTypeSelector &&
        !target.closest("[data-type-selector]") &&
        !target.closest("[data-type-label]")
      ) {
        setShowTypeSelector(false);
      }
    };

    if (showTypeSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showTypeSelector]);

  if (isFuture) {
    return (
      <div className="mb-6">
        <div
          className={`${SPACING.card.padding}`}
          style={{
            ...CARD_STYLES.default,
            border: `1.5px solid ${COLORS.border.card}`,
            backgroundColor: COLORS.background.card,
            borderRadius: "12px",
          }}
        >
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}
          >
            미래 날짜에는 기록을 작성할 수 없습니다. 오늘 또는 지난 날짜를
            선택해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* 모던한 타입 라벨 - 텍스트에어리어 위쪽 */}
      {recordType && (
        <div className="mb-3 flex justify-end relative">
          <div
            data-type-label
            className="cursor-pointer inline-flex relative overflow-hidden"
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            style={{
              backgroundColor: typeColors.background,
              padding: "0.375rem 0.75rem",
              borderRadius: "20px",
              boxShadow: `
                0 1px 3px rgba(0,0,0,0.08),
                0 1px 2px rgba(0,0,0,0.04),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              border: `1px solid ${typeColors.border}`,
              transition: "all 0.2s ease",
              // 종이 질감 배경 패턴
              backgroundImage: `
                /* 가로 줄무늬 (타입별 색상) */
                repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 27px,
                  ${typeColors.lineColor} 27px,
                  ${typeColors.lineColor} 28px
                ),
                /* 종이 텍스처 노이즈 */
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(107, 122, 111, 0.01) 2px,
                  rgba(107, 122, 111, 0.01) 4px
                )
              `,
              backgroundSize: "100% 28px, 8px 8px",
              backgroundPosition: "0 2px, 0 0",
              filter: "contrast(1.02) brightness(1.01)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                0 2px 6px rgba(0,0,0,0.12),
                0 1px 3px rgba(0,0,0,0.06),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                0 1px 3px rgba(0,0,0,0.08),
                0 1px 2px rgba(0,0,0,0.04),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* 종이 질감 오버레이 */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[20px]"
              style={{
                background: `
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                  radial-gradient(circle at 75% 75%, ${typeColors.overlay} 0%, transparent 40%)
                `,
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            />
            <div className="relative z-10 flex items-center gap-1.5">
              <span style={{ fontSize: "0.875rem" }}>
                {RECORD_TYPES.find((t) => t.id === recordType)?.icon}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: COLORS.text.secondary,
                  letterSpacing: "0.01em",
                }}
              >
                {RECORD_TYPES.find((t) => t.id === recordType)?.title}
              </span>
              <ChevronDown
                className="w-3 h-3"
                style={{
                  color: COLORS.text.tertiary,
                  transform: showTypeSelector
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>

          {/* 타입 선택 드롭다운 */}
          {showTypeSelector && availableTypes.length > 0 && (
            <div
              data-type-selector
              className="absolute z-30 overflow-hidden"
              style={{
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                backgroundColor: COLORS.background.base,
                borderRadius: "12px",
                boxShadow: `
                  0 4px 16px rgba(0,0,0,0.12),
                  0 2px 8px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                border: `1px solid ${COLORS.border.light}`,
                padding: "0.375rem",
                minWidth: "160px",
                // 종이 질감 배경 패턴
                backgroundImage: `
                  /* 가로 줄무늬 */
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 27px,
                    rgba(107, 122, 111, 0.08) 27px,
                    rgba(107, 122, 111, 0.08) 28px
                  ),
                  /* 종이 텍스처 노이즈 */
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(107, 122, 111, 0.01) 2px,
                    rgba(107, 122, 111, 0.01) 4px
                  )
                `,
                backgroundSize: "100% 28px, 8px 8px",
                backgroundPosition: "0 2px, 0 0",
                filter: "contrast(1.02) brightness(1.01)",
              }}
            >
              {/* 종이 질감 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
                  `,
                  mixBlendMode: "overlay",
                  opacity: 0.5,
                }}
              />
              <div className="relative z-10">
                {availableTypes.map((typeId) => {
                  const type = RECORD_TYPES.find((t) => t.id === typeId);
                  if (!type) return null;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.id);
                        setShowTypeSelector(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{
                        backgroundColor:
                          recordType === type.id
                            ? `${RECORD_TYPE_COLORS[type.id].overlay}40`
                            : "transparent",
                        border:
                          recordType === type.id
                            ? `1px solid ${RECORD_TYPE_COLORS[type.id].border}`
                            : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (recordType !== type.id) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.background.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (recordType !== type.id) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span style={{ fontSize: "0.875rem" }}>{type.icon}</span>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: COLORS.text.primary,
                          fontWeight: recordType === type.id ? "500" : "400",
                        }}
                      >
                        {type.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 텍스트에어리어 컨테이너 */}
      <div
        className={`${SPACING.card.padding} ${CARD_STYLES.hover.transition} relative`}
        style={{
          backgroundColor: typeColors.background,
          border: `1.5px solid ${typeColors.border}`,
          borderRadius: "12px",
          boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
          position: "relative",
          overflow: "hidden",
          paddingLeft: "48px", // 왼쪽 마진 라인을 위한 패딩
          // 종이 질감 배경 패턴
          backgroundImage: `
          /* 왼쪽 마진 라인 */
          linear-gradient(90deg, 
            transparent 0px,
            transparent 36px,
            ${COLORS.border.card} 36px,
            ${COLORS.border.card} 38px,
            transparent 38px
          ),
          /* 가로 줄무늬 (타입별 색상) */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            ${typeColors.lineColor} 27px,
            ${typeColors.lineColor} 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
          backgroundSize: "100% 100%, 100% 28px, 8px 8px",
          backgroundPosition: "0 0, 0 2px, 0 0", // 줄무늬를 텍스트와 정렬
          // 종이 질감을 위한 필터
          filter: "contrast(1.02) brightness(1.01)",
        }}
      >
        {/* 왼쪽 마진 라인 (프로젝트 색감) */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: "2px",
            backgroundColor: `${COLORS.border.card}CC`, // 프로젝트 border.card 색상 사용
            left: "36px",
          }}
        />

        {/* 종이 질감 오버레이 (타입별 색상) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${typeColors.overlay} 0%, transparent 40%)
          `,
            mixBlendMode: "overlay",
            opacity: 0.5,
          }}
        />

        {/* 내용 영역 */}
        <div className="relative z-10">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="오늘의 기록을 자유롭게 작성하세요..."
            className="mb-3 resize-none focus:outline-none focus:ring-0 border-0 bg-transparent"
            style={{
              backgroundColor: "transparent",
              color: COLORS.text.primary,
              fontSize: "16px", // iOS 자동 줌 방지: 최소 16px
              lineHeight: "28px", // 줄무늬 간격(28px)과 일치
              minHeight: "100px",
              transition: "height 0.1s ease-out",
              padding: 0,
              paddingTop: "2px", // 줄무늬와 정렬을 위한 미세 조정
              boxShadow: "none",
            }}
          />

          <div className="flex items-center justify-between mb-3">
            {/* 글자 수 표시 */}
            <span
              className={TYPOGRAPHY.caption.fontSize}
              style={{
                color: COLORS.text.muted,
                opacity: content.length > 0 ? 0.6 : 0.3,
                fontSize: "0.75rem",
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              {content.length}자
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || createRecordMutation.isPending}
              style={{
                backgroundColor:
                  !content.trim() || createRecordMutation.isPending
                    ? "#D1D5DB"
                    : COLORS.brand.primary,
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
      </div>
    </div>
  );
}
