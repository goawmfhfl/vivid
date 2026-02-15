import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "./useCurrentUser";
import { QUERY_KEYS } from "@/constants";
import type { TodoListItem, DailyVividRow } from "@/types/daily-vivid";

async function createTodoList(date: string): Promise<TodoListItem[]> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, date }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create todo list");
  }
  const { data } = await res.json();
  return data;
}

async function updateTodoCheck(
  id: string,
  is_checked: boolean
): Promise<TodoListItem> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, is_checked, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update todo");
  }
  const { data } = await res.json();
  return data;
}

export function useCreateTodoList(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createTodoList(date),
    onSuccess: (todoLists) => {
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) =>
          prev ? { ...prev, todoLists } : null
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date],
      });
    },
  });
}

export function useUpdateTodoCheck(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_checked }: { id: string; is_checked: boolean }) =>
      updateTodoCheck(id, is_checked),
    onMutate: async ({ id, is_checked }) => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
      });
      const previous = queryClient.getQueryData<DailyVividRow | null>([
        QUERY_KEYS.DAILY_VIVID,
        date,
        "vivid",
      ]);
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) => {
          if (!prev?.todoLists) return prev;
          return {
            ...prev,
            todoLists: prev.todoLists.map((item) =>
              item.id === id ? { ...item, is_checked } : item
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(
          [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date],
      });
    },
  });
}
