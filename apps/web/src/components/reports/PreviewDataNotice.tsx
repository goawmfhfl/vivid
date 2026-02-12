"use client";

import { COLORS } from "@/lib/design-system";

interface PreviewDataNoticeProps {
  /** 두 번째 줄 문구 (예: "꿈 일치도 데이터가 쌓이면 나의 기록이 표시됩니다") */
  subtitle: string;
  /** 강조색 (12 투명도 배경용, 기본: brand.primary) */
  accentColor?: string;
}

/**
 * 미리보기 데이터 안내 - 두 번째 사진 형식의 통일된 UI
 * 넓은 라운드 박스, "아래는 미리보기 데이터입니다" + 컨텍스트별 부제
 */
export function PreviewDataNotice({
  subtitle,
  accentColor = COLORS.brand.primary,
}: PreviewDataNoticeProps) {
  return (
    <div
      className="w-full px-4 py-2.5 text-center rounded-xl mb-4"
      style={{
        backgroundColor: `${accentColor}12`,
        border: `1px solid ${COLORS.border.light}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <p className="text-xs font-medium" style={{ color: COLORS.text.primary }}>
        아래는 미리보기 데이터입니다
      </p>
      <p className="text-xs mt-0.5" style={{ color: COLORS.text.secondary }}>
        {subtitle}
      </p>
    </div>
  );
}
