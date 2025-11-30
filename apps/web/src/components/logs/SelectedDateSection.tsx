import { RecordItem } from "./RecordItem";
import { EmptyRecordsState } from "./EmptyRecordsState";
import type { Record } from "@/hooks/useRecords";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

interface SelectedDateSectionProps {
  dateLabel: string;
  isToday: boolean;
  records: Record[];
}

export function SelectedDateSection({
  dateLabel,
  isToday,
  records,
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
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <EmptyRecordsState />
      )}
    </div>
  );
}
