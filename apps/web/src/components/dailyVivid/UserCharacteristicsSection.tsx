import { Heart, Target, User } from "lucide-react";
import { Card } from "../ui/card";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { COLORS, TYPOGRAPHY, SHADOWS, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SectionProps } from "./types";
import { hexToRgbTriplet } from "./colorUtils";

export function UserCharacteristicsSection({ view }: SectionProps) {
  const hasUserCharacteristics =
    view.user_characteristics && view.user_characteristics.length > 0;
  const hasAspiredTraits = view.aspired_traits && view.aspired_traits.length > 0;

  if (!hasUserCharacteristics && !hasAspiredTraits) return null;

  const alignmentColor = COLORS.brand.primary;
  const futureColor = COLORS.dailyVivid.future;
  const alignmentGradientColor = hexToRgbTriplet(alignmentColor);
  const futureGradientColor = hexToRgbTriplet(futureColor);

  return (
    <ScrollAnimation delay={320}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${alignmentColor} 0%, ${alignmentColor}DD 100%)`,
              boxShadow: `0 4px 12px ${alignmentColor}40`,
            }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            사용자 특성 분석
          </h3>
        </div>
        <div className="space-y-5">
          {hasUserCharacteristics && (
            <Card
              className={cn(
                "p-5 sm:p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              )}
              style={{
                background: `linear-gradient(135deg, rgba(${alignmentGradientColor}, 0.12) 0%, rgba(${alignmentGradientColor}, 0.06) 50%, ${COLORS.text.white} 100%)`,
                border: `1.5px solid rgba(${alignmentGradientColor}, 0.25)`,
                borderRadius: "20px",
                boxShadow: `${SHADOWS.elevation3}, inset 0 1px 0 ${hexToRgba(
                  COLORS.text.white,
                  0.9
                )}`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-4 group-hover:opacity-6 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 80% 20%, rgba(${alignmentGradientColor}, 0.15) 0%, transparent 60%)`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 opacity-3 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 20% 80%, rgba(${alignmentGradientColor}, 0.1) 0%, transparent 50%)`,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${alignmentColor}20`,
                      border: `1.5px solid ${alignmentColor}40`,
                    }}
                  >
                    <Heart className="w-4 h-4" style={{ color: alignmentColor }} />
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    기록을 쓰는 사람의 특징
                  </p>
                </div>
                <ul className="space-y-3">
                  {view.user_characteristics.map((trait, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                        style={{ backgroundColor: alignmentColor }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight,
                          "flex-1"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {trait}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
          {hasAspiredTraits && (
            <Card
              className={cn(
                "p-5 sm:p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              )}
              style={{
                background: `linear-gradient(135deg, rgba(${futureGradientColor}, 0.12) 0%, rgba(${futureGradientColor}, 0.06) 50%, ${COLORS.text.white} 100%)`,
                border: `1.5px solid rgba(${futureGradientColor}, 0.25)`,
                borderRadius: "20px",
                boxShadow: `${SHADOWS.elevation3}, inset 0 1px 0 ${hexToRgba(
                  COLORS.text.white,
                  0.8
                )}`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-8 group-hover:opacity-12 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 80% 20%, rgba(${futureGradientColor}, 0.25) 0%, transparent 60%)`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 opacity-5 group-hover:opacity-8 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 20% 80%, rgba(${futureGradientColor}, 0.15) 0%, transparent 50%)`,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${futureColor}20`,
                      border: `1.5px solid ${futureColor}40`,
                    }}
                  >
                    <Target className="w-4 h-4" style={{ color: futureColor }} />
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    지향하는 모습
                  </p>
                </div>
                <ul className="space-y-3">
                  {view.aspired_traits.map((trait, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                        style={{ backgroundColor: futureColor }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight,
                          "flex-1"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {trait}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ScrollAnimation>
  );
}
