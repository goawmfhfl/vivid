/**
 * 진행 상황 콜백 타입
 */
export type ProgressCallback = (
  step: number,
  total: number,
  sectionName: string
) => void;
