import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";

// Record 타입 정의
export interface Record {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  kst_date: string;
}

// Record 생성 데이터 타입
export interface CreateRecordData {
  content: string;
}

// Record 업데이트 데이터 타입
export interface UpdateRecordData {
  content?: string;
}

// 커스텀 에러 클래스
class RecordError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "RecordError";
  }
}

// 현재 사용자 ID 가져오기 함수는 useCurrentUser 훅에서 import

// Records 조회 함수
const fetchRecords = async (): Promise<Record[]> => {
  try {
    // 세션 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new RecordError("로그인이 필요합니다.");
    }

    // API 라우트를 통해 조회 (서버 사이드에서 복호화)
    const response = await fetch("/api/records", {
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
    if (error instanceof RecordError) {
      throw error;
    }
    console.error("기록 조회 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Record 생성 함수
const createRecord = async (data: CreateRecordData): Promise<Record> => {
  try {
    // 세션 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new RecordError("로그인이 필요합니다.");
    }

    // API 라우트를 통해 생성 (서버 사이드에서 암호화)
    const response = await fetch("/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ content: data.content }),
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
    if (error instanceof RecordError) {
      throw error;
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
    // 세션 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new RecordError("로그인이 필요합니다.");
    }

    // API 라우트를 통해 수정 (서버 사이드에서 암호화)
    const response = await fetch(`/api/records/${id}`, {
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
    if (error instanceof RecordError) {
      throw error;
    }
    console.error("기록 수정 중 예상치 못한 에러:", error);
    throw new RecordError(ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
};

// Record 삭제 함수
const deleteRecord = async (id: number): Promise<void> => {
  try {
    // 세션 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new RecordError("로그인이 필요합니다.");
    }

    // API 라우트를 통해 삭제
    const response = await fetch(`/api/records/${id}`, {
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
    if (error instanceof RecordError) {
      throw error;
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
  });
};

// Record 생성 훅
export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      // 성공 시 records 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
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
    onSuccess: () => {
      // 성공 시 records 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
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
    onSuccess: () => {
      // 성공 시 records 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORDS] });
    },
    onError: (error: RecordError) => {
      console.error("기록 삭제 실패:", error.message);
    },
  });
};
