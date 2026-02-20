"use client";

import { useState } from "react";
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { COLORS } from "@/lib/design-system";
import {
  useUpdateTodoItem,
  useAddTodoToDate,
  useDeleteTodoItemByDate,
} from "@/hooks/useTodoList";
import { getKSTDateString } from "@/lib/date-utils";
import type { TodoListItem } from "@/types/daily-vivid";
import type { DailyReportData } from "../types";
import { ReviewReportHeaderSection } from "./ReviewReportHeaderSection";
import { ReviewSummarySection } from "./ReviewSummarySection";
import { ReviewExecutionScoreSection } from "./ReviewExecutionScoreSection";
import { ReviewTodayTodosSection } from "./ReviewTodayTodosSection";
import { ReviewTodoFeedbackSection } from "./ReviewTodoFeedbackSection";
import { ReviewSuggestedTodosSection } from "./ReviewSuggestedTodosSection";
import { ReviewScheduleDialogs } from "./ReviewScheduleDialogs";

interface ReviewReportSectionProps {
  view: DailyReportData;
  todoLists: TodoListItem[];
  date: string;
}

export function ReviewReportSection({
  view,
  todoLists,
  date,
}: ReviewReportSectionProps) {
  const [scheduleItemId, setScheduleItemId] = useState<string | null>(null);
  const [scheduleValue, setScheduleValue] = useState<string | null>(null);
  const [addToDateContents, setAddToDateContents] = useState<string | null>(null);
  const [addToDateValue, setAddToDateValue] = useState<string | null>(null);
  const [editScheduleContents, setEditScheduleContents] = useState<string | null>(null);
  const [editScheduleValue, setEditScheduleValue] = useState<string | null>(null);
  const [addedToScheduleMap, setAddedToScheduleMap] = useState<
    Map<string, { targetDate: string; id: string }>
  >(new Map());

  const updateTodoItem = useUpdateTodoItem(date);
  const addTodoToDate = useAddTodoToDate();
  const deleteTodoByDate = useDeleteTodoItemByDate();

  const tomorrow = getKSTDateString(
    new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
  );

  const handlePostponeToTomorrow = (id: string) => {
    updateTodoItem.mutate({ id, scheduled_at: tomorrow });
  };

  const handleOpenSchedulePicker = (id: string) => {
    setScheduleItemId(id);
    setScheduleValue(null);
  };

  const handleConfirmSchedule = () => {
    if (scheduleItemId && scheduleValue) {
      updateTodoItem.mutate(
        { id: scheduleItemId, scheduled_at: scheduleValue },
        { onSuccess: () => setScheduleItemId(null) }
      );
    }
  };

  const handleAddToTomorrow = (contents: string) => {
    addTodoToDate.mutate(
      { date: tomorrow, contents },
      {
        onSuccess: (newItem) => {
          setAddedToScheduleMap((prev) =>
            new Map(prev).set(contents, { targetDate: tomorrow, id: newItem.id })
          );
        },
      }
    );
  };

  const handleAddToFuture = (contents: string, targetDate: string) => {
    addTodoToDate.mutate(
      { date: targetDate, contents },
      {
        onSuccess: (newItem) => {
          setAddedToScheduleMap((prev) =>
            new Map(prev).set(contents, { targetDate, id: newItem.id })
          );
          setAddToDateContents(null);
          setAddToDateValue(null);
        },
      }
    );
  };

  const getScheduleDetailLabel = (contents: string): string | null => {
    const info = addedToScheduleMap.get(contents);
    if (!info) return null;
    const { targetDate } = info;
    if (targetDate === tomorrow) return "내일 진행 예정";
    const [y, m, d] = targetDate.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const dateStr = target.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
    const weekday = target.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${dateStr} (${weekday}) 진행 예정`;
  };

  const handleOpenAddDatePicker = (contents: string) => {
    setAddToDateContents(contents);
    setAddToDateValue(null);
  };

  const handleConfirmAddToDate = () => {
    if (addToDateContents && addToDateValue) {
      handleAddToFuture(addToDateContents, addToDateValue);
    }
  };

  const handleDeleteSchedule = (contents: string) => {
    const info = addedToScheduleMap.get(contents);
    if (!info) return;
    deleteTodoByDate.mutate(
      { id: info.id, date: info.targetDate },
      {
        onSuccess: () => {
          setAddedToScheduleMap((prev) => {
            const next = new Map(prev);
            next.delete(contents);
            return next;
          });
        },
      }
    );
  };

  const handleOpenEditSchedule = (contents: string) => {
    const info = addedToScheduleMap.get(contents);
    if (!info) return;
    setEditScheduleContents(contents);
    setEditScheduleValue(info.targetDate);
  };

  const handleConfirmEditSchedule = () => {
    if (!editScheduleContents || !editScheduleValue) return;
    const info = addedToScheduleMap.get(editScheduleContents);
    if (!info) return;
    deleteTodoByDate.mutate(
      { id: info.id, date: info.targetDate },
      {
        onSuccess: () => {
          addTodoToDate.mutate(
            { date: editScheduleValue, contents: editScheduleContents },
            {
              onSuccess: (newItem) => {
                setAddedToScheduleMap((prev) =>
                  new Map(prev).set(editScheduleContents, {
                    targetDate: editScheduleValue,
                    id: newItem.id,
                  })
                );
                setEditScheduleContents(null);
                setEditScheduleValue(null);
              },
            }
          );
        },
      }
    );
  };

  const renderAddToScheduleButton = (contents: string) => {
    const info = addedToScheduleMap.get(contents);
    const detailLabel = getScheduleDetailLabel(contents);

    if (info) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/5 transition-colors"
              style={{
                color: COLORS.status.success,
                backgroundColor: `${COLORS.status.success}15`,
              }}
            >
              <CalendarCheck className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {detailLabel && (
              <div
                className="px-2.5 py-2 text-xs border-b"
                style={{ color: COLORS.text.secondary, borderColor: COLORS.border.light }}
              >
                {detailLabel}
              </div>
            )}
            <DropdownMenuItem
              onClick={() => handleOpenEditSchedule(contents)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              일정 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteSchedule(contents)}
              className="flex items-center gap-2 cursor-pointer"
              style={{ color: COLORS.status.error }}
            >
              <Trash2 className="w-4 h-4" />
              일정 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: COLORS.text.tertiary }}
            disabled={addTodoToDate.isPending}
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            onClick={() => handleAddToTomorrow(contents)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            내일 추가하기
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenAddDatePicker(contents)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            다른 날짜에 추가하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderRescheduleButton = (item: TodoListItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: COLORS.text.tertiary }}
          disabled={updateTodoItem.isPending}
        >
          <CalendarPlus className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={() => handlePostponeToTomorrow(item.id)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          내일 추가하기
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleOpenSchedulePicker(item.id)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          다른 날짜에 추가하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="mb-16">
      <ReviewReportHeaderSection />
      <ReviewSummarySection view={view} />
      <ReviewExecutionScoreSection view={view} />
      <ReviewTodayTodosSection
        view={view}
        todoLists={todoLists}
        renderAddToScheduleButton={renderAddToScheduleButton}
        renderRescheduleButton={renderRescheduleButton}
      />
      <ReviewTodoFeedbackSection view={view} />
      <ReviewSuggestedTodosSection
        view={view}
        renderAddToScheduleButton={renderAddToScheduleButton}
      />

      <ReviewScheduleDialogs
        scheduleItemId={scheduleItemId}
        scheduleValue={scheduleValue}
        setScheduleItemId={setScheduleItemId}
        setScheduleValue={setScheduleValue}
        onConfirmSchedule={handleConfirmSchedule}
        addToDateContents={addToDateContents}
        addToDateValue={addToDateValue}
        setAddToDateContents={setAddToDateContents}
        setAddToDateValue={setAddToDateValue}
        onConfirmAddToDate={handleConfirmAddToDate}
        editScheduleContents={editScheduleContents}
        editScheduleValue={editScheduleValue}
        setEditScheduleContents={setEditScheduleContents}
        setEditScheduleValue={setEditScheduleValue}
        onConfirmEditSchedule={handleConfirmEditSchedule}
      />
    </div>
  );
}
