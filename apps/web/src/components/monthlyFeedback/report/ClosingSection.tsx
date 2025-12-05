"use client";

import {
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingUp,
  Star,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ClosingReport } from "@/types/monthly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type ClosingSectionProps = {
  closingReport: ClosingReport;
  isPro?: boolean;
};

export function ClosingSection({
  closingReport,
  isPro = false,
}: ClosingSectionProps) {
  const router = useRouter();

  if (!closingReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 마무리
        </h2>
      </div>

      {/* Monthly One-Liner - Main Conclusion */}
      {closingReport.call_to_action?.monthly_one_liner && (
        <Card
          className="p-6 sm:p-8 mb-4"
          style={{
            background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
            color: "white",
            border: "none",
            borderRadius: "16px",
          }}
        >
          <p className="text-base sm:text-lg leading-relaxed text-center">
            &ldquo;{closingReport.call_to_action.monthly_one_liner}&rdquo;
          </p>
        </Card>
      )}

      {/* Next Month Objective and Actions - Combined */}
      {(closingReport.call_to_action?.next_month_objective ||
        (Array.isArray(closingReport.call_to_action?.actions) &&
          closingReport.call_to_action.actions.length > 0)) && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
        >
          {closingReport.call_to_action?.next_month_objective && (
            <div className="mb-4">
              <p
                className="text-xs mb-2.5 sm:mb-3 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                다음 달 방향
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary }}
              >
                {closingReport.call_to_action.next_month_objective}
              </p>
            </div>
          )}
          {Array.isArray(closingReport.call_to_action?.actions) &&
            closingReport.call_to_action.actions.length > 0 && (
              <div>
                <p
                  className="text-xs mb-2.5 sm:mb-3 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  다음 달 실행 계획
                </p>
                <ul className="space-y-2.5">
                  {closingReport.call_to_action.actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          borderColor: "#6B7A6F",
                          backgroundColor: "white",
                        }}
                      >
                        <CheckCircle2
                          className="w-3 h-3"
                          style={{ color: "#6B7A6F" }}
                        />
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.primary }}
                      >
                        {action}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </Card>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.3) 0%, rgba(107, 122, 111, 0.15) 100%)",
                border: "1px solid rgba(107, 122, 111, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: "#6B7A6F" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 마무리 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(107, 122, 111, 0.2)",
                    color: "#6B7A6F",
                    letterSpacing: "0.5px",
                  }}
                >
                  PRO
                </span>
              </div>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.6",
                }}
              >
                Pro 멤버십에서는 이번 달의 성장 요약, 다음 달 비전, 장기 목표
                정렬을 시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 마무리
                지도를 함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
