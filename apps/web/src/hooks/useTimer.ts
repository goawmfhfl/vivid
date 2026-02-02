import { useState, useEffect, useCallback, useRef } from "react";

const TIMER_STORAGE_KEY = "vivid-timer-config";
const TIMER_STATE_STORAGE_KEY = "vivid-timer-state";

export interface TimerConfig {
  hours: number;
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export interface TimerState {
  remainingTime: number; // 초 단위
  isRunning: boolean;
  startTime: number | null; // 시작 시점의 timestamp
}

const DEFAULT_CONFIG: TimerConfig = {
  hours: 0,
  minutes: 10,
  seconds: 0,
  isActive: false,
};

export interface UseTimerOptions {
  onComplete?: () => void;
}

export function useTimer(options?: UseTimerOptions) {
  const { onComplete } = options || {};
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<TimerState>({
    remainingTime: 0,
    isRunning: false,
    startTime: null,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 로컬스토리지에서 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem(TIMER_STORAGE_KEY);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(parsed);
          // 설정된 시간을 초 단위로 변환
          const totalSeconds =
            parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds;
          setState((prev) => ({
            ...prev,
            remainingTime: totalSeconds,
          }));
        } catch (e) {
          console.error("타이머 설정 불러오기 실패:", e);
        }
      } else {
        // 기본값 설정
        const defaultSeconds = DEFAULT_CONFIG.hours * 3600 + 
                              DEFAULT_CONFIG.minutes * 60 + 
                              DEFAULT_CONFIG.seconds;
        setState((prev) => ({
          ...prev,
          remainingTime: defaultSeconds,
        }));
      }

      // 저장된 타이머 상태 불러오기 (페이지 새로고침 대응)
      const savedState = localStorage.getItem(TIMER_STATE_STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          const now = Date.now();
          if (parsed.isRunning && parsed.startTime) {
            // 경과 시간 계산
            const elapsed = Math.floor((now - parsed.startTime) / 1000);
            const newRemaining = Math.max(0, parsed.remainingTime - elapsed);
            
            if (newRemaining > 0) {
              setState({
                remainingTime: newRemaining,
                isRunning: true,
                startTime: parsed.startTime,
              });
            } else {
              // 시간이 다 지났으면 정지
              setState({
                remainingTime: 0,
                isRunning: false,
                startTime: null,
              });
              localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
            }
          } else {
            setState({
              remainingTime: parsed.remainingTime,
              isRunning: false,
              startTime: null,
            });
          }
        } catch (e) {
          console.error("타이머 상태 불러오기 실패:", e);
        }
      }
    }
  }, []);

  // storage 이벤트와 커스텀 이벤트 리스너 추가 (설정 변경 즉시 반영)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = () => {
      const savedConfig = localStorage.getItem(TIMER_STORAGE_KEY);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(parsed);
          const totalSeconds =
            parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds;
          setState((prev) => ({
            ...prev,
            remainingTime: totalSeconds,
            isRunning: false,
            startTime: null,
          }));
          localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
        } catch (e) {
          console.error("타이머 설정 불러오기 실패:", e);
        }
      }
    };

    const handleConfigUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<TimerConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
        const totalSeconds =
          customEvent.detail.hours * 3600 +
          customEvent.detail.minutes * 60 +
          customEvent.detail.seconds;
        setState({
          remainingTime: totalSeconds,
          isRunning: false,
          startTime: null,
        });
        localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("timerConfigUpdated", handleConfigUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("timerConfigUpdated", handleConfigUpdate);
    };
  }, []);

  // onComplete 콜백 ref 업데이트
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 타이머 실행 로직
  useEffect(() => {
    if (state.isRunning && state.remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.remainingTime <= 1) {
            // 시간 종료
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
            // 완료 콜백을 다음 이벤트 루프로 지연시켜 렌더링 중 상태 업데이트 방지
            if (onCompleteRef.current) {
              setTimeout(() => {
                onCompleteRef.current?.();
              }, 0);
            }
            return {
              remainingTime: 0,
              isRunning: false,
              startTime: null,
            };
          }
          return {
            ...prev,
            remainingTime: prev.remainingTime - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.remainingTime]);

  // 상태 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (typeof window !== "undefined" && state.isRunning) {
      localStorage.setItem(
        TIMER_STATE_STORAGE_KEY,
        JSON.stringify({
          remainingTime: state.remainingTime,
          isRunning: state.isRunning,
          startTime: state.startTime || Date.now(),
        })
      );
    } else if (typeof window !== "undefined" && !state.isRunning) {
      // 정지 상태일 때는 remainingTime만 저장
      if (state.remainingTime > 0) {
        localStorage.setItem(
          TIMER_STATE_STORAGE_KEY,
          JSON.stringify({
            remainingTime: state.remainingTime,
            isRunning: false,
            startTime: null,
          })
        );
      } else {
        localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
      }
    }
  }, [state]);

  // 설정 저장
  const saveConfig = useCallback((newConfig: TimerConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newConfig));
      // storage 이벤트를 발생시켜 다른 탭/컴포넌트에서도 즉시 반영되도록
      window.dispatchEvent(new Event("storage"));
      // 커스텀 이벤트도 발생시켜 같은 탭 내에서도 즉시 반영
      window.dispatchEvent(
        new CustomEvent("timerConfigUpdated", { detail: newConfig })
      );
    }
    // 설정된 시간으로 타이머 초기화
    const totalSeconds =
      newConfig.hours * 3600 + newConfig.minutes * 60 + newConfig.seconds;
    setState({
      remainingTime: totalSeconds,
      isRunning: false,
      startTime: null,
    });
    // 상태도 로컬스토리지에서 제거하여 새 설정이 적용되도록
    if (typeof window !== "undefined") {
      localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
    }
  }, []);

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (state.remainingTime > 0) {
      setState((prev) => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
    }
  }, [state.remainingTime]);

  // 타이머 정지
  const stopTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      startTime: null,
    }));
  }, []);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    const totalSeconds =
      config.hours * 3600 + config.minutes * 60 + config.seconds;
    setState({
      remainingTime: totalSeconds,
      isRunning: false,
      startTime: null,
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
    }
  }, [config]);

  // 시간 포맷팅 (MM:SS 또는 HH:MM:SS)
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    config,
    state,
    saveConfig,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
}
