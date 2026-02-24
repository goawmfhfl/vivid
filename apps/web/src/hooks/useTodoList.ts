import { useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "./useCurrentUser";
import { QUERY_KEYS } from "@/constants";
import type { TodoListItem, DailyVividRow } from "@/types/daily-vivid";

function isDailyVividRow(data: unknown): data is DailyVividRow {
  return (
    typeof data === "object" &&
    data !== null &&
    "report_date" in data &&
    "id" in data
  );
}

async function fetchTodoListByDate(date: string): Promise<TodoListItem[]> {
  const userId = await getCurrentUserId();
  const res = await fetch(
    `/api/todo-list/by-date?userId=${userId}&date=${date}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch todo list");
  }
  const { todoLists } = await res.json();
  return Array.isArray(todoLists) ? todoLists : [];
}

/** 해당 날짜의 todo_list_items 조회 (회고 페이지 마운트 시 사용) */
export function useTodoListForDate(date: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, "todo-by-date", date],
    queryFn: () => fetchTodoListByDate(date!),
    enabled: !!date,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

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

// Helper to update all queries matching the date (both by-date and by-id)
function updateCacheForDate(
  queryClient: QueryClient,
  date: string,
  updater: (prev: DailyVividRow) => DailyVividRow
) {
  queryClient.setQueriesData<unknown>(
    { queryKey: [QUERY_KEYS.DAILY_VIVID] },
    (oldData: unknown) => {
      if (!isDailyVividRow(oldData)) return oldData;
      // Update if report_date matches the target date
      if (oldData.report_date === date) {
        return updater(oldData);
      }
      return oldData;
    }
  );
}

export function useCreateTodoList(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createTodoList(date),
    onSuccess: (todoLists) => {
      updateCacheForDate(queryClient, date, (prev) => {
        // 스케줄된 항목 유지 (scheduled_at === 이 날짜)
        const scheduled = (prev?.todoLists ?? []).filter(
          (t) => t.scheduled_at === date
        );
        const merged = [...todoLists, ...scheduled];
        return {
          ...prev,
          todoLists: merged,
          hasNativeTodoList: todoLists.length > 0,
        };
      });
      
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID],
        predicate: (query) => {
            // Invalidate queries that might contain this date
            // We can't check data easily, so broad invalidation for active queries is acceptable
            // or we rely on setQueriesData for immediate update.
            return query.queryKey.includes(QUERY_KEYS.DAILY_VIVID);
        }
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
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      
      const previousData = new Map<unknown, DailyVividRow | undefined>();
      
      // Snapshot previous data
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      updateCacheForDate(queryClient, date, (prev) => {
        if (!prev?.todoLists) return prev;
        return {
          ...prev,
          todoLists: prev.todoLists.map((item) =>
            item.id === id ? { ...item, is_checked } : item
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach((data, queryKey) => {
            queryClient.setQueryData(queryKey as unknown[], data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
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
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });

      const previousData = new Map<unknown, DailyVividRow | undefined>();
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      updateCacheForDate(queryClient, date, (prev) => {
        if (!prev?.todoLists) return prev;
        return {
          ...prev,
          todoLists: prev.todoLists.map((item) =>
            item.id === payload.id
              ? { ...item, ...payload }
              : item
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, _payload, context) => {
        if (context?.previousData) {
            context.previousData.forEach((data, queryKey) => {
                queryClient.setQueryData(queryKey as unknown[], data);
            });
        }
    },
    onSuccess: (updated) => {
      updateCacheForDate(queryClient, date, (prev) => {
        if (!prev?.todoLists) return prev;
        return {
          ...prev,
          todoLists: prev.todoLists.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, "todo-by-date", date] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, "todo-by-date", date] });
    },
  });
}

export function useDeleteTodoItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTodoItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      
      // Optimistic delete
      const previousData = new Map<unknown, DailyVividRow | undefined>();
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      updateCacheForDate(queryClient, date, (prev) => {
          if (!prev?.todoLists) return prev;
          const newLists = prev.todoLists.filter((item) => item.id !== id);
          return {
            ...prev,
            todoLists: newLists,
            hasNativeTodoList: newLists.length > 0,
          };
      });
      
      return { previousData };
    },
    onError: (_err, _id, context) => {
        if (context?.previousData) {
            context.previousData.forEach((data, queryKey) => {
                queryClient.setQueryData(queryKey as unknown[], data);
            });
        }
    },
    onSuccess: (_data, id) => {
      // Logic handled in onMutate (optimistic) and onSettled (invalidation)
      // But we can ensure consistency here too
      updateCacheForDate(queryClient, date, (prev) => {
        if (!prev?.todoLists) return prev;
        return {
          ...prev,
          todoLists: prev.todoLists.filter((item) => item.id !== id),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
  });
}

function applyReorderToCache(
  prev: DailyVividRow,
  itemIds: string[]
): DailyVividRow {
  if (!prev?.todoLists) return prev;
  const byId = new Map(prev.todoLists.map((t) => [t.id, t]));
  const reordered = itemIds
    .map((id) => byId.get(id))
    .filter((t): t is TodoListItem => t != null);
  // Keep items not in itemIds (e.g. optimistic or different category) appended?
  // Usually reorder sends all IDs. If itemIds is partial, we should be careful.
  // Assuming itemIds contains all relevant IDs for the list.
  return { ...prev, todoLists: reordered };
}

export const OPTIMISTIC_ID_PREFIX = "optimistic-todo-";

/** 특정 날짜에 투두 추가 (회고 페이지에서 내일/미래 일정에 추가할 때 사용) */
export function useAddTodoToDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, contents }: { date: string; contents: string }) =>
      addTodoItem(date, contents),
    onMutate: async ({ date, contents }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      
      const previousData = new Map<unknown, DailyVividRow | undefined>();
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      const optimisticId = `${OPTIMISTIC_ID_PREFIX}${Date.now()}`;
      const optimisticItem: TodoListItem = {
        id: optimisticId,
        contents: contents.trim(),
        is_checked: false,
        category: "직접 추가",
        sort_order: 0,
        scheduled_at: null,
      };

      updateCacheForDate(queryClient, date, (prev) => {
          const existing = prev.todoLists ?? [];
          const maxOrder = Math.max(-1, ...existing.map((t) => t.sort_order ?? 0));
          const itemWithOrder = {
            ...optimisticItem,
            sort_order: maxOrder + 1,
          };
          return {
            ...prev,
            todoLists: [...existing, itemWithOrder],
            hasNativeTodoList: true,
          };
      });

      return { previousData, optimisticId, date };
    },
    onError: (_err, { date }, context) => {
        if (context?.previousData) {
            context.previousData.forEach((data, queryKey) => {
                queryClient.setQueryData(queryKey as unknown[], data);
            });
        }
    },
    onSuccess: (newItem, { date }, context) => {
      const optimisticId = context?.optimisticId;
      updateCacheForDate(queryClient, date, (prev) => {
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
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
  });
}

/** id + date로 투두 삭제 (회고 페이지에서 추가한 일정 삭제 시 사용) */
export function useDeleteTodoItemByDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => deleteTodoItem(id),
    onSuccess: (_data, { id, date }) => {
       updateCacheForDate(queryClient, date, (prev) => {
          if (!prev?.todoLists) return prev;
          const newLists = prev.todoLists.filter((item) => item.id !== id);
          return {
            ...prev,
            todoLists: newLists,
            hasNativeTodoList: newLists.length > 0,
          };
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, "todo-by-date", date] });
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID, "todo-by-date", date] });
    },
  });
}

export function useAddTodoItem(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contents: string) => addTodoItem(date, contents),
    onMutate: async (contents) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      
      const previousData = new Map<unknown, DailyVividRow | undefined>();
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      const optimisticId = `${OPTIMISTIC_ID_PREFIX}${Date.now()}`;
      
      updateCacheForDate(queryClient, date, (prev) => {
          const existing = prev?.todoLists ?? [];
          const maxOrder = Math.max(-1, ...existing.map((t) => t.sort_order ?? 0));
          const optimisticItem: TodoListItem = {
            id: optimisticId,
            contents: contents.trim(),
            is_checked: false,
            category: "직접 추가",
            sort_order: maxOrder + 1,
            scheduled_at: null,
          };
          return {
            ...prev,
            todoLists: [...existing, optimisticItem],
            hasNativeTodoList: true,
          };
      });
      
      return { previousData, optimisticId };
    },
    onError: (_err, _contents, context) => {
        if (context?.previousData) {
            context.previousData.forEach((data, queryKey) => {
                queryClient.setQueryData(queryKey as unknown[], data);
            });
        }
    },
    onSuccess: (newItem, _contents, context) => {
      const optimisticId = context?.optimisticId;
      updateCacheForDate(queryClient, date, (prev) => {
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
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
  });
}

export function useReorderTodoItems(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTodoItems,
    onMutate: async (itemIds) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      
      const previousData = new Map<unknown, DailyVividRow | undefined>();
      const queries = queryClient.getQueryCache().findAll({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
      queries.forEach(query => {
          const data = query.state.data;
          if (isDailyVividRow(data) && data.report_date === date) {
              previousData.set(query.queryKey, data as DailyVividRow);
          }
      });

      updateCacheForDate(queryClient, date, (prev) => 
        applyReorderToCache(prev, itemIds)
      );
      
      return { previousData };
    },
    onError: (_err, _itemIds, context) => {
        if (context?.previousData) {
            context.previousData.forEach((data, queryKey) => {
                queryClient.setQueryData(queryKey as unknown[]  , data);
            });
        }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
  });
}
