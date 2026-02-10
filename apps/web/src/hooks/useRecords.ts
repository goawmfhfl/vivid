import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, ERROR_MESSAGES } from "@/constants";
import {
  isRefreshTokenError,
  clearSessionOnRefreshTokenError,
} from "@/lib/auth-error";
import type { Session } from "@supabase/supabase-js";

// Record 타입 정의
export interface EmotionRecordPayload {
  intensity: number;
  keywords: string[];
  factors: string[];
  reasonText?: string | null;
}

export interface Record {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  kst_date: string;
  type?: string | null;
  emotion?: EmotionRecordPayload | null;
}

// Record 생성 데이터 타입
export interface CreateRecordData {
  content: string;
  type: string;
  kst_date?: string; // YYYY-MM-DD 형식, 선택적
  emotion?: EmotionRecordPayload;
}

// Record 업데이트 데이터 타입
export interface UpdateRecordData {
  content?: string;
  type?: string;
  emotion?: EmotionRecordPayload;
}

// 커스텀 에러 클래스
class RecordError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "RecordError";
  }
}

// getSession 시 리프레시 토큰 에러면 세션 정리 후 로그인 필요 에러만 던짐
const getSessionForRecords = async (): Promise<Session> => {
  const { data, error } = await supabase.auth.getSession();
  if (error && isRefreshTokenError(error)) {
    await clearSessionOnRefreshTokenError();
    throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
  }
  if (!data?.session) throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
  return data.session;
};

// Records 조회 함수
const fetchRecords = async (): Promise<Record[]> => {
  try {
    const session = await getSessionForRecords();

    // API 라우트를 통해 조회 (서버 사이드에서 복호화)
    const response = await fetch("/api/vivid-records", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new RecordError(
        errorData.error || ERROR_MESSAGES.RECORD_FETCH_FAILED
      );
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof RecordError) throw error;
    if (isRefreshTokenError(error)) {
      await clearSessionOnRefreshTokenError();
      throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }
    console.error("기록 조회 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Record 생성 함수
const createRecord = async (data: CreateRecordData): Promise<Record> => {
  try {
    const session = await getSessionForRecords();

    // API 라우트를 통해 생성 (서버 사이드에서 암호화)
    const response = await fetch("/api/vivid-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        content: data.content,
        type: data.type,
        emotion: data.emotion,
        ...(data.kst_date && { kst_date: data.kst_date }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new RecordError(
        errorData.error || ERROR_MESSAGES.RECORD_CREATE_FAILED
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof RecordError) throw error;
    if (isRefreshTokenError(error)) {
      await clearSessionOnRefreshTokenError();
      throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }
    console.error("기록 생성 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Record 업데이트 함수
const updateRecord = async (
  id: number,
  data: UpdateRecordData
): Promise<Record> => {
  try {
    const session = await getSessionForRecords();

    // API 라우트를 통해 수정 (서버 사이드에서 암호화)
    const response = await fetch(`/api/vivid-records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new RecordError(
        errorData.error || ERROR_MESSAGES.RECORD_UPDATE_FAILED
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof RecordError) throw error;
    if (isRefreshTokenError(error)) {
      await clearSessionOnRefreshTokenError();
      throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }
    console.error("기록 수정 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Record 삭제 함수
const deleteRecord = async (id: number): Promise<void> => {
  try {
    const session = await getSessionForRecords();

    // API 라우트를 통해 삭제
    const response = await fetch(`/api/vivid-records/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new RecordError(
        errorData.error || ERROR_MESSAGES.RECORD_DELETE_FAILED
      );
    }
  } catch (error) {
    if (error instanceof RecordError) throw error;
    if (isRefreshTokenError(error)) {
      await clearSessionOnRefreshTokenError();
      throw new RecordError(ERROR_MESSAGES.LOGIN_REQUIRED);
    }
    console.error("기록 삭제 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Records 조회 훅
export const useRecords = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECORDS],
    queryFn: fetchRecords,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Record 생성 훅
export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecord,
    onSuccess: (newRecord) => {
      // RECORDS 쿼리 캐시에 새 record 추가
      queryClient.setQueryData<Record[]>(
        [QUERY_KEYS.RECORDS],
        (oldRecords = []) => {
          // 중복 체크 (같은 id가 이미 있는 경우)
          const exists = oldRecords.some((r) => r.id === newRecord.id);
          if (exists) {
            return oldRecords;
          }
          // 새 기록을 배열의 첫 번째에 추가
          return [newRecord, ...oldRecords];
        }
      );

      // useRecordsAndFeedbackDates의 recordDates 업데이트
      queryClient.setQueryData<{
        recordDates: string[];
        aiFeedbackDates: string[];
        vividFeedbackDates: string[];
        reviewFeedbackDates: string[];
      }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
        if (!oldData) {
          return {
            recordDates: [newRecord.kst_date],
            aiFeedbackDates: [],
            vividFeedbackDates: [],
            reviewFeedbackDates: [],
          };
        }

        const recordDates = oldData.recordDates;
        const aiFeedbackDates = oldData.aiFeedbackDates ?? [];
        const vividFeedbackDates = oldData.vividFeedbackDates ?? [];
        const reviewFeedbackDates = oldData.reviewFeedbackDates ?? [];
        // 날짜가 이미 있는지 확인
        if (!recordDates.includes(newRecord.kst_date)) {
          const updatedRecordDates = [
            ...recordDates,
            newRecord.kst_date,
          ].sort();
          return {
            recordDates: updatedRecordDates,
            aiFeedbackDates,
            vividFeedbackDates,
            reviewFeedbackDates,
          };
        }
        return oldData;
      });

      // Q3 입력 직후 리뷰 탭 버튼 상태 반영: 해당 날짜 daily-vivid·기록 날짜 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DAILY_VIVID, newRecord.kst_date],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RECORDS, "dates", "all"],
      });
    },
    onError: (error: RecordError) => {
      console.error("기록 생성 실패:", error.message);
    },
  });
};

// Record 업데이트 훅
export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecordData }) =>
      updateRecord(id, data),
    onSuccess: (updatedRecord) => {
      const previousRecords =
        queryClient.getQueryData<Record[]>([QUERY_KEYS.RECORDS]) || [];

      // RECORDS 쿼리 캐시에서 해당 id의 record를 업데이트
      queryClient.setQueryData<Record[]>(
        [QUERY_KEYS.RECORDS],
        (oldRecords = []) => {
          return oldRecords.map((record) =>
            record.id === updatedRecord.id ? updatedRecord : record
          );
        }
      );

      // 날짜가 변경된 경우 useRecordsAndFeedbackDates도 업데이트
      const oldRecord = previousRecords.find((r) => r.id === updatedRecord.id);

      if (oldRecord && oldRecord.kst_date !== updatedRecord.kst_date) {
        // 이전 날짜에 다른 record가 있는지 확인
        const hasOtherRecordsOnOldDate = previousRecords.some(
          (r) => r.id !== updatedRecord.id && r.kst_date === oldRecord.kst_date
        );

        queryClient.setQueryData<{
          recordDates: string[];
          aiFeedbackDates: string[];
          vividFeedbackDates: string[];
          reviewFeedbackDates: string[];
        }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
          if (!oldData) {
            return oldData;
          }

          let { recordDates } = oldData;

          // 이전 날짜에 다른 record가 없으면 제거
          if (
            !hasOtherRecordsOnOldDate &&
            recordDates.includes(oldRecord.kst_date)
          ) {
            recordDates = recordDates.filter(
              (date) => date !== oldRecord.kst_date
            );
          }

          // 새 날짜 추가 (없는 경우만)
          if (!recordDates.includes(updatedRecord.kst_date)) {
            recordDates = [...recordDates, updatedRecord.kst_date].sort();
          }

          return {
            recordDates,
            aiFeedbackDates: oldData.aiFeedbackDates ?? [],
            vividFeedbackDates: oldData.vividFeedbackDates ?? [],
            reviewFeedbackDates: oldData.reviewFeedbackDates ?? [],
          };
        });
      }
    },
    onError: (error: RecordError) => {
      console.error("기록 수정 실패:", error.message);
    },
  });
};

// Record 삭제 훅
export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: (_data, deletedId) => {
      // 삭제 전에 record 정보 가져오기 (날짜 확인용)
      const records =
        queryClient.getQueryData<Record[]>([QUERY_KEYS.RECORDS]) || [];
      const deletedRecord = records.find((r) => r.id === deletedId);

      if (!deletedRecord) {
        // 캐시에 없는 경우 무효화로 폴백
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
        return;
      }

      // 해당 날짜에 다른 record가 있는지 확인 (삭제 전)
      const hasOtherRecordsOnDate = records.some(
        (r) => r.id !== deletedId && r.kst_date === deletedRecord.kst_date
      );

      // RECORDS 쿼리 캐시에서 해당 id의 record 제거
      queryClient.setQueryData<Record[]>(
        [QUERY_KEYS.RECORDS],
        (oldRecords = []) => {
          return oldRecords.filter((record) => record.id !== deletedId);
        }
      );

      // 해당 날짜에 다른 record가 없는 경우 recordDates에서 날짜 제거
      if (!hasOtherRecordsOnDate) {
        queryClient.setQueryData<{
          recordDates: string[];
          aiFeedbackDates: string[];
          vividFeedbackDates: string[];
          reviewFeedbackDates: string[];
        }>([QUERY_KEYS.RECORDS, "dates", "all"], (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const recordDates = oldData.recordDates;
          const aiFeedbackDates = oldData.aiFeedbackDates ?? [];
          const vividFeedbackDates = oldData.vividFeedbackDates ?? [];
          const reviewFeedbackDates = oldData.reviewFeedbackDates ?? [];
          const updatedRecordDates = recordDates.filter(
            (date) => date !== deletedRecord.kst_date
          );

          return {
            recordDates: updatedRecordDates,
            aiFeedbackDates,
            vividFeedbackDates,
            reviewFeedbackDates,
          };
        });
      }
    },
    onError: (error: RecordError) => {
      console.error("기록 삭제 실패:", error.message);
    },
  });
};
