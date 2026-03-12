"use client";

import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/design-system";

interface PreviewDataNoticeProps {
  /** 두 번째 줄 문구 (예: "꿈 일치도 데이터가 쌓이면 나의 기록이 표시됩니다") */
  subtitle: string;
  /** 강조색 (12 투명도 배경용, 기본: brand.primary) */
  accentColor?: string;
  /** Pro 멤버 안내 + 멤버십 이동 버튼 노출 여부 */
  showProCta?: boolean;
}

/**
 * 미리보기 데이터 안내 - 두 번째 사진 형식의 통일된 UI
 * 넓은 라운드 박스, "아래는 미리보기 데이터입니다" + 컨텍스트별 부제
 */
export function PreviewDataNotice({
  subtitle,
  accentColor = COLORS.brand.primary,
  showProCta = false,
}: PreviewDataNoticeProps) {
  const router = useRouter();

  return (
    <div
      className="w-full px-4 py-2.5 rounded-xl mb-4"
      style={{
        backgroundColor: `${accentColor}12`,
        border: `1px solid ${COLORS.border.light}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-medium" style={{ color: COLORS.text.primary }}>
          아래는 미리보기 데이터입니다
        </p>
        <p className="text-xs" style={{ color: COLORS.text.secondary }}>
          {subtitle}
          {showProCta && (
            <>
              <br/>
              <span style={{ color: COLORS.text.tertiary }}>
                Pro 멤버만 실제 데이터를 확인할 수 있어요
              </span>
            </>
          )}
        </p>
        {showProCta && (
          <button
            type="button"
            onClick={() => router.push("/membership")}
            className="mt-0.5 text-xs font-medium underline transition-opacity hover:opacity-80 active:opacity-70"
            style={{ color: COLORS.brand.primary }}
          >
            Pro 멤버십 보기
          </button>
        )}
      </div>
    </div>
  );
}
