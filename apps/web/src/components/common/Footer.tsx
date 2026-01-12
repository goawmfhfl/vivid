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
      className="w-full"
      style={{
        backgroundColor: COLORS.background.base,
      }}
    >
      <div
        className={cn(
          SPACING.page.maxWidth,
          "mx-auto",
          SPACING.page.padding,
          "py-12 sm:py-16"
        )}
      >
        <div className="flex flex-col gap-8">
          {/* 회사명 및 정책 링크 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p
                className={cn(
                  TYPOGRAPHY.h4.fontSize,
                  TYPOGRAPHY.h4.fontWeight,
                  "mb-1"
                )}
                style={{ color: COLORS.text.primary }}
              >
                (주)VIVID
              </p>
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.tertiary }}
              >
                대표이사 최재영
              </p>
            </div>

            {/* 노션에서 가져온 정책 링크 */}
            <div className="flex items-center gap-4 flex-wrap">
              {isLoading ? (
                <p
                  className={cn(TYPOGRAPHY.body.fontSize)}
                  style={{ color: COLORS.text.tertiary }}
                >
                  로딩 중...
                </p>
              ) : policies && policies.length > 0 ? (
                policies.map((policy, index) => (
                  <div key={policy.id} className="flex items-center gap-4">
                    {index > 0 && (
                      <span
                        className={cn(TYPOGRAPHY.body.fontSize)}
                        style={{ color: COLORS.text.tertiary }}
                      >
                        ·
                      </span>
                    )}
                    <Link
                      href={`/policy/${policy.id}`}
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        "hover:opacity-70 transition-opacity"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {policy.name || policy.title}
                    </Link>
                  </div>
                ))
              ) : (
                <p
                  className={cn(TYPOGRAPHY.body.fontSize)}
                  style={{ color: COLORS.text.tertiary }}
                >
                  정책 정보 없음
                </p>
              )}
            </div>
          </div>

          {/* 회사 정보 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <p
                className={cn(TYPOGRAPHY.caption.fontSize, "mb-1.5")}
                style={{ color: COLORS.text.muted }}
              >
                상호
              </p>
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.primary }}
              >
                기록연구소
              </p>
            </div>

            <div>
              <p
                className={cn(TYPOGRAPHY.caption.fontSize, "mb-1.5")}
                style={{ color: COLORS.text.muted }}
              >
                사업자등록번호
              </p>
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.primary }}
              >
                208-23-70211
              </p>
            </div>

            <div>
              <p
                className={cn(TYPOGRAPHY.caption.fontSize, "mb-1.5")}
                style={{ color: COLORS.text.muted }}
              >
                위치
              </p>
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.primary }}
              >
                경기도 고양시 덕양구
                <br />
                신원로 60
              </p>
            </div>

            <div>
              <p
                className={cn(TYPOGRAPHY.caption.fontSize, "mb-1.5")}
                style={{ color: COLORS.text.muted }}
              >
                이메일
              </p>
              <a
                href="mailto:try.grit.official@gmail.com"
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  "hover:opacity-70 transition-opacity"
                )}
                style={{ color: COLORS.text.primary }}
              >
                try.grit.official@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
