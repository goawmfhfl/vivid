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
}

/**
 * 키워드들이 오른쪽에서 왼쪽으로 자동 스크롤되는 재사용 가능한 컴포넌트
 * 끊기지 않는 자연스러운 무한 루프 애니메이션
 */
export function ScrollingKeywords({
  keywords,
  duration = 30,
  gap = "0.5rem",
  badgeStyle,
  containerClassName = "",
  wrapperClassName = "",
}: ScrollingKeywordsProps) {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  // 키워드를 3번 반복하여 끊기지 않는 무한 루프 효과 생성
  // 첫 번째 세트가 화면을 벗어날 때 두 번째 세트가 들어오고,
  // 두 번째 세트가 벗어날 때 세 번째 세트가 들어와서 자연스럽게 연결됨
  const repeatedKeywords = [...keywords, ...keywords, ...keywords];

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

  // 각 키워드 세트의 너비를 계산 (대략적인 값)
  // 실제로는 각 배지의 너비 + gap을 합산해야 하지만, 애니메이션을 위해 50% 이동
  const singleSetWidth = 100 / 3; // 3개 세트이므로 각 세트는 33.33%

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
          animation: `scroll-horizontal-smooth ${duration}s linear infinite`,
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
