import type { Record } from "@/hooks/useRecords";
import { COLORS, TYPOGRAPHY, SPACING, CARD_STYLES } from "@/lib/design-system";
import {
  RECORD_TYPES,
  RECORD_TYPE_COLORS,
  type RecordType,
} from "../signup/RecordTypeCard";

interface RecordItemProps {
  record: Record;
}

export function RecordItem({ record }: RecordItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? "오전" : "오후";
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  const recordType = (record.type as RecordType) || "daily";
  const typeColors = RECORD_TYPE_COLORS[recordType];
  const typeInfo = RECORD_TYPES.find((t) => t.id === recordType);

  return (
    <div
      className={`${SPACING.card.paddingSmall} ${CARD_STYLES.hover.transition} relative`}
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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `
          0 4px 16px rgba(107, 122, 111, 0.08),
          0 2px 6px rgba(0,0,0,0.04),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `;
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
        <div className="flex items-center gap-3 mb-3">
          {typeInfo && (
            <span
              style={{
                fontSize: "1rem",
                opacity: 0.7,
              }}
              title={typeInfo.title}
            >
              {typeInfo.icon}
            </span>
          )}
          <span
            className={TYPOGRAPHY.caption.fontSize}
            style={{
              color: COLORS.text.secondary,
              opacity: 0.5,
            }}
          >
            {formatTime(record.created_at)}
          </span>
          <span
            className={TYPOGRAPHY.caption.fontSize}
            style={{
              color: COLORS.text.muted,
              opacity: 0.5,
              fontSize: "0.7rem",
            }}
          >
            {record.content?.length || 0}자
          </span>
        </div>
        <p
          className={TYPOGRAPHY.bodyLarge.fontSize}
          style={{
            color: COLORS.text.primary,
            lineHeight: "28px", // 줄무늬 간격(28px)과 일치
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            paddingTop: "2px", // 줄무늬와 정렬을 위한 미세 조정
            }}
          >
            {record.content}
          </p>
        </div>
      </div>
  );
}
