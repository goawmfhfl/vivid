"use client";

import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, Pencil, Calendar, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COLORS, TYPOGRAPHY, FONTS } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  useUpdateTodoCheck,
  useUpdateTodoItem,
  useDeleteTodoItem,
} from "@/hooks/useTodoList";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TodoListItem } from "@/types/daily-vivid";
import { format, parseISO, differenceInDays } from "date-fns";
import { getKSTDate } from "@/lib/date-utils";
import { ScheduleDatePicker } from "./ScheduleDatePicker";

interface TodoItemRowProps {
  item: TodoListItem;
  date: string;
}

export function TodoItemRow({ item, date }: TodoItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.contents);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scheduleValue, setScheduleValue] = useState<string | null>(
    item.scheduled_at
      ? format(parseISO(item.scheduled_at), "yyyy-MM-dd")
      : null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTodoCheck = useUpdateTodoCheck(date);
  const updateTodoItem = useUpdateTodoItem(date);
  const deleteTodoItem = useDeleteTodoItem(date);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) setEditValue(item.contents);
  }, [item.contents, isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.contents) {
      updateTodoItem.mutate({ id: item.id, contents: trimmed });
      setEditValue(trimmed);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditValue(item.contents);
    }
  };

  const handleSaveSchedule = () => {
    updateTodoItem.mutate({
      id: item.id,
      scheduled_at: scheduleValue,
    });
    setShowScheduleDialog(false);
  };

  const handleClearSchedule = () => {
    setScheduleValue(null);
    updateTodoItem.mutate({
      id: item.id,
      scheduled_at: null,
    });
    setShowScheduleDialog(false);
  };

  const handleDeleteConfirm = () => {
    deleteTodoItem.mutate(item.id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  // 현재 보고 있는 날짜가 스케줄된 날짜인지 (같으면 체크박스, 다르면 캘린더)
  const scheduledDateIso = item.scheduled_at
    ? format(parseISO(item.scheduled_at), "yyyy-MM-dd")
    : null;
  const isViewingOnScheduledDate =
    !!scheduledDateIso && !!date && scheduledDateIso === date;

  // "N일 후 진행 예정" 라벨 (오늘 목록에서 미룬 항목에만 표시)
  const scheduleInfo =
    item.scheduled_at && !isViewingOnScheduledDate
      ? (() => {
          const scheduled = parseISO(item.scheduled_at);
          const scheduledDate = new Date(
            scheduled.getFullYear(),
            scheduled.getMonth(),
            scheduled.getDate()
          );
          const viewDate = date ? new Date(`${date}T00:00:00`) : getKSTDate();
          const viewDateOnly = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            viewDate.getDate()
          );
          const diff = differenceInDays(scheduledDate, viewDateOnly);
          if (diff === 0) return { label: "오늘 예정", isOverdue: false };
          if (diff === 1) return { label: "내일 예정", isOverdue: false };
          if (diff > 1 && diff <= 365)
            return { label: `${diff}일 후 진행 예정`, isOverdue: false };
          if (diff < 0) return { label: `${Math.abs(diff)}일 지남`, isOverdue: true };
          return { label: `${diff}일 후 진행 예정`, isOverdue: false };
        })()
      : null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-start gap-2.5 py-2 group rounded-lg transition-colors",
          isDragging && "opacity-50 bg-black/5"
        )}
      >
        {/* 스케줄된 날짜에서 보면 체크박스, 다른 날짜에서 보면 캘린더 */}
        <div className="flex-shrink-0 pt-0.5">
          {item.scheduled_at && !isViewingOnScheduledDate ? (
            <button
              type="button"
              onClick={() =>
                updateTodoCheck.mutate({
                  id: item.id,
                  is_checked: !item.is_checked,
                })
              }
              disabled={updateTodoCheck.isPending}
              className="flex w-[18px] h-[18px] items-center justify-center rounded hover:opacity-80 transition-opacity"
              style={{
                color: item.is_checked
                  ? COLORS.text.tertiary
                  : COLORS.brand.primary,
              }}
              aria-label={item.is_checked ? "완료 취소" : "완료"}
            >
              <Calendar className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              role="checkbox"
              aria-checked={item.is_checked}
              onClick={() =>
                updateTodoCheck.mutate({
                  id: item.id,
                  is_checked: !item.is_checked,
                })
              }
              disabled={updateTodoCheck.isPending}
              className="w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: item.is_checked
                  ? COLORS.brand.primary
                  : COLORS.border.light,
                backgroundColor: item.is_checked
                  ? COLORS.brand.primary
                  : "transparent",
              }}
            >
              {item.is_checked && (
                <Check className="w-2.5 h-2.5" style={{ color: COLORS.text.white }} />
              )}
            </button>
          )}
        </div>

        {/* 내용 - 수정 시 기존 UI 그대로 인라인 편집, 길게 누르면 순서 변경 가능 */}
        <div
          {...(!isEditing ? { ...attributes, ...listeners } : {})}
          className={cn(
            "flex-1 min-w-0",
            !isEditing && "cursor-grab active:cursor-grabbing"
          )}
        >
          <div className="space-y-0.5">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    setEditValue(item.contents);
                    setIsEditing(false);
                  }
                }}
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.bodySmall.fontWeight,
                  "w-full block break-words leading-relaxed bg-transparent outline-none border-none focus:ring-0 focus:outline-none p-0 m-0 appearance-none"
                )}
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  lineHeight: 1.625,
                  color: COLORS.text.primary,
                  textDecoration: item.is_checked ? "line-through" : "none",
                  opacity: item.is_checked ? 0.7 : 1,
                  caretColor: COLORS.text.primary,
                  boxShadow: "none",
                  WebkitAppearance: "none",
                } as React.CSSProperties}
              />
            ) : (
              <span
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.bodySmall.fontWeight,
                  "block break-words whitespace-pre-wrap leading-relaxed"
                )}
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  lineHeight: 1.625,
                  color: COLORS.text.primary,
                  textDecoration: item.is_checked ? "line-through" : "none",
                  opacity: item.is_checked ? 0.7 : 1,
                }}
              >
                {item.contents}
              </span>
            )}
            {scheduleInfo && !item.is_checked && (
              <div
                style={{
                  color: scheduleInfo.isOverdue
                    ? COLORS.status.error
                    : COLORS.text.tertiary,
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                }}
              >
                {scheduleInfo.label}
              </div>
            )}
          </div>
        </div>

        {/* 더보기 메뉴 (수정 / 일정 / 삭제) */}
        {!isEditing && (
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex-shrink-0 p-1.5 rounded hover:bg-black/5 transition-colors"
                style={{ color: COLORS.text.muted }}
                aria-label="더보기"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setScheduleValue(
                    item.scheduled_at
                      ? format(parseISO(item.scheduled_at), "yyyy-MM-dd")
                      : null
                  );
                  setShowScheduleDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                일정 바꾸기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteTodoItem.isPending}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="max-w-md"
          style={{
            backgroundColor: COLORS.background.base,
            border: `1.5px solid ${COLORS.border.light}`,
            borderRadius: "16px",
            boxShadow: `
              0 4px 16px rgba(0,0,0,0.12),
              0 2px 8px rgba(0,0,0,0.08)
            `,
            width: "max(280px, min(448px, calc(100vw - 730px)))",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                color: COLORS.text.primary,
                fontWeight: "600",
              }}
            >
              이 항목을 삭제할까요?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{
                color: COLORS.text.secondary,
                lineHeight: "1.5",
              }}
            >
              삭제된 항목은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div
            className="flex flex-row items-stretch gap-3 mt-4"
            style={{ minHeight: "44px" }}
          >
            <AlertDialogCancel
              className="!mt-0 flex-1 flex items-center justify-center h-11 min-h-11 rounded-lg border font-medium"
              style={{
                color: COLORS.text.secondary,
                borderColor: COLORS.border.input,
                backgroundColor: COLORS.background.hover,
                fontWeight: "500",
              }}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteTodoItem.isPending}
              className="!mt-0 flex-1 flex items-center justify-center h-11 min-h-11 rounded-lg font-semibold"
              style={{
                backgroundColor: deleteTodoItem.isPending
                  ? COLORS.border.light
                  : COLORS.status.error,
                color: COLORS.text.white,
                fontWeight: "600",
              }}
            >
              {deleteTodoItem.isPending ? "삭제 중..." : "삭제하기"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* 일정 수정 다이얼로그 - 커스텀 달력 */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[320px] p-4">
          <DialogTitle className="sr-only">일정 선택</DialogTitle>
          <ScheduleDatePicker
            value={scheduleValue}
            onChange={setScheduleValue}
            onConfirm={handleSaveSchedule}
            onCancel={() => setShowScheduleDialog(false)}
            onClear={handleClearSchedule}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
