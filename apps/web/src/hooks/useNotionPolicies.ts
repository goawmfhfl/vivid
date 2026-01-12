import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";

type PolicyData = {
  id: string;
  name: string;
  title: string;
  type: string;
  url: string;
  created_time: string;
  last_edited_time: string;
};

/**
 * 노션 정책 데이터 조회 훅
 */
export function useNotionPolicies() {
  return useQuery<PolicyData[]>({
    queryKey: [QUERY_KEYS.NOTION_POLICIES],
    queryFn: async () => {
      const response = await fetch("/api/notion/policy");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "정책 데이터를 불러오는데 실패했습니다.");
      }

      const result = await response.json();
      return result.data as PolicyData[];
    },
    staleTime: 1000 * 60 * 10, // 10분간 캐시 유지
    retry: 1,
  });
}
