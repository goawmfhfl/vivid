"use client";

import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AppHeader } from "@/components/common/AppHeader";
import { COLORS, SPACING, GRADIENT_UTILS, hexToRgba } from "@/lib/design-system";
import { Crown, Calendar, Sparkles, Zap, TrendingUp, Users } from "lucide-react";
import { formatKSTDate } from "@/lib/date-utils";

export default function MembershipPage() {
  const router = useRouter();
  const { subscription, isPro } = useSubscription();
  const { data: currentUser } = useCurrentUser();

  // Admin 여부 확인
  const isAdmin = currentUser?.user_metadata?.role === "admin";

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="프로 멤버십" showBackButton={true} />

      <div className="space-y-6 mt-6">
        {/* 현재 멤버십 상태 */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 sm:p-7 md:p-9"
          style={{
            background: isPro || isAdmin
              ? `linear-gradient(135deg, #3B82F612 0%, #60A5FA08 50%, ${COLORS.background.card} 100%)`
              : `linear-gradient(135deg, ${hexToRgba(
                  COLORS.brand.primary,
                  0.18
                )} 0%, ${hexToRgba(COLORS.brand.light, 0.12)} 50%, ${
                  COLORS.background.card
                } 100%)`,
            border: `2px solid ${
              isPro || isAdmin
                ? `#3B82F660`
                : GRADIENT_UTILS.borderColor(COLORS.brand.primary, "40")
            }`,
            boxShadow: isPro || isAdmin
              ? `0 8px 32px #3B82F625, 0 4px 16px #3B82F615, inset 0 1px 0 rgba(255,255,255,0.5)`
              : `0 8px 24px ${hexToRgba(
                  COLORS.brand.primary,
                  0.18
                )}, 0 4px 12px ${hexToRgba(
                  COLORS.brand.primary,
                  0.1
                )}, inset 0 1px 0 ${hexToRgba(COLORS.text.white, 0.6)}`,
          }}
        >
          {/* 배경 장식 - 애니메이션 효과 */}
          {isPro || isAdmin ? (
            <>
              <div
                className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 opacity-12 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, #3B82F6 0%, transparent 70%)`,
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                  filter: "blur(30px)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 opacity-10 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, #2563EB 0%, transparent 60%)`,
                  borderRadius: "50%",
                  transform: "translate(-20%, 20%)",
                  filter: "blur(24px)",
                }}
              />
            </>
          ) : (
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-6 pointer-events-none"
              style={{
                background: GRADIENT_UTILS.decoration(COLORS.brand.primary, 0.35),
                borderRadius: "50%",
                transform: "translate(20%, -20%)",
              }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                style={{
                  background: isPro || isAdmin
                    ? `linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)`
                    : GRADIENT_UTILS.iconBadge(COLORS.brand.primary, 0.2),
                  boxShadow: isPro || isAdmin
                    ? `0 4px 12px #60A5FA40`
                    : `0 4px 12px ${hexToRgba(COLORS.brand.primary, 0.3)}`,
                }}
              >
                {isPro || isAdmin ? (
                  <Crown
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                    style={{ color: COLORS.text.white }}
                  />
                ) : (
                  <Sparkles
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                    style={{ color: COLORS.text.white }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold mb-1 truncate"
                  style={{ color: COLORS.text.primary }}
                >
                  {isAdmin ? "관리자" : isPro ? "Pro 멤버십" : "Free 멤버십"}
                </h2>
                <p
                  className="text-xs sm:text-sm md:text-base"
                  style={{ color: COLORS.text.secondary }}
                >
                  {isAdmin
                    ? "모든 기능을 사용할 수 있습니다"
                    : isPro
                    ? "프로 기능을 사용할 수 있습니다"
                    : "기본 기능을 사용할 수 있습니다"}
                </p>
              </div>
            </div>

            {isPro && subscription?.expires_at && (
              <div
                className="mt-4 pt-4 border-t flex items-center gap-2"
                style={{ borderColor: COLORS.border.light }}
              >
                <Calendar className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
                <span
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  만료일: {formatKSTDate(subscription.expires_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pro 핵심 기능 강조 섹션 */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 sm:p-7 md:p-9"
          style={{
            background: `linear-gradient(135deg, #3B82F608 0%, #60A5FA05 50%, ${COLORS.background.card} 100%)`,
            border: `2px solid #3B82F640`,
            boxShadow: `0 8px 32px #3B82F620, 0 4px 16px #3B82F615, inset 0 1px 0 rgba(255,255,255,0.8)`,
          }}
        >
          {/* 배경 장식 */}
          <div
            className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 opacity-12 pointer-events-none"
            style={{
              background: `radial-gradient(circle, #3B82F6 0%, transparent 60%)`,
              borderRadius: "50%",
              transform: "translate(25%, -25%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-56 h-56 sm:w-72 sm:h-72 opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle, #60A5FA 0%, transparent 50%)`,
              borderRadius: "50%",
              transform: "translate(-20%, 20%)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10">
            {/* 타이틀 영역 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)`,
                    boxShadow: `0 4px 16px #60A5FA30`,
                  }}
                >
                  <Crown
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    style={{ color: COLORS.text.white }}
                  />
                </div>
                <div>
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Pro 멤버십으로 열리는 핵심 기능들
                  </h3>
                  <p
                    className="mt-2 text-xs sm:text-sm leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                  >
                    매일·매주·매달의 기록을 수익과 성장을 향한 방향으로 정리해 주는,
                    VIVID만의 프리미엄 기능들이 한 번에 열립니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 핵심 기능 카드들 */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              

              {/* 2. 주간 · 월간 VIVID 리포트 */}
              <div
                className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
                style={{
                  background: GRADIENT_UTILS.cardBackground("#2563EB", 0.18, COLORS.background.card),
                  border: `1.5px solid ${GRADIENT_UTILS.borderColor("#2563EB", "40")}`,
                  boxShadow: `0 8px 24px #2563EB25, 0 4px 12px #2563EB15, inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
                  style={{
                    background: GRADIENT_UTILS.decoration("#2563EB", 0.6),
                    borderRadius: "50%",
                    transform: "translate(20%, -20%)",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: GRADIENT_UTILS.iconBadge("#60A5FA", 0.25),
                        boxShadow: `0 2px 8px #60A5FA40`,
                      }}
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: COLORS.text.white }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm sm:text-base font-semibold mb-1"
                        style={{ color: COLORS.text.primary }}
                      >
                        주간 · 월간 VIVID 리포트
                      </p>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        한 주·한 달 전체를 통틀어 나의 흐름과 패턴을 요약해
                        방향성을 잡을 수 있게 도와줍니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 감정 패턴 분석 인사이트 */}
              <div
                className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
                style={{
                  background: GRADIENT_UTILS.cardBackground("#4A90E2", 0.18, COLORS.background.card),
                  border: `1.5px solid ${GRADIENT_UTILS.borderColor("#4A90E2", "40")}`,
                  boxShadow: `0 8px 24px #4A90E225, 0 4px 12px #4A90E215, inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
                  style={{
                    background: GRADIENT_UTILS.decoration("#4A90E2", 0.6),
                    borderRadius: "50%",
                    transform: "translate(20%, -20%)",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: GRADIENT_UTILS.iconBadge("#60A5FA", 0.25),
                        boxShadow: `0 2px 8px #60A5FA40`,
                      }}
                    >
                      <Zap className="w-4 h-4" style={{ color: COLORS.text.white }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm sm:text-base font-semibold mb-1"
                        style={{ color: COLORS.text.primary }}
                      >
                        감정 패턴 분석 인사이트
                      </p>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        내가 어디에서 에너지를 쓰고, 어디에서 소진되는지
                        감정 패턴을 분석해 주는 심층 리포트를 제공합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. VIVID 커뮤니티 (준비 중 안내) */}
              <div
                className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
                style={{
                  background: GRADIENT_UTILS.cardBackground("#60A5FA", 0.18, COLORS.background.card),
                  border: `1.5px solid ${GRADIENT_UTILS.borderColor("#60A5FA", "40")}`,
                  boxShadow: `0 8px 24px #60A5FA25, 0 4px 12px #60A5FA15, inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
                  style={{
                    background: GRADIENT_UTILS.decoration("#60A5FA", 0.6),
                    borderRadius: "50%",
                    transform: "translate(20%, -20%)",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: GRADIENT_UTILS.iconBadge("#7AB8F5", 0.25),
                        boxShadow: `0 2px 8px #7AB8F540`,
                      }}
                    >
                      <Users className="w-4 h-4" style={{ color: COLORS.text.white }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm sm:text-base font-semibold mb-1"
                        style={{ color: COLORS.text.primary }}
                      >
                        VIVID 커뮤니티 (준비 중)
                      </p>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Pro 멤버만을 위한 기록 공유, Q&A, 성장 피드백 커뮤니티를
                        순차적으로 오픈할 예정입니다.
                      </p>
                    </div>
                  </div>
                  <p
                    className="mt-1 text-[11px] sm:text-xs"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    * 커뮤니티 기능은 단계적으로 업데이트될 수 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 업그레이드 안내 */}
        {!isPro && !isAdmin && (
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 cursor-pointer"
            onClick={() => router.push("/membership")}
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.primary}15 0%, ${
                COLORS.brand.light || COLORS.brand.primary
              }10 50%, ${COLORS.background.card} 100%)`,
              border: `2px solid ${COLORS.brand.primary}40`,
              boxShadow: `0 12px 40px ${COLORS.brand.primary}26, 0 6px 20px ${COLORS.brand.primary}1F, inset 0 1px 0 rgba(255,255,255,0.7)`,
            }}
          >
            {/* 배경 장식 */}
            <div
              className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 opacity-12 pointer-events-none"
              style={{
                background: GRADIENT_UTILS.decoration(COLORS.brand.primary, 0.8),
                borderRadius: "50%",
                transform: "translate(25%, -25%)",
                filter: "blur(42px)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 opacity-10 pointer-events-none"
              style={{
                background: GRADIENT_UTILS.decoration(
                  COLORS.brand.secondary || COLORS.brand.primary,
                  0.7
                ),
                borderRadius: "50%",
                transform: "translate(-20%, 20%)",
                filter: "blur(34px)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start gap-4 sm:gap-5 mb-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${
                      COLORS.brand.secondary || COLORS.brand.primary
                    } 100%)`,
                    boxShadow: `0 8px 24px ${COLORS.brand.primary}4D, 0 4px 12px ${COLORS.brand.primary}33`,
                  }}
                >
                  <Sparkles
                    className="w-7 h-7 sm:w-8 sm:h-8"
                    style={{ color: COLORS.text.white }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl font-bold mb-3"
                    style={{
                      color: COLORS.text.primary,
                    }}
                  >
                    Pro 멤버십으로 업그레이드
                  </h3>
                  <p
                    className="text-sm sm:text-base mb-4 leading-relaxed font-medium"
                    style={{ color: COLORS.text.secondary }}
                  >
                    주간 및 월간 VIVID를 생성하고 더 많은 인사이트를 받아보세요.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${
                        COLORS.brand.secondary || COLORS.brand.primary
                      } 100%)`,
                      color: COLORS.text.white,
                      boxShadow: `0 4px 12px ${COLORS.brand.primary}40`,
                    }}
                  >
                    <Crown className="w-4 h-4" />
                    <span>프리미엄 기능 체험하기</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
