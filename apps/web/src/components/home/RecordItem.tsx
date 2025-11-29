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

interface RecordItemProps {
  record: Record;
  onEdit: (record: Record) => void;
  onDelete: (id: number) => void;
}

export function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? "오전" : "오후";
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`${SPACING.card.paddingSmall} ${CARD_STYLES.hover.transition} ${CARD_STYLES.hover.hoverShadow}`}
      style={CARD_STYLES.default}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={TYPOGRAPHY.caption.fontSize}
            style={{
              color: COLORS.text.secondary,
              opacity: 0.5,
            }}
          >
            {formatTime(record.created_at)}
          </span>
        </div>

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
            <DropdownMenuItem
              onClick={() => onEdit(record)}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className={TYPOGRAPHY.bodyLarge.fontSize}
        style={{
          color: COLORS.text.primary,
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {record.content}
      </p>
    </div>
  );
}
