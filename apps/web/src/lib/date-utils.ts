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
  // KST는 UTC+9 (9시간 앞서있음)
  const kstOffset = 9 * 60; // 분 단위로 변환 (9시간 = 540분)

  // UTC 시간 계산
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;

  // KST 시간 계산 (UTC + 9시간)
  const kst = new Date(utc + kstOffset * 60000);

  // YYYY-MM-DD 형식으로 포맷팅
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, "0");
  const day = String(kst.getDate()).padStart(2, "0");

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
