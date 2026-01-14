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
  const isDev = process.env.NODE_ENV === "development";

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
    // 개발 환경에서는 요청마다 최신, 프로덕션에서는 매우 길게 캐시
    staleTime: isDev ? 0 : 1000 * 60 * 60 * 24 * 30, // 30일
    retry: 1,
  });
}
