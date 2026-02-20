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

export type UpdateTodoItemPayload = {
  id: string;
  is_checked?: boolean;
  contents?: string;
  scheduled_at?: string | null;
};

async function updateTodoItem(
  payload: UpdateTodoItemPayload
): Promise<TodoListItem> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update todo");
  }
  const { data } = await res.json();
  return data;
}

async function deleteTodoItem(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete todo");
  }
}

async function reorderTodoItems(itemIds: string[]): Promise<void> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemIds, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to reorder todos");
  }
}

async function addTodoItem(
  date: string,
  contents: string
): Promise<TodoListItem> {
  const userId = await getCurrentUserId();
  const res = await fetch("/api/todo-list/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, date, contents }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add todo");
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
        (prev) => {
          if (!prev) return null;
          // 스케줄된 항목 유지 (scheduled_at === 이 날짜)
          const scheduled = (prev.todoLists ?? []).filter(
            (t) => t.scheduled_at === date
          );
          const merged = [...todoLists, ...scheduled];
          return {
            ...prev,
            todoLists: merged,
            hasNativeTodoList: todoLists.length > 0,
          };
        }
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

export function useUpdateTodoItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodoItem,
    onMutate: async (payload) => {
      if (payload.contents === undefined && payload.scheduled_at === undefined)
        return undefined;
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
              item.id === payload.id
                ? { ...item, ...payload }
                : item
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(
          [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
          context.previous
        );
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) => {
          if (!prev?.todoLists) return prev;
          return {
            ...prev,
            todoLists: prev.todoLists.map((item) =>
              item.id === updated.id ? { ...item, ...updated } : item
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
  });
}

export function useDeleteTodoItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTodoItem,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) => {
          if (!prev?.todoLists) return prev;
          return {
            ...prev,
            todoLists: prev.todoLists.filter((item) => item.id !== id),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
  });
}

function applyReorderToCache(
  prev: DailyVividRow | null,
  itemIds: string[]
): DailyVividRow | null {
  if (!prev?.todoLists) return prev;
  const byId = new Map(prev.todoLists.map((t) => [t.id, t]));
  const reordered = itemIds
    .map((id) => byId.get(id))
    .filter((t): t is TodoListItem => t != null);
  return { ...prev, todoLists: reordered };
}

const OPTIMISTIC_ID_PREFIX = "optimistic-todo-";

/** 특정 날짜에 투두 추가 (회고 페이지에서 내일/미래 일정에 추가할 때 사용) */
export function useAddTodoToDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, contents }: { date: string; contents: string }) =>
      addTodoItem(date, contents),
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
  });
}

/** id + date로 투두 삭제 (회고 페이지에서 추가한 일정 삭제 시 사용) */
export function useDeleteTodoItemByDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => deleteTodoItem(id),
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
  });
}

export function useAddTodoItem(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contents: string) => addTodoItem(date, contents),
    onMutate: async (contents) => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
      });
      const previous = queryClient.getQueryData<DailyVividRow | null>([
        QUERY_KEYS.DAILY_VIVID,
        date,
        "vivid",
      ]);
      const optimisticId = `${OPTIMISTIC_ID_PREFIX}${Date.now()}`;
      const optimisticItem: TodoListItem = {
        id: optimisticId,
        contents: contents.trim(),
        is_checked: false,
        category: "직접 추가",
        sort_order: 0,
        scheduled_at: null,
      };
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) => {
          if (!prev) {
            return {
              todoLists: [optimisticItem],
              hasNativeTodoList: true,
            } as DailyVividRow;
          }
          const existing = prev.todoLists ?? [];
          return {
            ...prev,
            todoLists: [...existing, optimisticItem],
            hasNativeTodoList: true,
          };
        }
      );
      return { previous, optimisticId };
    },
    onError: (_err, _contents, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(
          [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
          context.previous
        );
      }
    },
    onSuccess: (newItem, _contents, context) => {
      const optimisticId = context?.optimisticId;
      queryClient.setQueryData<DailyVividRow | null>(
        [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
        (prev) => {
          if (!prev?.todoLists) return prev;
          const existing = prev.todoLists ?? [];
          const updated = optimisticId
            ? existing.map((t) => (t.id === optimisticId ? newItem : t))
            : existing.some((t) => t.id === newItem.id)
              ? existing.map((t) => (t.id === newItem.id ? newItem : t))
              : [...existing, newItem];
          return {
            ...prev,
            todoLists: updated,
            hasNativeTodoList: true,
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, date],
      });
    },
  });
}

export function useReorderTodoItems(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTodoItems,
    onMutate: async (itemIds) => {
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
        (prev) => applyReorderToCache(prev ?? null, itemIds)
      );
      return { previous };
    },
    onError: (_err, _itemIds, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(
          [QUERY_KEYS.DAILY_VIVID, date, "vivid"],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date, "vivid"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, date] });
    },
  });
}
