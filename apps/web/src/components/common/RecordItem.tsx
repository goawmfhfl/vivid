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
  hexToRgba,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  RECORD_TYPES,
  type RecordType,
} from "../signup/RecordTypeCard";
import { formatKSTTime } from "@/lib/date-utils";
import {
  getEmotionIntensityLabel,
  type EmotionIntensity,
} from "@/lib/emotion-data";

interface RecordItemProps {
  record: Record;
  onEdit?: (record: Record) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean; // 편집/삭제 버튼 표시 여부
  showMeta?: boolean; // 타입/시간/글자수 표시 여부
}

export function RecordItem({
  record,
  onEdit,
  onDelete,
  showActions = true,
  showMeta = true,
}: RecordItemProps) {
  const recordType = (record.type as RecordType) || "dream";
  const typeInfo = RECORD_TYPES.find((t) => t.id === recordType);
  const isEmotion = recordType === "emotion";
  const emotionData = record.emotion;
  const intensityValue = emotionData?.intensity as EmotionIntensity | undefined;
  const intensityLabel = intensityValue
    ? getEmotionIntensityLabel(intensityValue)
    : null;
  const intensityColor = intensityValue
    ? COLORS.emotion.intensity[intensityValue]
    : COLORS.brand.primary;

  // 프로젝트 기본 색상 (타입별 색상 변경 없이 고정)
  const defaultColors = {
    background: COLORS.background.card,
    border: COLORS.border.light,
    lineColor: "rgba(196, 190, 178, 0.12)", // border.card 기반
    overlay: "rgba(127, 143, 122, 0.08)", // primary.500 기반
  };

  // 편집/삭제 기능이 있는지 확인
  const canEdit = !!onEdit;
  const hasActions = showActions && (canEdit || onDelete);

  const actionsNode = hasActions ? (
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
        {canEdit && (
          <DropdownMenuItem
            onClick={() => {
              onEdit?.(record);
            }}
            className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors}`}
            style={{
              color: COLORS.text.primary,
              padding: "0.625rem 1rem",
              fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.background.card;
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
              e.currentTarget.style.backgroundColor = COLORS.background.card;
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
  ) : null;

  // vivid 타입(dream)일 때 Q1, Q2 분리
  const parseVividContent = (content: string | null) => {
    if (!content || recordType !== "dream") {
      return { q1: null, q2: null, hasSeparated: false };
    }

    // Q1과 Q2 패턴 찾기
    // Q1: Q1.로 시작하고 Q2.가 나오기 전까지 또는 끝까지
    const q1Match = content.match(/Q1\.\s*오늘 하루를 어떻게 보낼까\?[\s\n]*([\s\S]*?)(?=\n\nQ2\.|$)/);
    // Q2: Q2.로 시작하고 끝까지
    const q2Match = content.match(/Q2\.\s*앞으로의 나는 어떤 모습일까\?[\s\n]*([\s\S]*?)$/);

    const q1 = q1Match ? q1Match[1].trim() : null;
    const q2 = q2Match ? q2Match[1].trim() : null;

    // Q1 또는 Q2 중 하나라도 있으면 분리된 UI로 표시
    if (q1 || q2) {
      return {
        q1,
        q2,
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
        {showMeta && (
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
            {actionsNode}
          </div>
        )}

        {!showMeta && actionsNode && (
          <div className="absolute -top-2 right-2">{actionsNode}</div>
        )}

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
        ) : isEmotion ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.tertiary }}
                >
                  감정 상태
                </span>
                <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid ${hexToRgba(intensityColor, 0.5)}`,
                      boxShadow: `0 0 0 3px ${hexToRgba(intensityColor, 0.08)}`,
                    }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: intensityColor }}
                  />
                </span>
              </div>
              {intensityLabel && (
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      TYPOGRAPHY.caption.fontSize,
                      "rounded-full px-3 py-1"
                    )}
                    style={{
                      color: intensityColor,
                      border: `1px solid ${hexToRgba(intensityColor, 0.45)}`,
                      backgroundColor: hexToRgba(intensityColor, 0.12),
                    }}
                  >
                    {intensityLabel}
                  </span>
                </div>
              )}
            </div>

            {emotionData?.keywords?.length ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(TYPOGRAPHY.caption.fontSize)}
                    style={{ color: COLORS.text.tertiary }}
                  >
                    감정 키워드
                  </span>
                  <span
                    className="inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: intensityColor }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {emotionData.keywords.map((keyword) => (
                    <span
                      key={`keyword-${keyword}`}
                      className={cn(
                        "rounded-full px-3 py-1",
                        TYPOGRAPHY.caption.fontSize
                      )}
                      style={{
                        backgroundColor: hexToRgba(intensityColor, 0.12),
                        border: `1px solid ${hexToRgba(intensityColor, 0.4)}`,
                        color: intensityColor,
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {emotionData?.factors?.length ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(TYPOGRAPHY.caption.fontSize)}
                    style={{ color: COLORS.text.tertiary }}
                  >
                    감정 요인
                  </span>
                  <span
                    className="inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: COLORS.status.warning }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {emotionData.factors.map((factor) => (
                    <span
                      key={`factor-${factor}`}
                      className={cn(
                        "rounded-full px-3 py-1",
                        TYPOGRAPHY.caption.fontSize
                      )}
                      style={{
                        backgroundColor: COLORS.background.hover,
                        border: `1px solid ${COLORS.border.light}`,
                        color: COLORS.text.secondary,
                      }}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {emotionData?.reasonText ? (
              <div className="space-y-2">
                <span
                  className={cn(TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.tertiary }}
                >
                  한 줄 이유
                </span>
                <div
                  className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                  style={{
                    color: COLORS.text.secondary,
                    lineHeight: "1.7",
                    backgroundColor: COLORS.background.hoverLight,
                    border: `1px solid ${COLORS.border.light}`,
                    borderRadius: "12px",
                    padding: "0.75rem 0.875rem",
                  }}
                >
                  {emotionData.reasonText}
                </div>
              </div>
            ) : null}
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
