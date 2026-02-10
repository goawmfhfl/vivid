"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/useToast";
import { COLORS, SHADOWS, GRADIENT_UTILS } from "@/lib/design-system";

export function Timer() {
  const { showToast } = useToast();
  const {
    config,
    state,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
    saveConfig,
  } = useTimer({
    onComplete: () => {
      showToast("타이머가 완료되었습니다!");
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(config.minutes);
  const [editSeconds, setEditSeconds] = useState(config.seconds);
  const timeDisplayRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (state.isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const isFinished = state.remainingTime === 0;

  // 편집 모드 시작
  const handleTimeClick = () => {
    if (state.isRunning || isFinished) return;
    
    setIsEditing(true);
    // 현재 남은 시간을 분/초로 변환
    const totalSeconds = state.remainingTime;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setEditMinutes(minutes);
    setEditSeconds(seconds);
  };

  // 편집 완료 및 저장
  const handleTimeSave = useCallback(() => {
    // 현재 input 필드의 값을 직접 읽어서 저장 (최신 값 보장)
    if (!timeDisplayRef.current) {
      setIsEditing(false);
      return;
    }

    const minutesInput = timeDisplayRef.current.querySelector(
      'input[data-field="minutes"]'
    ) as HTMLInputElement;
    const secondsInput = timeDisplayRef.current.querySelector(
      'input[data-field="seconds"]'
    ) as HTMLInputElement;

    if (!minutesInput || !secondsInput) {
      setIsEditing(false);
      return;
    }

    const minutes = Math.max(0, Math.min(99, parseInt(minutesInput.value) || 0));
    const seconds = Math.max(0, Math.min(59, parseInt(secondsInput.value) || 0));

    if (minutes === 0 && seconds === 0) {
      // 0분 0초는 저장하지 않음
      setIsEditing(false);
      return;
    }

    const newConfig = {
      hours: 0,
      minutes,
      seconds,
      isActive: config.isActive,
    };
    saveConfig(newConfig);
    setIsEditing(false);
  }, [config.isActive, saveConfig]);

  // ESC 키로 편집 취소, 외부 클릭 시 저장, 스피너 버튼 숨김
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isEditing &&
        timeDisplayRef.current &&
        !timeDisplayRef.current.contains(e.target as Node)
      ) {
        // 외부 클릭 시 저장
        handleTimeSave();
      }
    };

    // 스피너 버튼 강제 숨김
    const hideSpinners = () => {
      if (timeDisplayRef.current) {
        const inputs = timeDisplayRef.current.querySelectorAll('input[type="number"]');
        inputs.forEach((input) => {
          const htmlInput = input as HTMLInputElement;
          htmlInput.style.setProperty("-webkit-appearance", "none", "important");
          htmlInput.style.setProperty("appearance", "none", "important");
          htmlInput.style.setProperty("-moz-appearance", "textfield", "important");
        });
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleEscape);
      // 약간의 지연을 두어 현재 클릭 이벤트가 처리된 후 실행
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      
      // 스피너 버튼 숨김
      setTimeout(hideSpinners, 0);
      const interval = setInterval(hideSpinners, 100);
      
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("mousedown", handleClickOutside);
        clearInterval(interval);
      };
    }
  }, [isEditing, handleTimeSave]);


  return (
    <>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
          border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
          boxShadow: SHADOWS.default,
        }}
      >
        {/* 시간 표시 */}
        {isEditing ? (
          <div
            ref={timeDisplayRef}
            className="flex items-center gap-1"
            tabIndex={0}
            style={{
              minWidth: "3.5rem",
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editMinutes}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const numVal = val === "" ? 0 : Math.max(0, Math.min(99, parseInt(val) || 0));
                setEditMinutes(numVal);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTimeSave();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                } else if (e.key === "Tab" && !e.shiftKey) {
                  // Tab 키로 초 필드로 이동
                  e.preventDefault();
                  const secondsInput = timeDisplayRef.current?.querySelector(
                    'input[data-field="seconds"]'
                  ) as HTMLInputElement;
                  secondsInput?.focus();
                }
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "transparent";
                // 다른 input으로 포커스가 이동하는 경우는 저장하지 않음
                // 외부 클릭의 경우 handleClickOutside에서 처리하므로 여기서는 처리하지 않음
              }}
              data-field="minutes"
              autoFocus
              className="w-8 text-center border-none outline-none bg-transparent rounded px-1"
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: COLORS.brand.primary,
                fontVariantNumeric: "tabular-nums",
                transition: "background-color 0.2s ease",
                MozAppearance: "textfield",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = COLORS.background.hoverLight;
                // 스피너 버튼 강제 숨김
                const input = e.target as HTMLInputElement;
                if (input) {
                  input.style.setProperty("-webkit-appearance", "none", "important");
                  input.style.setProperty("appearance", "none", "important");
                }
              }}
            />
            <span style={{ color: COLORS.text.secondary }}>:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editSeconds}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const numVal = val === "" ? 0 : Math.max(0, Math.min(59, parseInt(val) || 0));
                setEditSeconds(numVal);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTimeSave();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                } else if (e.key === "Tab" && e.shiftKey) {
                  // Shift+Tab으로 분 필드로 이동
                  e.preventDefault();
                  const minutesInput = timeDisplayRef.current?.querySelector(
                    'input[data-field="minutes"]'
                  ) as HTMLInputElement;
                  minutesInput?.focus();
                }
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "transparent";
                // 다른 input으로 포커스가 이동하는 경우는 저장하지 않음
                // 외부 클릭의 경우 handleClickOutside에서 처리하므로 여기서는 처리하지 않음
              }}
              data-field="seconds"
              className="w-8 text-center border-none outline-none bg-transparent rounded px-1"
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: COLORS.brand.primary,
                fontVariantNumeric: "tabular-nums",
                transition: "background-color 0.2s ease",
                MozAppearance: "textfield",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = COLORS.background.hoverLight;
                // 스피너 버튼 강제 숨김
                const input = e.target as HTMLInputElement;
                if (input) {
                  input.style.setProperty("-webkit-appearance", "none", "important");
                  input.style.setProperty("appearance", "none", "important");
                }
              }}
            />
          </div>
        ) : (
          <div
            onClick={handleTimeClick}
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: isFinished
                ? COLORS.status.error
                : state.isRunning
                ? COLORS.brand.primary
                : COLORS.text.primary,
              fontVariantNumeric: "tabular-nums",
              minWidth: "3.5rem",
              textAlign: "center",
              cursor: state.isRunning || isFinished ? "default" : "pointer",
              userSelect: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!state.isRunning && !isFinished) {
                e.currentTarget.style.opacity = "0.7";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            title={
              state.isRunning || isFinished
                ? ""
                : "클릭하여 시간 설정"
            }
          >
            {formatTime(state.remainingTime)}
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        <div className="flex items-center gap-1">
          {/* 재생/일시정지 */}
          <button
            onClick={handleToggle}
            disabled={isFinished}
            className="p-1 rounded-full transition-all"
            style={{
              color: isFinished
                ? COLORS.text.muted
                : state.isRunning
                ? COLORS.brand.primary
                : COLORS.text.secondary,
              cursor: isFinished ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isFinished) {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {state.isRunning ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>

          {/* 리셋 */}
          <button
            onClick={resetTimer}
            disabled={state.isRunning}
            className="p-1 rounded-full transition-all"
            style={{
              color: state.isRunning
                ? COLORS.text.muted
                : COLORS.text.secondary,
              cursor: state.isRunning ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!state.isRunning) {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
