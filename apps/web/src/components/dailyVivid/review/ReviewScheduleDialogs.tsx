"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { ScheduleDatePicker } from "../../home/ScheduleDatePicker";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ReviewScheduleDialogsProps {
  scheduleItemId: string | null;
  scheduleValue: string | null;
  setScheduleItemId: (id: string | null) => void;
  setScheduleValue: (v: string | null) => void;
  onConfirmSchedule: () => void;

  addToDateContents: string | null;
  addToDateValue: string | null;
  setAddToDateContents: (v: string | null) => void;
  setAddToDateValue: (v: string | null) => void;
  onConfirmAddToDate: () => void;

  editScheduleContents: string | null;
  editScheduleValue: string | null;
  setEditScheduleContents: (v: string | null) => void;
  setEditScheduleValue: (v: string | null) => void;
  onConfirmEditSchedule: () => void;
}

export function ReviewScheduleDialogs({
  scheduleItemId,
  scheduleValue,
  setScheduleItemId,
  setScheduleValue,
  onConfirmSchedule,
  addToDateContents,
  addToDateValue,
  setAddToDateContents,
  setAddToDateValue,
  onConfirmAddToDate,
  editScheduleContents,
  editScheduleValue,
  setEditScheduleContents,
  setEditScheduleValue,
  onConfirmEditSchedule,
}: ReviewScheduleDialogsProps) {
  return (
    <>
      <Dialog
        open={!!scheduleItemId}
        onOpenChange={(open) => !open && setScheduleItemId(null)}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: COLORS.background.card,
            borderColor: COLORS.border.light,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text.primary }}>
              날짜 선택
            </DialogTitle>
          </DialogHeader>
          <ScheduleDatePicker
            value={scheduleValue}
            onChange={setScheduleValue}
            onConfirm={onConfirmSchedule}
            onCancel={() => setScheduleItemId(null)}
            onClear={() => setScheduleValue(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!addToDateContents}
        onOpenChange={(open) => !open && (setAddToDateContents(null), setAddToDateValue(null))}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: COLORS.background.card,
            borderColor: COLORS.border.light,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text.primary }}>
              날짜 선택
            </DialogTitle>
          </DialogHeader>
          {addToDateContents && (
            <p
              className={cn(TYPOGRAPHY.body.fontSize, "mb-2")}
              style={{ color: COLORS.text.secondary }}
            >
              &quot;{addToDateContents}&quot;
            </p>
          )}
          <ScheduleDatePicker
            value={addToDateValue}
            onChange={setAddToDateValue}
            onConfirm={onConfirmAddToDate}
            onCancel={() => (setAddToDateContents(null), setAddToDateValue(null))}
            onClear={() => setAddToDateValue(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editScheduleContents}
        onOpenChange={(open) =>
          !open && (setEditScheduleContents(null), setEditScheduleValue(null))
        }
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: COLORS.background.card,
            borderColor: COLORS.border.light,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text.primary }}>
              일정 수정
            </DialogTitle>
          </DialogHeader>
          {editScheduleContents && (
            <p
              className={cn(TYPOGRAPHY.body.fontSize, "mb-2")}
              style={{ color: COLORS.text.secondary }}
            >
              &quot;{editScheduleContents}&quot;
            </p>
          )}
          <ScheduleDatePicker
            value={editScheduleValue}
            onChange={setEditScheduleValue}
            onConfirm={onConfirmEditSchedule}
            onCancel={() => (setEditScheduleContents(null), setEditScheduleValue(null))}
            onClear={() => setEditScheduleValue(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
