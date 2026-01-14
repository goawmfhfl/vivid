"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";
import { shouldShowFooter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useNotionPolicies } from "@/hooks/useNotionPolicies";

export function Footer() {
  const pathname = usePathname();
  const isVisible = shouldShowFooter(pathname ?? "");
  const { data: policies, isLoading } = useNotionPolicies();

  if (!isVisible) {
    return null;
  }

  return (
    <footer
      className="w-full border-t"
      style={{
        backgroundColor: COLORS.background.base,
        borderColor: COLORS.border.default,
      }}
    >
      <div
        className={cn(
          SPACING.page.maxWidth,
          "mx-auto",
          SPACING.page.padding,
          "py-10 sm:py-12"
        )}
      >
        <div className="flex flex-col gap-6">
          {/* 회사 / 사업자 정보 블록 */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-1 text-xs sm:text-[0.8rem] leading-relaxed">
              <p
                className="font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                (주)VIVID | 대표이사 최재영
              </p>
              <p style={{ color: COLORS.text.tertiary }}>
                상호:&nbsp;&nbsp;기록연구소
              </p>
              <p style={{ color: COLORS.text.tertiary }}>
                사업자등록번호:&nbsp;&nbsp;208-23-70211
              </p>
              <p style={{ color: COLORS.text.tertiary }}>
                통신판매업 신고번호:&nbsp;&nbsp;2026-고양덕양구-0076
              </p>
              <p style={{ color: COLORS.text.tertiary }}>
                위치:&nbsp;&nbsp;경기도 고양시 덕양구 신원로 60
              </p>
              <p style={{ color: COLORS.text.tertiary }}>
                이메일:&nbsp;&nbsp;
                <a
                  href="mailto:try.grit.official@gmail.com"
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: COLORS.text.secondary }}
                >
                  try.grit.official@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* 하단 링크 / 정책 영역 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-[0.8rem]">
              {isLoading ? (
                <span style={{ color: COLORS.text.tertiary }}>로딩 중...</span>
              ) : policies && policies.length > 0 ? (
                policies.map((policy, index) => (
                  <div key={policy.id} className="flex items-center gap-3">
                    {index > 0 && (
                      <span
                        className="text-[0.7rem]"
                        style={{ color: COLORS.text.muted }}
                      >
                        |
                      </span>
                    )}
                    <Link
                      href={`/policy/${policy.id}`}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {policy.name || policy.title}
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  <span style={{ color: COLORS.text.tertiary }}>
                    이용약관
                  </span>
                  <span
                    className="text-[0.7rem]"
                    style={{ color: COLORS.text.muted }}
                  >
                    |
                  </span>
                  <span style={{ color: COLORS.text.tertiary }}>
                    개인정보처리방침
                  </span>
                  <span
                    className="text-[0.7rem]"
                    style={{ color: COLORS.text.muted }}
                  >
                    |
                  </span>
                  <span style={{ color: COLORS.text.tertiary }}>회사소개</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
