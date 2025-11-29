import React from "react";
import { Badge } from "./badge";

export interface ScrollingKeywordsProps {
  /** 스크롤할 키워드 배열 */
  keywords: string[];
  /** 애니메이션 지속 시간 (초 단위, 기본값: 30) */
  duration?: number;
  /** 키워드 간 간격 (기본값: 0.5rem) */
  gap?: string;
  /** 배지 스타일 커스터마이징 */
  badgeStyle?: React.CSSProperties;
  /** 컨테이너에 추가할 클래스명 */
  containerClassName?: string;
  /** 키워드 래퍼에 추가할 클래스명 */
  wrapperClassName?: string;
  /** 키워드 반복 횟수 (무한 루프를 위한 복제, 기본값: 2) */
  repeatCount?: number;
}

/**
 * 키워드들이 오른쪽에서 왼쪽으로 자동 스크롤되는 재사용 가능한 컴포넌트
 */
export function ScrollingKeywords({
  keywords,
  duration = 30,
  gap = "0.5rem",
  badgeStyle,
  containerClassName = "",
  wrapperClassName = "",
  repeatCount = 2,
}: ScrollingKeywordsProps) {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  // 키워드를 반복하여 무한 루프 효과 생성
  const repeatedKeywords = Array(repeatCount)
    .fill(null)
    .flatMap(() => keywords);

  // 기본 배지 스타일
  const defaultBadgeStyle: React.CSSProperties = {
    backgroundColor: "#FFF8E7",
    color: "#B8860B",
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    flexShrink: 0,
    ...badgeStyle,
  };

  return (
    <div
      className={`overflow-hidden pb-2 ${containerClassName}`}
      style={{ position: "relative" }}
    >
      <div
        className={`flex ${wrapperClassName}`}
        style={{
          width: "max-content",
          gap,
          animation: `scroll-horizontal ${duration}s linear infinite`,
        }}
      >
        {repeatedKeywords.map((keyword, index) => (
          <Badge key={`${keyword}-${index}`} style={defaultBadgeStyle}>
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}

