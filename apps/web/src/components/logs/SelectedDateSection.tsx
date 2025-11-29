import { RecordItem } from "./RecordItem";
import { EmptyRecordsState } from "./EmptyRecordsState";
import type { Record } from "@/hooks/useRecords";

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
      <h2 className="mb-4" style={{ color: "#333333", fontSize: "1.1rem" }}>
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
