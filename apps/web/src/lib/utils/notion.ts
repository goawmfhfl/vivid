/**
 * 노션 페이지 ID 추출 및 포맷팅 유틸리티
 */

/**
 * 노션 URL에서 페이지 ID 추출
 */
export function extractNotionPageId(url: string): string | null {
  // 노션 URL 형식: https://www.notion.so/workspace/PageId?v=...
  const match = url.match(/notion\.so\/[^\/]+\/([a-f0-9]{32})/);
  if (match && match[1]) {
    return match[1];
  }
  
  // 이미 ID 형식인 경우 (32자리 hex)
  if (/^[a-f0-9]{32}$/i.test(url)) {
    return url;
  }
  
  return null;
}

/**
 * 노션 페이지 ID를 표준 형식으로 포맷팅 (하이픈 추가)
 * 노션 API는 하이픈이 포함된 UUID 형식을 요구합니다.
 */
export function formatNotionPageId(pageId: string): string {
  if (!pageId) return pageId;
  
  // 하이픈 제거 후 다시 포맷팅 (일관성 유지)
  const cleanedId = pageId.replace(/-/g, "");
  
  // 32자리 hex를 8-4-4-4-12 형식으로 변환
  if (cleanedId.length === 32 && /^[a-f0-9]{32}$/i.test(cleanedId)) {
    return `${cleanedId.slice(0, 8)}-${cleanedId.slice(8, 12)}-${cleanedId.slice(12, 16)}-${cleanedId.slice(16, 20)}-${cleanedId.slice(20, 32)}`;
  }
  
  // 이미 올바른 형식이거나 다른 형식인 경우 그대로 반환
  return pageId;
}
