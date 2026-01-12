/**
 * name을 URL-friendly한 slug로 변환하는 공통 유틸리티
 */
export function nameToSlug(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-가-힣]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
