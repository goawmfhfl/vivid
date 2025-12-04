import { RecordItem } from "../common/RecordItem";
import { EmptyRecordsState } from "./EmptyRecordsState";
import type { Record } from "@/hooks/useRecords";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

interface SelectedDateSectionProps {
  dateLabel: string;
  isToday: boolean;
  records: Record[];
  onEdit?: (record: Record) => void;
  onDelete?: (id: number) => void;
}

export function SelectedDateSection({
  dateLabel,
  isToday,
  records,
  onEdit,
  onDelete,
}: SelectedDateSectionProps) {
  return (
    <div className="mb-6">
      <h2
        className="mb-4 font-semibold"
        style={{
          color: COLORS.text.primary,
          fontSize: TYPOGRAPHY.h3.fontSize.replace("text-", ""),
        }}
      >
        {dateLabel}
        {isToday && " (오늘)"}
      </h2>

      {records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={!!(onEdit || onDelete)}
            />
          ))}
        </div>
      ) : (
        <EmptyRecordsState />
      )}
    </div>
  );
}
