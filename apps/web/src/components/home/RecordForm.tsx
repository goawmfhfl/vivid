import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCreateRecord } from "../../hooks/useRecords";
import { COLORS, TYPOGRAPHY, SPACING, CARD_STYLES, SHADOWS } from "@/lib/design-system";
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
import {
  getEmotionIntensityLabel,
  type EmotionIntensity,
} from "@/lib/emotion-data";
import { EmotionIntensityPicker } from "@/components/emotion/EmotionIntensityPicker";
import { EmotionKeywordPicker } from "@/components/emotion/EmotionKeywordPicker";
import { EmotionFactorPicker } from "@/components/emotion/EmotionFactorPicker";
import { EmotionReasonInput } from "@/components/emotion/EmotionReasonInput";
import { EmotionSaveButton } from "@/components/emotion/EmotionSaveButton";
import { useEnvironment } from "@/hooks/useEnvironment";
import { ReviewGuidePanel } from "./ReviewGuidePanel";

interface RecordFormProps {
  onSuccess?: () => void;
  selectedDate?: string; // YYYY-MM-DD
  onTypeChange?: (type: RecordType | null) => void;
  initialType?: RecordType | null;
}

const STORAGE_KEY = "record-form-draft";
const STORAGE_KEY_Q1 = "record-form-draft-q1";
const STORAGE_KEY_Q2 = "record-form-draft-q2";
const STORAGE_KEY_Q3 = "record-form-draft-q3";

export function RecordForm({
  onSuccess,
  selectedDate,
  onTypeChange,
  initialType,
}: RecordFormProps) {
  const [content, setContent] = useState("");
  const [q1Content, setQ1Content] = useState("");
  const [q2Content, setQ2Content] = useState("");
  const [q3Content, setQ3Content] = useState("");
  const [emotionIntensity, setEmotionIntensity] =
    useState<EmotionIntensity | undefined>(4);
  const [emotionKeywords, setEmotionKeywords] = useState<string[]>([]);
  const [emotionFactors, setEmotionFactors] = useState<string[]>([]);
  const [emotionReason, setEmotionReason] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showReviewGuidePanel, setShowReviewGuidePanel] = useState(false);
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
  const { subscription } = useSubscription();
  const { isDevelopment } = useEnvironment();
  const { state: timerState } = useTimer();
  const { showToast } = useToast();

  // 날짜 상태 계산
  const todayIso = getKSTDateString();
  const targetDateIso = selectedDate || todayIso;
  const isFuture = targetDateIso > todayIso;

  // 사용 가능한 기록 타입 가져오기 (비비드 → 회고 → 감정 순, 회고는 첫 번째 아님)
  const getRecordTypeOptions = useCallback(() => {
    const allowEmotion = !!subscription?.isPro && isDevelopment;
    const allowedTypes: RecordType[] = ["dream"];
    if (subscription?.isPro) {
      allowedTypes.push("review");
      if (allowEmotion) {
        allowedTypes.push("emotion");
      }
    }
    const displayTypes = [...allowedTypes];
    return { allowedTypes, displayTypes, allowEmotion };
  }, [subscription?.isPro, isDevelopment]);

  // 첫 번째 타입을 기본값으로 설정
  useEffect(() => {
    const { allowedTypes } = getRecordTypeOptions();
    if (!hasAppliedInitialTypeRef.current) {
      if (initialType && allowedTypes.includes(initialType)) {
        setSelectedType(initialType);
        hasAppliedInitialTypeRef.current = true;
        return;
      }

      if (allowedTypes.length > 0 && !selectedType) {
        setSelectedType(allowedTypes[0] as RecordType);
        hasAppliedInitialTypeRef.current = true;
        return;
      }
    }

    if (selectedType && !allowedTypes.includes(selectedType)) {
      // 현재 선택된 타입이 허용되지 않으면 첫 번째 타입으로 변경
      setSelectedType(allowedTypes[0] as RecordType);
    }
  }, [getRecordTypeOptions, selectedType, initialType]);

  useEffect(() => {
    onTypeChange?.(selectedType);
  }, [onTypeChange, selectedType]);

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

  const handleToggleKeyword = (keyword: string) => {
    setEmotionKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((item) => item !== keyword)
        : [...prev, keyword]
    );
  };

  const handleIntensityChange = (value: EmotionIntensity) => {
    setEmotionIntensity(value);
    setEmotionKeywords([]);
    setEmotionFactors([]);
  };

  const handleToggleFactor = (factor: string) => {
    setEmotionFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((item) => item !== factor)
        : [...prev, factor]
    );
  };

  const buildEmotionSummary = () => {
    if (!emotionIntensity) return "";
    const label = getEmotionIntensityLabel(emotionIntensity);
    const keywordCount = emotionKeywords.length;
    const factorCount = emotionFactors.length;
    return `감정: ${label} · 키워드 ${keywordCount} · 요인 ${factorCount}`;
  };

  const handleEmotionSubmit = () => {
    if (
      !emotionIntensity ||
      emotionKeywords.length === 0 ||
      emotionFactors.length === 0 ||
      isFuture ||
      createRecordMutation.isPending
    )
      return;

    const summary = buildEmotionSummary();
    if (!summary) return;

    createRecordMutation.mutate(
      {
        content: summary,
        type: "emotion",
        emotion: {
          intensity: emotionIntensity,
          keywords: emotionKeywords,
          factors: emotionFactors,
          reasonText: emotionReason.trim() || null,
        },
        ...(selectedDate && { kst_date: selectedDate }),
      },
      {
        onSuccess: () => {
          const message =
            emotionReason.trim().length > 0
              ? "오늘의 감정 단서가 저장됐어요."
              : "감정은 저장됐어요. 다음엔 한 줄 남겨도 좋아요.";
          showToast(message);
          setEmotionIntensity(undefined);
          setEmotionKeywords([]);
          setEmotionFactors([]);
          setEmotionReason("");
          onSuccess?.();
        },
        onError: (error) => {
          console.error("감정 기록 생성 실패:", error.message);
        },
      }
    );
  };

  const handleSubmit = () => {
    if (isFuture) return;
    const { allowedTypes } = getRecordTypeOptions();
    const recordType = selectedType || allowedTypes[0] || "dream";

    if (recordType === "emotion") {
      handleEmotionSubmit();
      return;
    }

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

  const { allowedTypes, displayTypes } = getRecordTypeOptions();
  const recordType = selectedType || allowedTypes[0] || "dream";
  const availableTypes = displayTypes;
  const isReviewLocked = !subscription?.isPro;
  const isTypeDisabled = (typeId: RecordType) =>
    typeId === "review" && isReviewLocked;

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

  useEffect(() => {
    if (recordType === "emotion" && !emotionIntensity) {
      setEmotionIntensity(4);
    }
  }, [recordType, emotionIntensity]);
  
  // 프로젝트 기본 색상 (타입별 색상 변경 없이 고정)
  const defaultColors = {
    background: COLORS.background.card,
    border: COLORS.border.light,
    lineColor: "rgba(196, 190, 178, 0.12)", // border.card 기반
    overlay: "rgba(127, 143, 122, 0.08)", // primary.500 기반
  };

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
        {/* 모던한 타입 라벨 - 텍스트에어리어 위쪽 */}
        {recordType && !timerState.isRunning && (
          <div className="mb-3 flex justify-between items-center relative">
            {/* 타이머 */}
            <Timer />
            <div
              data-type-label
              className="cursor-pointer inline-flex relative overflow-hidden"
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              style={{
                backgroundColor: defaultColors.background,
                padding: "0.375rem 0.75rem",
                borderRadius: "20px",
                boxShadow: `
                  0 1px 3px rgba(0,0,0,0.08),
                  0 1px 2px rgba(0,0,0,0.04),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                border: `1px solid ${defaultColors.border}`,
                transition: "all 0.2s ease",
                // 종이 질감 배경 패턴
                backgroundImage: `
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
                  radial-gradient(circle at 75% 75%, ${defaultColors.overlay} 0%, transparent 40%)
                `,
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            />
            <div className="relative z-10 flex items-center gap-1.5">
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
                  const isDisabled = isTypeDisabled(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedType(type.id);
                        onTypeChange?.(type.id);
                        setShowTypeSelector(false);
                      }}
                      disabled={isDisabled}
                      className="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{
                        backgroundColor:
                          recordType === type.id
                            ? COLORS.background.hover
                            : "transparent",
                        border:
                          recordType === type.id
                            ? `1px solid ${COLORS.brand.primary}`
                            : "1px solid transparent",
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (recordType !== type.id && !isDisabled) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.background.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (recordType !== type.id && !isDisabled) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: COLORS.text.primary,
                          fontWeight: recordType === type.id ? "500" : "400",
                        }}
                      >
                        {type.title}
                      </span>
                      {isDisabled && (
                        <span
                          className={TYPOGRAPHY.caption.fontSize}
                          style={{
                            color: COLORS.text.tertiary,
                            marginLeft: "auto",
                          }}
                        >
                          Pro 전용
                        </span>
                      )}
                    </button>
                  );
                })}
                {isReviewLocked && (
                  <div
                    className={cn(
                      TYPOGRAPHY.caption.fontSize,
                      "mt-2 rounded-lg px-3 py-2"
                    )}
                    style={{
                      color: COLORS.text.secondary,
                      backgroundColor: COLORS.background.hover,
                    }}
                  >
                    Pro 업그레이드 시 회고 기록을 작성할 수 있어요.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* dream 타입일 때 2개의 질문 입력 필드 */}
      {recordType === "dream" ? (
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
                backgroundColor:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? "#D1D5DB"
                    : COLORS.brand.primary,
                color: "#FFFFFF",
                fontWeight: "600",
                padding: "0.625rem 1.5rem",
                borderRadius: "0.5rem",
                transition: "all 0.2s ease-in-out",
                boxShadow:
                  (!q1Content.trim() && !q2Content.trim()) || createRecordMutation.isPending
                    ? "none"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              className="hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
            </Button>
          </div>
        </>
      ) : recordType === "review" ? (
        <>
          {/* Q3 입력 필드 */}
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
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                backgroundColor: COLORS.background.card,
                border: `1.5px solid ${COLORS.border.light}`,
                color: COLORS.brand.primary,
                boxShadow: SHADOWS.elevation1,
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
                backgroundColor:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? "#D1D5DB"
                    : COLORS.brand.primary,
                color: "#FFFFFF",
                fontWeight: "600",
                padding: "0.625rem 1.5rem",
                borderRadius: "0.5rem",
                transition: "all 0.2s ease-in-out",
                boxShadow:
                  !q3Content.trim() || createRecordMutation.isPending
                    ? "none"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
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
      ) : recordType === "emotion" ? (
        <div
          className={cn(
            "flex flex-col gap-8",
            SPACING.element.marginBottomLarge
          )}
        >
          <div className={`flex flex-col ${SPACING.element.gapSmall}`}>
            <p
              className={cn(TYPOGRAPHY.bodySmall.fontSize, "text-center")}
              style={{ color: COLORS.text.muted }}
            >
              생각하지 않아도 고를 수 있는 지금의 감정
            </p>
            <EmotionIntensityPicker
              value={emotionIntensity}
              onChange={handleIntensityChange}
            />
          </div>
          <div
            className="h-px w-full"
            style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
          />
          <EmotionKeywordPicker
            intensity={emotionIntensity}
            selectedKeywords={emotionKeywords}
            onToggle={handleToggleKeyword}
          />
          <div
            className="h-px w-full"
            style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
          />
          <EmotionFactorPicker
            intensity={emotionIntensity}
            selectedFactors={emotionFactors}
            onToggle={handleToggleFactor}
          />
          <div
            className="h-px w-full"
            style={{ backgroundColor: COLORS.border.light, opacity: 0.6 }}
          />
          <EmotionReasonInput
            value={emotionReason}
            onChange={setEmotionReason}
            onHelpOpen={() => {}}
            accentColor={emotionIntensity ? COLORS.emotion.intensity[emotionIntensity] : COLORS.brand.primary}
          />
          <EmotionSaveButton
            disabled={
              !emotionIntensity ||
              emotionKeywords.length === 0 ||
              emotionFactors.length === 0
            }
            isSaving={createRecordMutation.isPending}
            onClick={handleEmotionSubmit}
          />
        </div>
      ) : (
        /* 다른 타입일 때 기존 단일 입력 필드 */
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
      )}
      </div>
    </>
  );
}
