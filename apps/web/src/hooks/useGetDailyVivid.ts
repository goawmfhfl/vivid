import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyVividRow } from "@/types/daily-vivid";

export type DailyVividGenerationType = "vivid" | "review";

const fetchDailyVividByDate = async (
  date: string,
  generationType: DailyVividGenerationType = "vivid"
): Promise<DailyVividRow | null> => {
  const userId = await getCurrentUserId();

  const response = await fetch(
    `/api/daily-vivid/by-date?userId=${userId}&date=${date}&generation_type=${generationType}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch daily vivid");
  }

  const result = await response.json();
  // vivid가 없어도 스케줄된 todo가 있으면 todoLists만 있는 객체 반환
  if (result.data) {
    return {
      ...result.data,
      hasNativeTodoList: result.data.hasNativeTodoList ?? false,
    } as DailyVividRow;
  }
  if (result.todoLists?.length) {
    return {
      todoLists: result.todoLists,
      hasNativeTodoList: result.hasNativeTodoList ?? false,
    } as DailyVividRow;
  }
  if (Array.isArray(result.todoLists)) {
    return {
      todoLists: result.todoLists,
      hasNativeTodoList: result.hasNativeTodoList ?? false,
    } as DailyVividRow;
  }
  return null;
};

const fetchDailyVividById = async (
  id: string,
  retryCount = 0
): Promise<DailyVividRow | null> => {
  // id 유효성 검사
  if (!id || id === "undefined" || id === "null" || id.trim() === "") {
    throw new Error("Invalid feedback ID");
  }

  // UUID 형식 검사 (간단한 검사)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const userId = await getCurrentUserId();

  // userId도 유효성 검사
  if (!userId || userId === "undefined" || userId.trim() === "") {
    throw new Error("Invalid user ID");
  }

  // 서버 사이드 API를 통해 조회 (복호화는 서버에서 수행)
  const response = await fetch(`/api/daily-vivid/${id}?userId=${userId}`);

  if (!response.ok) {
    if (response.status === 404) {
      // 생성 직후 조회 시 DB 동기화 지연 가능성 - 재시도
      if (retryCount < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return fetchDailyVividById(id, retryCount + 1);
      }
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch daily vivid");
  }

  const result = await response.json();
  return result.data || null;
};

export const useGetDailyVivid = (
  date: string,
  generationType: DailyVividGenerationType = "vivid"
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, date, generationType],
    queryFn: () => fetchDailyVividByDate(date, generationType),
    enabled: !!date,
    staleTime: 0, // 보기/생성하기 버튼 상태 정확도를 위해 항상 최신 데이터
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
  });
};

export const useGetDailyVividById = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, "id", id],
    queryFn: () => (id ? fetchDailyVividById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
