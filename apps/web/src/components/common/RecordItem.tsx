import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { type Record } from "../../hooks/useRecords";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  TRANSITIONS,
  CARD_STYLES,
  SPACING,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  RECORD_TYPES,
  type RecordType,
} from "../signup/RecordTypeCard";
import { formatKSTTime } from "@/lib/date-utils";

interface RecordItemProps {
  record: Record;
  onEdit?: (record: Record) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean; // 편집/삭제 버튼 표시 여부
}

export function RecordItem({
  record,
  onEdit,
  onDelete,
  showActions = true,
}: RecordItemProps) {
  const recordType = (record.type as RecordType) || "dream";
  const typeInfo = RECORD_TYPES.find((t) => t.id === recordType);

  // 프로젝트 기본 색상 (타입별 색상 변경 없이 고정)
  const defaultColors = {
    background: COLORS.background.card,
    border: COLORS.border.light,
    lineColor: "rgba(196, 190, 178, 0.12)", // border.card 기반
    overlay: "rgba(127, 143, 122, 0.08)", // primary.500 기반
  };

  // 편집/삭제 기능이 있는지 확인
  const hasActions = showActions && (onEdit || onDelete);

  // vivid 타입(dream)일 때 Q1, Q2 분리
  const parseVividContent = (content: string | null) => {
    if (!content || recordType !== "dream") {
      return { q1: null, q2: null, hasSeparated: false };
    }

    // Q1과 Q2 패턴 찾기
    const q1Match = content.match(/Q1\.\s*오늘 하루를 어떻게 보낼까\?[\s\n]*(.*?)(?=\n\nQ2\.|$)/s);
    const q2Match = content.match(/Q2\.\s*앞으로의 나는 어떤 모습일까\?[\s\n]*(.*?)$/s);

    if (q1Match && q2Match) {
      return {
        q1: q1Match[1].trim(),
        q2: q2Match[1].trim(),
        hasSeparated: true,
      };
    }

    return { q1: null, q2: null, hasSeparated: false };
  };

  const { q1, q2, hasSeparated } = parseVividContent(record.content);

  return (
    <div
      className={`${SPACING.card.paddingSmall} ${CARD_STYLES.hover.transition} relative`}
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
        <div
          className={`flex items-start justify-between mb-3 ${
            hasActions ? "" : "flex-wrap"
          }`}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            {typeInfo && (
              <span
                className={cn(TYPOGRAPHY.body.fontSize, "font-medium")}
                style={{
                  color: COLORS.text.primary,
                  lineHeight: "1.2",
                }}
              >
                {typeInfo.title}
              </span>
            )}
            <span
              className={cn(TYPOGRAPHY.caption.fontSize, TYPOGRAPHY.caption.fontWeight)}
              style={{
                color: COLORS.text.secondary,
                opacity: 0.5,
              }}
            >
              {formatKSTTime(record.created_at)}
            </span>
            <span
              className={cn(TYPOGRAPHY.caption.fontSize, TYPOGRAPHY.caption.fontWeight)}
              style={{
                color: COLORS.text.muted,
                opacity: 0.5,
              }}
            >
              {record.content?.length || 0}자
            </span>
          </div>

          {/* 편집/삭제 메뉴 */}
          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: COLORS.brand.primary }}
                  className="focus:outline-none focus:ring-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[140px]"
                style={{
                  backgroundColor: COLORS.background.card,
                  border: `1px solid ${COLORS.border.input}`,
                  boxShadow: SHADOWS.md,
                }}
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      onEdit(record);
                    }}
                    className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors}`}
                    style={{
                      color: COLORS.text.primary,
                      padding: "0.625rem 1rem",
                      fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        COLORS.background.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        COLORS.background.card;
                    }}
                  >
                    <Pencil
                      className="w-4 h-4 mr-2"
                      style={{ color: COLORS.brand.primary }}
                    />
                    수정하기
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(record.id)}
                    className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors}`}
                    style={{
                      color: COLORS.status.error,
                      padding: "0.625rem 1rem",
                      fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        COLORS.background.card;
                    }}
                  >
                    <Trash2
                      className="w-4 h-4 mr-2"
                      style={{ color: COLORS.status.error }}
                    />
                    삭제하기
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* vivid 타입일 때 Q1, Q2 분리 표시 */}
        {hasSeparated ? (
          <div className="space-y-6">
            {/* Q1 섹션 */}
            {q1 && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 pb-2 border-b" style={{ borderColor: COLORS.border.light }}>
                  <span
                    className={cn(
                      TYPOGRAPHY.h4.fontSize,
                      "font-bold tracking-tight"
                    )}
                    style={{ 
                      color: COLORS.text.primary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Q1
                  </span>
                  <h3
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight,
                      "flex-1"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    오늘 하루를 어떻게 보낼까?
                  </h3>
                </div>
                <p
                  className={cn(TYPOGRAPHY.body.fontSize)}
                  style={{
                    color: COLORS.text.primary,
                    lineHeight: "28px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    paddingTop: "2px",
                  }}
                >
                  {q1}
                </p>
              </div>
            )}

            {/* Q2 섹션 */}
            {q2 && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 pb-2 border-b" style={{ borderColor: COLORS.border.light }}>
                  <span
                    className={cn(
                      TYPOGRAPHY.h4.fontSize,
                      "font-bold tracking-tight"
                    )}
                    style={{ 
                      color: COLORS.text.primary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Q2
                  </span>
                  <h3
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight,
                      "flex-1"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    앞으로의 나는 어떤 모습일까?
                  </h3>
                </div>
                <p
                  className={cn(TYPOGRAPHY.body.fontSize)}
                  style={{
                    color: COLORS.text.primary,
                    lineHeight: "28px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    paddingTop: "2px",
                  }}
                >
                  {q2}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight)}
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
        )}
      </div>
    </div>
  );
}
