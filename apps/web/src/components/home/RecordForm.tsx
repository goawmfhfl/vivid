import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Lock, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";
import { COLORS, TYPOGRAPHY, SPACING, CARD_STYLES, SHADOWS, GRADIENT_UTILS, FONTS } from "@/lib/design-system";
import { getKSTDateString } from "@/lib/date-utils";
import { useSubscription } from "@/hooks/useSubscription";
import {
  RECORD_TYPES,
  type RecordType,
} from "../signup/RecordTypeCard";
import { Timer } from "./Timer";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { ReviewGuidePanel } from "./ReviewGuidePanel";
import { TodoGuidePanel } from "./TodoGuidePanel";
import { useGetDailyVivid } from "@/hooks/useGetDailyVivid";
import {
  useCreateTodoList,
  useAddTodoItem,
  useReorderTodoItems,
  OPTIMISTIC_ID_PREFIX,
} from "@/hooks/useTodoList";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TodoItemRow } from "./TodoItemRow";
import { motion } from "framer-motion";

export type HomeTabType = "vivid" | "review" | "todo";

interface RecordFormProps {
  onSuccess?: () => void;
  selectedDate?: string; // YYYY-MM-DD
  onTypeChange?: (type: RecordType | null) => void;
  onTabChange?: (tab: HomeTabType) => void;
  initialType?: RecordType | null;
  activeTab?: HomeTabType;
}

const STORAGE_KEY = "record-form-draft";
const STORAGE_KEY_Q1 = "record-form-draft-q1";
const STORAGE_KEY_Q2 = "record-form-draft-q2";
const STORAGE_KEY_Q3 = "record-form-draft-q3";

export function RecordForm({
  onSuccess,
  selectedDate,
  onTypeChange,
  onTabChange,
  initialType,
  activeTab: activeTabProp,
}: RecordFormProps) {
  const [content, setContent] = useState("");
  const [q1Content, setQ1Content] = useState("");
  const [q2Content, setQ2Content] = useState("");
  const [q3Content, setQ3Content] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [internalTab, setInternalTab] = useState<HomeTabType>("vivid");
  const [showReviewGuidePanel, setShowReviewGuidePanel] = useState(false);
  const [showTodoGuidePanel, setShowTodoGuidePanel] = useState(false);
  const activeTab = activeTabProp ?? internalTab;
  const [newTodoContents, setNewTodoContents] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const q1TextareaRef = useRef<HTMLTextAreaElement>(null);
  const q2TextareaRef = useRef<HTMLTextAreaElement>(null);
  const q3TextareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAppliedInitialTypeRef = useRef(false);
  const createRecordMutation = useCreateRecord();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isUserScrollingRef = useRef(false);
  /** Q3 텍스트 입력/높이 변경 시 스크롤 복원 중일 때, 스크롤 리스너가 scrollPositionRef를 덮어쓰지 않도록 함 */
  const isQ3RestoringScrollRef = useRef(false);
  /** Q3 입력 직전 스크롤 위치. effect에서는 reflow 후 잘못된 값을 캡처하므로, 복원 시 이 값만 사용 */
  const lastQ3ScrollBeforeChangeRef = useRef<{ x: number; y: number } | null>(null);
  const router = useRouter();
  const { subscription } = useSubscription();
  const { state: timerState } = useTimer();
  const { showToast } = useToast();

  // 날짜 상태 계산
  const todayIso = getKSTDateString();
  const targetDateIso = selectedDate || todayIso;

  // 회고·할 일 탭에서 오늘의 비비드 조회 (할 일 목록용)
  const vividDate =
    (selectedType === "review" || activeTab === "todo") && targetDateIso
      ? targetDateIso
      : "";
  const { data: vividFeedback } = useGetDailyVivid(vividDate, "vivid");
  const createTodoList = useCreateTodoList(targetDateIso || "");
  const addTodoItem = useAddTodoItem(targetDateIso || "");
  const reorderTodoItems = useReorderTodoItems(targetDateIso || "");

  // 롱프레스(250ms) 후에만 드래그 시작 - 모바일 스크롤 시 오동작 방지
  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 사용 가능한 기록 타입 가져오기 (비비드, 회고 모두 모든 멤버 사용 가능)
  const getRecordTypeOptions = useCallback(() => {
    const allowedTypes: RecordType[] = ["dream", "review"];
    const displayTypes: RecordType[] = [...allowedTypes];
    return { allowedTypes, displayTypes };
  }, []);

  // 첫 번째 타입을 기본값으로 설정
  useEffect(() => {
    const { allowedTypes } = getRecordTypeOptions();
    if (!hasAppliedInitialTypeRef.current) {
      if (initialType && allowedTypes.includes(initialType)) {
        setSelectedType(initialType);
        setInternalTab(initialType === "review" ? "review" : "vivid");
        hasAppliedInitialTypeRef.current = true;
        return;
      }

      if (allowedTypes.length > 0 && !selectedType) {
        const defaultType = allowedTypes[0] as RecordType;
        setSelectedType(defaultType);
        setInternalTab(defaultType === "review" ? "review" : "vivid");
        hasAppliedInitialTypeRef.current = true;
        return;
      }
    }

    if (selectedType && !allowedTypes.includes(selectedType)) {
      const fallback = allowedTypes[0] as RecordType;
      setSelectedType(fallback);
      setInternalTab(fallback === "review" ? "review" : "vivid");
    }
  }, [getRecordTypeOptions, selectedType, initialType]);

  // 부모에서 activeTab 제어 시 internalTab 동기화
  useEffect(() => {
    if (activeTabProp != null) {
      setInternalTab(activeTabProp);
      if (activeTabProp === "vivid") setSelectedType("dream");
      else if (activeTabProp === "review") setSelectedType("review");
    }
  }, [activeTabProp]);

  // 할 일 탭에서는 onTypeChange 호출 안 함 (URL이 type=review로 덮어쓰이는 것 방지)
  useEffect(() => {
    if (activeTab !== "todo") {
      onTypeChange?.(selectedType);
    }
  }, [onTypeChange, selectedType, activeTab]);

  // localStorage에서 초기값 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        setContent(savedContent);
      }
      const savedQ1 = localStorage.getItem(STORAGE_KEY_Q1);
      if (savedQ1) {
        setQ1Content(savedQ1);
      }
      const savedQ2 = localStorage.getItem(STORAGE_KEY_Q2);
      if (savedQ2) {
        setQ2Content(savedQ2);
      }
      const savedQ3 = localStorage.getItem(STORAGE_KEY_Q3);
      if (savedQ3) {
        setQ3Content(savedQ3);
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

  const saveQ1ToLocalStorage = useCallback((value: string) => {
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem(STORAGE_KEY_Q1, value);
      } else {
        localStorage.removeItem(STORAGE_KEY_Q1);
      }
    }
  }, []);

  const saveQ2ToLocalStorage = useCallback((value: string) => {
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem(STORAGE_KEY_Q2, value);
      } else {
        localStorage.removeItem(STORAGE_KEY_Q2);
      }
    }
  }, []);

  const saveQ3ToLocalStorage = useCallback((value: string) => {
    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem(STORAGE_KEY_Q3, value);
      } else {
        localStorage.removeItem(STORAGE_KEY_Q3);
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

  const debouncedSaveQ1 = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveQ1ToLocalStorage(value);
      }, 500);
    },
    [saveQ1ToLocalStorage]
  );

  const debouncedSaveQ2 = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveQ2ToLocalStorage(value);
      }, 500);
    },
    [saveQ2ToLocalStorage]
  );

  const debouncedSaveQ3 = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        saveQ3ToLocalStorage(value);
      }, 500);
    },
    [saveQ3ToLocalStorage]
  );

  // 페이지를 떠날 때 저장 (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (content.trim()) {
        saveToLocalStorage(content);
      }
      if (q1Content.trim()) {
        saveQ1ToLocalStorage(q1Content);
      }
      if (q2Content.trim()) {
        saveQ2ToLocalStorage(q2Content);
      }
      if (q3Content.trim()) {
        saveQ3ToLocalStorage(q3Content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    content,
    q1Content,
    q2Content,
    q3Content,
    saveToLocalStorage,
    saveQ1ToLocalStorage,
    saveQ2ToLocalStorage,
    saveQ3ToLocalStorage,
  ]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 사용자 스크롤 감지
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isQ3RestoringScrollRef.current) return;
      isUserScrollingRef.current = true;
      scrollPositionRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // DOM 변경 감지하여 자동 스크롤 방지
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const observer = new MutationObserver(() => {
      // DOM이 변경되었을 때 스크롤 위치 복원
      if (scrollPositionRef.current && !isUserScrollingRef.current) {
        requestAnimationFrame(() => {
          if (scrollPositionRef.current) {
            window.scrollTo(
              scrollPositionRef.current.x,
              scrollPositionRef.current.y
            );
          }
        });
      }
    });

    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ["style"],
      childList: false,
      subtree: false,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // textarea 높이 자동 조정
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && !isUserScrollingRef.current) {
      // 스크롤 위치 저장
      scrollPositionRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "hidden";

      // 스크롤 위치 복원 (여러 프레임에 걸쳐 시도)
      if (scrollPositionRef.current) {
        requestAnimationFrame(() => {
          if (scrollPositionRef.current) {
            window.scrollTo(
              scrollPositionRef.current.x,
              scrollPositionRef.current.y
            );
          }
        });
        // 추가 보정을 위해 한 번 더 시도
        setTimeout(() => {
          if (scrollPositionRef.current) {
            window.scrollTo(
              scrollPositionRef.current.x,
              scrollPositionRef.current.y
            );
          }
        }, 0);
      }
    }
  }, [content]);

  // q1 textarea 높이 자동 조정
  useEffect(() => {
    const textarea = q1TextareaRef.current;
    if (textarea && !isUserScrollingRef.current) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [q1Content]);

  // q2 textarea 높이 자동 조정
  useEffect(() => {
    const textarea = q2TextareaRef.current;
    if (textarea && !isUserScrollingRef.current) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [q2Content]);

  // q3 textarea 높이 자동 조정 (스크롤 위치 유지)
  // effect 실행 시점에는 이미 reflow로 스크롤이 틀어져 있을 수 있으므로, 복원은 handleQ3Change에서 저장한 값만 사용
  useEffect(() => {
    const textarea = q3TextareaRef.current;
    if (!textarea || isUserScrollingRef.current) return;

    const pos = lastQ3ScrollBeforeChangeRef.current;
    isQ3RestoringScrollRef.current = true;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(scrollHeight, 100);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = "hidden";

    if (pos) {
      const restore = () => window.scrollTo(pos.x, pos.y);
      requestAnimationFrame(restore);
      restore();
      lastQ3ScrollBeforeChangeRef.current = null;
      isQ3RestoringScrollRef.current = false;
    } else {
      isQ3RestoringScrollRef.current = false;
    }
  }, [q3Content]);

  const handleSubmit = () => {
    const { allowedTypes } = getRecordTypeOptions();
    const recordType = selectedType || allowedTypes[0] || "dream";

    if (recordType === "review") {
      if (q3Content.trim()) {
        const formattedContent = `Q3. 오늘의 나는 어떤 하루를 보냈을까?\n\n${q3Content.trim()}`;
        createRecordMutation.mutate(
          {
            content: formattedContent,
            type: recordType,
            ...(selectedDate && { kst_date: selectedDate }),
          },
          {
            onSuccess: () => {
              setQ3Content("");
              if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY_Q3);
              }
              onSuccess?.();
            },
            onError: () => {
              showToast("기록 저장에 실패했어요. 다시 시도해주세요.");
            },
          }
        );
      }
      return;
    }

    // dream 타입일 때는 2개의 질문을 포맷팅해서 합치기
    if (recordType === "dream") {
      if (q1Content.trim() || q2Content.trim()) {
        // Q1과 Q2 중 내용이 있는 것만 포함
        const parts: string[] = [];
        
        if (q1Content.trim()) {
          parts.push(`Q1. 오늘 하루를 어떻게 보낼까?\n${q1Content.trim()}`);
        }
        
        if (q2Content.trim()) {
          parts.push(`Q2. 앞으로의 나는 어떤 모습일까?\n${q2Content.trim()}`);
        }
        
        const formattedContent = parts.join("\n\n");
        
        createRecordMutation.mutate(
          {
            content: formattedContent,
            type: recordType,
            ...(selectedDate && { kst_date: selectedDate }),
          },
          {
            onSuccess: () => {
              setQ1Content("");
              setQ2Content("");
              // localStorage에서도 삭제
              if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY_Q1);
                localStorage.removeItem(STORAGE_KEY_Q2);
              }
              // textarea 높이 초기화
              if (q1TextareaRef.current) {
                q1TextareaRef.current.style.height = "100px";
              }
              if (q2TextareaRef.current) {
                q2TextareaRef.current.style.height = "100px";
              }
              onSuccess?.();
            },
            onError: (error) => {
              console.error("기록 생성 실패:", error.message);
            },
          }
        );
      }
    } else {
      // 다른 타입은 기존 로직
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
    }
  };

  // content 변경 시 localStorage에 저장
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 스크롤 위치 저장
    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent);

    // 스크롤 위치 복원
    requestAnimationFrame(() => {
      if (scrollPositionRef.current) {
        window.scrollTo(
          scrollPositionRef.current.x,
          scrollPositionRef.current.y
        );
      }
    });
  };

  const handleQ1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setQ1Content(newContent);
    debouncedSaveQ1(newContent);
  };

  const handleQ2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setQ2Content(newContent);
    debouncedSaveQ2(newContent);
  };

  const handleQ3Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    lastQ3ScrollBeforeChangeRef.current = { x: scrollX, y: scrollY };
    scrollPositionRef.current = { x: scrollX, y: scrollY };
    const newContent = e.target.value;
    setQ3Content(newContent);
    debouncedSaveQ3(newContent);
    requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // focus 시 자동 스크롤 방지
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // 스크롤 위치 저장
    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    // scrollIntoView 오버라이드
    const textarea = e.target;
    const originalScrollIntoView = textarea.scrollIntoView;
    textarea.scrollIntoView = function (
      _options?: boolean | ScrollIntoViewOptions
    ) {
      // 아무것도 하지 않음 (스크롤 방지)
      return;
    };

    // 다음 프레임에서 스크롤 위치 복원 및 원래 메서드 복구
    requestAnimationFrame(() => {
      if (scrollPositionRef.current) {
        window.scrollTo(
          scrollPositionRef.current.x,
          scrollPositionRef.current.y
        );
      }
      textarea.scrollIntoView = originalScrollIntoView;
    });
  };

  // textarea의 scrollIntoView를 영구적으로 오버라이드
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // scrollIntoView 메서드를 오버라이드하여 스크롤을 방지
      const originalScrollIntoView = textarea.scrollIntoView.bind(textarea);
      textarea.scrollIntoView = function (
        _options?: boolean | ScrollIntoViewOptions
      ) {
        // 스크롤 방지
        return;
      };

      return () => {
        // cleanup 시 원래 메서드 복구
        if (textarea) {
          textarea.scrollIntoView = originalScrollIntoView;
        }
      };
    }
  }, []);

  const { allowedTypes } = getRecordTypeOptions();
  const recordType = selectedType || allowedTypes[0] || "dream";

  // q3 textarea의 scrollIntoView 영구 오버라이드 (스크롤 점프 방지, 회고 탭 마운트 시 적용)
  useEffect(() => {
    const textarea = q3TextareaRef.current;
    if (textarea) {
      const originalScrollIntoView = textarea.scrollIntoView.bind(textarea);
      textarea.scrollIntoView = function (
        _options?: boolean | ScrollIntoViewOptions
      ) {
        return;
      };
      return () => {
        if (textarea) {
          textarea.scrollIntoView = originalScrollIntoView;
        }
      };
    }
  }, [recordType]);

  // q3 textarea style 변경 시 스크롤 복원 (높이 증가로 reflow 시 페이지 스크롤 유지)
  // Q3 입력 직전 위치(lastQ3ScrollBeforeChangeRef) 우선 사용, 없을 때만 scrollPositionRef 사용
  useEffect(() => {
    const textarea = q3TextareaRef.current;
    if (!textarea) return;
    const observer = new MutationObserver(() => {
      if (isUserScrollingRef.current) return;
      const pos = lastQ3ScrollBeforeChangeRef.current ?? scrollPositionRef.current;
      if (pos) {
        requestAnimationFrame(() => {
          window.scrollTo(pos.x, pos.y);
        });
      }
    });
    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ["style"],
      childList: false,
      subtree: false,
    });
    return () => observer.disconnect();
  }, [recordType]);

  // 프로젝트 기본 색상 (타입별 색상 변경 없이 고정)
  const defaultColors = {
    background: COLORS.background.card,
    border: COLORS.border.light,
    lineColor: "rgba(196, 190, 178, 0.12)", // border.card 기반
    overlay: "rgba(127, 143, 122, 0.08)", // primary.500 기반
  };

  const handleTabClick = useCallback(
    (tab: HomeTabType) => {
      setInternalTab(tab);
      onTabChange?.(tab);
      if (tab === "vivid") {
        setSelectedType("dream");
        onTypeChange?.("dream");
      } else if (tab === "review") {
        setSelectedType("review");
        onTypeChange?.("review");
      }
    },
    [onTabChange, onTypeChange]
  );

  return (
    <>
      {/* Sticky 타이머 바 (타이머 실행 중일 때만 표시) */}
      {timerState.isRunning && recordType && (
        <div
          className="sticky top-0 z-50 mb-3"
          style={{
            backgroundColor: COLORS.background.base,
            paddingTop: "1rem",
            paddingBottom: "0.75rem",
            marginTop: "-1rem",
            marginLeft: "-1rem",
            marginRight: "-1rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            marginBottom: "0.75rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            borderBottom: `1px solid ${COLORS.border.light}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex justify-between items-center">
            <Timer />
            <div style={{ width: "1px" }} /> {/* 타입 선택 버튼 공간 확보 */}
          </div>
        </div>
      )}

      <div className="mb-6">
        {/* 비비드 | 회고 | 할 일 3탭 - 물결 인디케이터 */}
        {!timerState.isRunning && (
          <div className="mb-3 flex justify-between items-center gap-2">
            <Timer />
            <div
              className="relative flex rounded-full p-1"
              style={{
                backgroundColor: COLORS.background.hover,
                border: `1px solid ${COLORS.border.light}`,
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {(
                [
                  { id: "vivid" as const, label: "VIVID", locked: false },
                  { id: "review" as const, label: "회고", locked: false },
                  { id: "todo" as const, label: "할 일", locked: false },
                ] as const
              ).map(({ id, label, locked }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  className="relative flex-1 min-w-0 px-3 py-1.5 text-center flex items-center justify-center gap-1 z-10 transition-colors duration-200"
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: activeTab === id ? "600" : "500",
                    color: activeTab === id ? COLORS.text.primary : COLORS.text.tertiary,
                  }}
                >
                  {label}
                  {locked && <Lock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: COLORS.text.tertiary }} />}
                </button>
              ))}
              {/* 물결처럼 흘러가는 선택 인디케이터 - 버튼과 정확히 정렬 */}
              <motion.div
                layoutId="tab-indicator"
                className="absolute top-1 bottom-1 rounded-full z-0"
                style={{
                  width: "calc((100% - 8px) / 3)",
                  left: `calc(4px + ${["vivid", "review", "todo"].indexOf(activeTab)} * (100% - 8px) / 3)`,
                  backgroundColor: COLORS.background.card,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
                  border: `1px solid ${COLORS.border.light}`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            </div>
          </div>
        )}

      {/* 비비드 탭: Q1, Q2만 */}
      {activeTab === "vivid" && recordType === "dream" ? (
        <>
          {/* Q1 입력 필드 */}
          <div className="mb-4">
            <div
              className={`${SPACING.card.padding} ${CARD_STYLES.hover.transition} relative`}
              style={{
                backgroundColor: defaultColors.background,
                border: `1.5px solid ${defaultColors.border}`,
                borderRadius: "12px",
                boxShadow: `
                  0 2px 8px rgba(0,0,0,0.04),
                  0 1px 3px rgba(0,0,0,0.02),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                position: "relative",
                overflow: "hidden",
                paddingLeft: "48px",
                backgroundImage: `
                  linear-gradient(90deg, 
                    transparent 0px,
                    transparent 36px,
                    ${COLORS.border.card} 36px,
                    ${COLORS.border.card} 38px,
                    transparent 38px
                  ),
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 27px,
                    ${defaultColors.lineColor} 27px,
                    ${defaultColors.lineColor} 28px
                  ),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(107, 122, 111, 0.01) 2px,
                    rgba(107, 122, 111, 0.01) 4px
                  )
                `,
                backgroundSize: "100% 100%, 100% 28px, 8px 8px",
                backgroundPosition: "0 0, 0 2px, 0 0",
                filter: "contrast(1.02) brightness(1.01)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: "2px",
                  backgroundColor: `${COLORS.border.card}CC`,
                  left: "36px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
                  `,
                  mixBlendMode: "overlay",
                  opacity: 0.5,
                }}
              />
              <div className="relative z-10">
                <div className="mb-2">
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: COLORS.text.primary,
                    }}
                  >
                    Q1. 오늘 하루를 어떻게 보낼까?
                  </span>
                </div>
                <Textarea
                  ref={q1TextareaRef}
                  value={q1Content}
                  onChange={handleQ1Change}
                  placeholder="답변을 입력하세요..."
                  className="mb-3 resize-none focus:outline-none focus:ring-0 border-0 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    color: COLORS.text.primary,
                    fontSize: "16px",
                    lineHeight: "28px",
                    minHeight: "100px",
                    transition: "height 0.1s ease-out",
                    padding: 0,
                    paddingTop: "2px",
                    boxShadow: "none",
                    scrollMargin: "0px",
                  }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={TYPOGRAPHY.caption.fontSize}
                    style={{
                      color: COLORS.text.muted,
                      opacity: q1Content.length > 0 ? 0.6 : 0.3,
                      fontSize: "0.75rem",
                    }}
                  >
                    {q1Content.length}자
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Q2 입력 필드 */}
          <div className="mb-4">
            <div
              className={`${SPACING.card.padding} ${CARD_STYLES.hover.transition} relative`}
              style={{
                backgroundColor: defaultColors.background,
                border: `1.5px solid ${defaultColors.border}`,
                borderRadius: "12px",
                boxShadow: `
                  0 2px 8px rgba(0,0,0,0.04),
                  0 1px 3px rgba(0,0,0,0.02),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                position: "relative",
                overflow: "hidden",
                paddingLeft: "48px",
                backgroundImage: `
                  linear-gradient(90deg, 
                    transparent 0px,
                    transparent 36px,
                    ${COLORS.border.card} 36px,
                    ${COLORS.border.card} 38px,
                    transparent 38px
                  ),
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 27px,
                    ${defaultColors.lineColor} 27px,
                    ${defaultColors.lineColor} 28px
                  ),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(107, 122, 111, 0.01) 2px,
                    rgba(107, 122, 111, 0.01) 4px
                  )
                `,
                backgroundSize: "100% 100%, 100% 28px, 8px 8px",
                backgroundPosition: "0 0, 0 2px, 0 0",
                filter: "contrast(1.02) brightness(1.01)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: "2px",
                  backgroundColor: `${COLORS.border.card}CC`,
                  left: "36px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
                  `,
                  mixBlendMode: "overlay",
                  opacity: 0.5,
                }}
              />
              <div className="relative z-10">
                <div className="mb-2">
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: COLORS.text.primary,
                    }}
                  >
                    Q2. 앞으로의 나는 어떤 모습일까?
                  </span>
                </div>
                <Textarea
                  ref={q2TextareaRef}
                  value={q2Content}
                  onChange={handleQ2Change}
                  placeholder="답변을 입력하세요..."
                  className="mb-3 resize-none focus:outline-none focus:ring-0 border-0 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    color: COLORS.text.primary,
                    fontSize: "16px",
                    lineHeight: "28px",
                    minHeight: "100px",
                    transition: "height 0.1s ease-out",
                    padding: 0,
                    paddingTop: "2px",
                    boxShadow: "none",
                    scrollMargin: "0px",
                  }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={TYPOGRAPHY.caption.fontSize}
                    style={{
                      color: COLORS.text.muted,
                      opacity: q2Content.length > 0 ? 0.6 : 0.3,
                      fontSize: "0.75rem",
                    }}
                  >
                    {q2Content.length}자
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={handleSubmit}
              disabled={(!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending}
              style={{
                background:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.08)
                    : COLORS.brand.primary,
                color:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? COLORS.text.tertiary
                    : COLORS.text.white,
                fontWeight: "600",
                padding: "0.625rem 1.5rem",
                borderRadius: "12px",
                border:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "25")}`
                    : `1.5px solid ${COLORS.brand.primary}`,
                boxShadow:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? SHADOWS.default
                    : SHADOWS.elevation2,
                transition: "all 0.2s ease-in-out",
              }}
              className="hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
            </Button>
          </div>
        </>
      ) : activeTab === "review" && recordType === "review" ? (
        <>
          {/* 회고 탭: Q3만 (할 일 없음) */}
          <div className="mb-4">
            <div
              className={`${SPACING.card.padding} ${CARD_STYLES.hover.transition} relative`}
              style={{
                backgroundColor: defaultColors.background,
                border: `1.5px solid ${defaultColors.border}`,
                borderRadius: "12px",
                boxShadow: `
                  0 2px 8px rgba(0,0,0,0.04),
                  0 1px 3px rgba(0,0,0,0.02),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                position: "relative",
                overflow: "hidden",
                paddingLeft: "48px",
                backgroundImage: `
                  linear-gradient(90deg, 
                    transparent 0px,
                    transparent 36px,
                    ${COLORS.border.card} 36px,
                    ${COLORS.border.card} 38px,
                    transparent 38px
                  ),
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent 27px,
                    ${defaultColors.lineColor} 27px,
                    ${defaultColors.lineColor} 28px
                  ),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(107, 122, 111, 0.01) 2px,
                    rgba(107, 122, 111, 0.01) 4px
                  )
                `,
                backgroundSize: "100% 100%, 100% 28px, 8px 8px",
                backgroundPosition: "0 0, 0 2px, 0 0",
                filter: "contrast(1.02) brightness(1.01)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: "2px",
                  backgroundColor: `${COLORS.border.card}CC`,
                  left: "36px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
                  `,
                  mixBlendMode: "overlay",
                  opacity: 0.5,
                }}
              />
              <div className="relative z-10">
                <div className="mb-2">
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: COLORS.text.primary,
                    }}
                  >
                    Q3. 오늘의 나는 어떤 하루를 보냈을까?
                  </span>
                </div>
                <Textarea
                  ref={q3TextareaRef}
                  value={q3Content}
                  onChange={handleQ3Change}
                  onFocus={handleFocus}
                  placeholder="답변을 입력하세요..."
                  className="mb-3 resize-none focus:outline-none focus:ring-0 border-0 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    color: COLORS.text.primary,
                    fontSize: "16px",
                    lineHeight: "28px",
                    minHeight: "100px",
                    transition: "height 0.1s ease-out",
                    padding: 0,
                    paddingTop: "2px",
                    boxShadow: "none",
                    scrollMargin: "0px",
                  }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={TYPOGRAPHY.caption.fontSize}
                    style={{
                      color: COLORS.text.muted,
                      opacity: q3Content.length > 0 ? 0.6 : 0.3,
                      fontSize: "0.75rem",
                    }}
                  >
                    {q3Content.length}자
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 + 가이드 (회고 탭: 기록 추가 왼쪽에 가이드 버튼) */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-6">
            <button
              type="button"
              onClick={() => setShowReviewGuidePanel(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
                border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
                color: COLORS.brand.primary,
                boxShadow: SHADOWS.default,
              }}
              aria-label="회고 가이드 보기"
              title="가이드"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <Button
              onClick={handleSubmit}
              disabled={!q3Content.trim() || createRecordMutation.isPending}
              style={{
                background:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.08)
                    : COLORS.brand.primary,
                color:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? COLORS.text.tertiary
                    : COLORS.text.white,
                fontWeight: "600",
                padding: "0.625rem 1.5rem",
                borderRadius: "12px",
                border:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "25")}`
                    : `1.5px solid ${COLORS.brand.primary}`,
                boxShadow:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? SHADOWS.default
                    : SHADOWS.elevation2,
                transition: "all 0.2s ease-in-out",
              }}
              className="hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
            </Button>
          </div>
          <ReviewGuidePanel
            open={showReviewGuidePanel}
            onClose={() => setShowReviewGuidePanel(false)}
          />
        </>
      ) : activeTab === "todo" ? (
        /* 할 일 탭: 할 일만 관리, 항상 펼쳐진 상태 */
        <div className="mb-4 space-y-2">
          {/* 오늘의 할 일 / 예정된 할 일 타이틀 + 가이드 버튼 (항상 표시) */}
          <div className="flex items-center justify-between gap-2 w-full">
            <span
              className="text-base font-semibold"
              style={{ color: COLORS.text.primary, fontSize: "0.875rem" }}
            >
              {targetDateIso && targetDateIso > todayIso
                ? "예정된 할 일"
                : "오늘의 할 일"}
            </span>
            <button
              type="button"
              onClick={() => setShowTodoGuidePanel(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
                border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
                color: COLORS.brand.primary,
                boxShadow: SHADOWS.default,
              }}
              aria-label="할 일 가이드 보기"
              title="가이드"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
          <TodoGuidePanel
            open={showTodoGuidePanel}
            onClose={() => setShowTodoGuidePanel(false)}
          />
          <>
            {!vividFeedback?.hasNativeTodoList &&
              (!targetDateIso || targetDateIso <= todayIso) && (
                <Button
                    type="button"
                    onClick={() =>
                      createTodoList.mutate(undefined, {
                        onError: (err) =>
                          showToast(
                            err instanceof Error ? err.message : "생성에 실패했어요."
                          ),
                      })
                    }
                    disabled={createTodoList.isPending}
                    className="w-full justify-center py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                    style={{
                      backgroundColor: COLORS.primary[600],
                      border: `2px solid ${COLORS.primary[600]}`,
                      color: COLORS.text.white,
                      fontWeight: "700",
                      fontSize: "0.9375rem",
                      boxShadow: SHADOWS.elevation2,
                    }}
                  >
                    {createTodoList.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      "오늘의 할 일 생성하기"
                    )}
                  </Button>
                )}
              <div className="space-y-2">
                {(vividFeedback?.todoLists?.length ?? 0) > 0 ? (
                  <div
                    className="px-3 py-2 rounded-xl space-y-0"
                    style={{ ...CARD_STYLES.default, borderRadius: "12px" }}
                  >
                    <DndContext
                      sensors={dndSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event: DragEndEvent) => {
                        const { active, over } = event;
                        if (!over || active.id === over.id) return;
                        if (String(active.id).startsWith(OPTIMISTIC_ID_PREFIX)) return;
                        const items = vividFeedback?.todoLists ?? [];
                        const oldIndex = items.findIndex((i) => i.id === active.id);
                        const newIndex = items.findIndex((i) => i.id === over.id);
                        if (oldIndex === -1 || newIndex === -1) return;
                        const reordered = arrayMove(items, oldIndex, newIndex);
                        const realIds = reordered
                          .map((i) => i.id)
                          .filter((id) => !String(id).startsWith(OPTIMISTIC_ID_PREFIX));
                        if (realIds.length > 0) reorderTodoItems.mutate(realIds);
                      }}
                    >
                      <SortableContext
                        items={vividFeedback?.todoLists?.map((i) => i.id) ?? []}
                        strategy={verticalListSortingStrategy}
                      >
                        {vividFeedback?.todoLists?.map((item) => (
                          <TodoItemRow
                            key={item.id}
                            item={item}
                            date={targetDateIso || ""}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                ) : (
                  <div
                    className="px-3 py-6 rounded-xl text-center"
                    style={{
                      ...CARD_STYLES.default,
                      borderRadius: "12px",
                      color: COLORS.text.tertiary,
                      fontSize: "0.8125rem",
                    }}
                  >
                    {targetDateIso && targetDateIso > todayIso
                      ? "예정된 할 일이 없습니다."
                      : "오늘의 할 일이 없습니다."}
                  </div>
                )}
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={newTodoContents}
                    onChange={(e) => setNewTodoContents(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (e.nativeEvent.isComposing) return;
                        e.preventDefault();
                        const trimmed = (e.target as HTMLInputElement).value.trim();
                        if (trimmed) {
                          addTodoItem.mutate(trimmed, {
                            onSuccess: () => setNewTodoContents(""),
                            onError: (err) => {
                              showToast(
                                err instanceof Error ? err.message : "추가에 실패했어요."
                              );
                              setNewTodoContents(trimmed);
                            },
                          });
                          setNewTodoContents("");
                        }
                      }
                    }}
                    placeholder="새 할 일 입력..."
                    className="flex-1 h-10 px-3 rounded-lg text-sm outline-none transition-colors placeholder:text-muted-foreground"
                    style={{
                      fontFamily: FONTS.sans,
                      border: `1.5px solid ${COLORS.border.light}`,
                      backgroundColor: COLORS.background.base,
                      color: COLORS.text.primary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.brand.primary;
                      e.target.style.boxShadow = `0 0 0 2px ${COLORS.brand.primary}30`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = COLORS.border.light;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const trimmed = newTodoContents.trim();
                      if (trimmed) {
                        addTodoItem.mutate(trimmed, {
                          onSuccess: () => setNewTodoContents(""),
                          onError: (err) => {
                            showToast(
                              err instanceof Error ? err.message : "추가에 실패했어요."
                            );
                            setNewTodoContents(trimmed);
                          },
                        });
                        setNewTodoContents("");
                      }
                    }}
                    disabled={!newTodoContents.trim()}
                    className="h-10 rounded-lg text-sm font-semibold min-w-[72px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-100 disabled:hover:opacity-100"
                    style={{
                      backgroundColor: COLORS.brand.primary,
                      color: COLORS.text.white,
                      border: `1.5px solid ${COLORS.brand.primary}`,
                      boxShadow: SHADOWS.elevation2,
                    }}
                  >
                    추가
                  </Button>
                </div>
              </div>
            </>
        </div>
      ) : (
        /* 비비드/회고 타입일 때 기존 단일 입력 필드 */
        <div
          className={`${SPACING.card.padding} ${CARD_STYLES.hover.transition} relative`}
          style={{
            backgroundColor: defaultColors.background,
            border: `1.5px solid ${defaultColors.border}`,
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
          /* 가로 줄무늬 */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            ${defaultColors.lineColor} 27px,
            ${defaultColors.lineColor} 28px
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

          {/* 종이 질감 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
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
              onFocus={handleFocus}
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
                scrollMargin: "0px",
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
                  background:
                    !content.trim() || createRecordMutation.isPending
                      ? GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.08)
                      : COLORS.brand.primary,
                  color:
                    !content.trim() || createRecordMutation.isPending
                      ? COLORS.text.tertiary
                      : COLORS.text.white,
                  fontWeight: "600",
                  padding: "0.625rem 1.5rem",
                  borderRadius: "12px",
                  border:
                    !content.trim() || createRecordMutation.isPending
                      ? `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "25")}`
                      : `1.5px solid ${COLORS.brand.primary}`,
                  boxShadow:
                    !content.trim() || createRecordMutation.isPending
                      ? SHADOWS.default
                      : SHADOWS.elevation2,
                  transition: "all 0.2s ease-in-out",
                }}
                className="hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
