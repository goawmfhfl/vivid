/**
 * KST(한국 표준시, UTC+9) 기준 날짜 처리 유틸리티 함수들
 *
 * 브라우저는 사용자의 로컬 시간대를 사용하지만,
 * 우리는 한국 시간(KST) 기준으로 날짜를 비교해야 합니다.
 */

/**
 * KST 기준으로 현재 날짜의 YYYY-MM-DD 문자열 반환
 *
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns KST 기준 날짜 문자열 (예: "2025-11-17")
 *
 * @example
 * ```ts
 * getKSTDateString() // "2025-11-17" (현재 KST 기준)
 * getKSTDateString(new Date("2025-11-17T15:30:00Z")) // "2025-11-18" (UTC 15:30은 KST 다음날 00:30)
 * ```
 */
export function getKSTDateString(date: Date = new Date()): string {
  // UTC 시간을 밀리초로 가져오기 (타임존 독립적)
  const utcTime = date.getTime();
  const kstOffsetMs = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
  const kstTime = utcTime + kstOffsetMs;
  const kst = new Date(kstTime);

  // UTC 메서드로 직접 접근 (타임존 변환 없이)
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * KST 기준으로 현재 날짜 반환 (시간은 00:00:00)
 *
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns KST 기준 날짜 Date 객체 (시간은 00:00:00)
 *
 * @example
 * ```ts
 * getKSTDate() // Date 객체 (2025-11-17 00:00:00 KST)
 * ```
 */
export function getKSTDate(date: Date = new Date()): Date {
  const kstDateString = getKSTDateString(date);
  // KST 기준으로 날짜 파싱
  const [year, month, day] = kstDateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * KST 기준으로 현재 시간의 요일 반환 (한국어)
 *
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns 요일 문자열 (예: "월요일", "화요일")
 */
export function getKSTWeekday(date: Date = new Date()): string {
  const kstDate = getKSTDate(date);
  return kstDate.toLocaleDateString("ko-KR", {
    weekday: "long",
    timeZone: "Asia/Seoul",
  });
}

/**
 * KST 기준으로 현재 시간의 요일 반환 (영문 약자)
 *
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns 요일 약자 (예: "Mon", "Tue")
 */
export function getKSTWeekdayShort(date: Date = new Date()): string {
  const kstDate = getKSTDate(date);
  const weekdayMap: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return weekdayMap[kstDate.getDay()] || "Sun";
}

/**
 * 환경 변수 확인 (클라이언트 사이드)
 */
function isProduction(): boolean {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 process.env 사용
    return process.env.NODE_ENV === "production";
  }
  // 클라이언트 사이드에서는 NEXT_PUBLIC_ 접두사 변수 사용
  return process.env.NEXT_PUBLIC_NODE_ENV === "production";
}

function toKSTDate(dateInput: string | Date): Date {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

export function formatKSTTime(dateString: string): string {
  const kstDate = toKSTDate(dateString);
  const hours = kstDate.getUTCHours();
  const minutes = kstDate.getUTCMinutes();
  const period = hours < 12 ? "오전" : "오후";
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * UTC ISO 문자열을 KST 기준 날짜로 포맷팅 (YYYY-MM-DD 형식)
 *
 * @param dateString UTC ISO 문자열
 * @returns KST 기준 날짜 문자열 (예: "2025-12-13")
 *
 * @example
 * formatKSTDate("2025-12-13T12:33:36.119+00:00") // "2025-12-13"
 */
export function formatKSTDate(dateString: string): string {
  const kstDate = toKSTDate(dateString);
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * UTC ISO 문자열을 KST 기준 긴 형식 날짜로 포맷팅 (한국어)
 *
 * @param dateString UTC ISO 문자열
 * @returns KST 기준 긴 형식 날짜 문자열 (예: "2025년 12월 13일")
 *
 * @example
 * formatKSTDateLong("2025-12-13T12:33:36.119+00:00") // "2025년 12월 13일"
 */
export function formatKSTDateLong(dateString: string): string {
  const kstDate = toKSTDate(dateString);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * UTC ISO 문자열을 KST 기준 날짜+시간으로 포맷팅 (한국어 형식)
 *
 * @param dateString UTC ISO 문자열
 * @returns KST 기준 날짜+시간 문자열 (예: "2025-12-13 오후 9:33")
 *
 * @example
 * formatKSTDateTime("2025-12-13T12:33:36.119+00:00") // "2025-12-13 오후 9:33"
 */
export function formatKSTDateTime(dateString: string): string {
  return `${formatKSTDate(dateString)} ${formatKSTTime(dateString)}`;
}
