import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";

type QuestionData = {
  id: string;
  name: string;
  title: string;
  type: string;
  url: string;
  created_time: string;
  last_edited_time: string;
};

/**
 * 노션 자주 묻는 질문 데이터 조회 훅
 */
export function useNotionQuestions() {
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  return useQuery<QuestionData[]>({
    queryKey: [QUERY_KEYS.NOTION_QUESTIONS],
    queryFn: async () => {
      const response = await fetch("/api/notion/questions");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "질문 데이터를 불러오는데 실패했습니다."
        );
      }

      const result = await response.json();
      return result.data as QuestionData[];
    },
    // 개발 환경에서는 요청마다 최신, 프로덕션에서는 매우 길게 캐시
    staleTime: isDev ? 0 : 1000 * 60 * 60 * 24 * 30, // 30일
    retry: 1,
  });
}
