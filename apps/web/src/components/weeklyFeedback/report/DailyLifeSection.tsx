import { BookOpen, Lock } from "lucide-react";
import { Card } from "../../ui/card";
import type { DailyLifeReport } from "@/types/weekly-feedback";
import { COLORS, SPACING } from "@/lib/design-system";

type DailyLifeSectionProps = {
  dailyLifeReport: DailyLifeReport;
  isPro?: boolean;
};

export function DailyLifeSection({
  dailyLifeReport,
  isPro = false,
}: DailyLifeSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 일상
        </h2>
      </div>

      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        {/* Summary */}
        {dailyLifeReport.summary && (
          <div className="mb-6">
            <p
              className="text-xs mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              요약
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary }}
            >
              {dailyLifeReport.summary}
            </p>
          </div>
        )}

        {/* Daily Summaries Trend */}
        {dailyLifeReport.daily_summaries_trend && (
          <div className="mb-6">
            <p
              className="text-xs mb-2"
              style={{ color: COLORS.text.secondary }}
            >
              일상 흐름
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary }}
            >
              {dailyLifeReport.daily_summaries_trend.narrative}
            </p>
            {dailyLifeReport.daily_summaries_trend.highlights &&
              dailyLifeReport.daily_summaries_trend.highlights.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {dailyLifeReport.daily_summaries_trend.highlights.map(
                    (highlight, idx) => (
                      <li
                        key={idx}
                        className="text-xs flex items-start gap-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        <span style={{ color: COLORS.brand.primary }}>•</span>
                        <span>{highlight}</span>
                      </li>
                    )
                  )}
                </ul>
              )}
          </div>
        )}

        {/* Free 모드: Pro 업그레이드 유도 */}
        {!isPro && (
          <Card
            className="p-4"
            style={{
              backgroundColor: "#FAFAF8",
              border: "1px solid #E6E4DE",
            }}
          >
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5" style={{ color: "#6B7A6F" }} />
              <div className="flex-1">
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: COLORS.text.primary }}
                >
                  이번 주의 패턴을 더 깊이 이해하고 싶으신가요?
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: COLORS.text.secondary,
                    lineHeight: "1.5",
                  }}
                >
                  Pro 멤버십에서는 이번 주의 일상 속에서 나타나는 감정 트리거,
                  행동 패턴, 키워드 분석을 시각화해 드립니다. 같은 패턴을 반복하면,
                  같은 결과가 반복돼요. 지금 기록을 성장으로 바꿔보세요.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Pro 모드: 상세 분석 표시 */}
        {isPro && (
          <div className="space-y-6">
            {/* Events Pattern */}
            {dailyLifeReport.events_pattern && (
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  주요 이벤트 패턴
                </p>
                {/* TODO: 이벤트 패턴 시각화 */}
              </div>
            )}

            {/* Emotion Triggers Analysis */}
            {dailyLifeReport.emotion_triggers_analysis && (
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  감정 트리거 분석
                </p>
                {/* TODO: 감정 트리거 분석 시각화 */}
              </div>
            )}

            {/* Behavioral Patterns */}
            {dailyLifeReport.behavioral_patterns && (
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  행동 패턴
                </p>
                {/* TODO: 행동 패턴 시각화 */}
              </div>
            )}

            {/* Keywords Analysis */}
            {dailyLifeReport.keywords_analysis && (
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  키워드 분석
                </p>
                {/* TODO: 키워드 분석 시각화 */}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

