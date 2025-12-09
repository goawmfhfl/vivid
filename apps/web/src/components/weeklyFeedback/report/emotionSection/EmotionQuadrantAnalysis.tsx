import { Card } from "../../../ui/card";
import { AlertTriangle, Zap, Cloud, Sparkles } from "lucide-react";
import type { EmotionReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";

type EmotionQuadrantAnalysisProps = {
  emotionReport: EmotionReport;
};

type EmotionQuadrant = {
  id: string;
  title: string;
  icon: React.ReactNode;
  triggers: string[] | undefined;
};

export function EmotionQuadrantAnalysis({
  emotionReport,
}: EmotionQuadrantAnalysisProps) {
  if (!emotionReport) return null;

  const quadrants: EmotionQuadrant[] = [
    {
      id: "anxious",
      title: "불안·초조를 느끼는 상황",
      icon: <AlertTriangle className="w-5 h-5" />,
      triggers: emotionReport.anxious_triggers,
    },
    {
      id: "engaged",
      title: "몰입·설렘을 느끼는 상황",
      icon: <Zap className="w-5 h-5" />,
      triggers: emotionReport.engaged_triggers,
    },
    {
      id: "sad",
      title: "슬픔·무기력을 느끼는 상황",
      icon: <Cloud className="w-5 h-5" />,
      triggers: emotionReport.sad_triggers,
    },
    {
      id: "calm",
      title: "안도·평온을 느끼는 상황",
      icon: <Sparkles className="w-5 h-5" />,
      triggers: emotionReport.calm_triggers,
    },
  ];

  return (
    <Card
      className="p-5 sm:p-6 relative overflow-hidden group"
      style={{
        background:
          "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
        border: "1px solid #E6D5C3",
        borderRadius: "16px",
      }}
    >
      {/* Header */}
      <div
        className="pb-4 mb-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #B89A7A 0%, #A78A6A 100%)",
            }}
          >
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: COLORS.text.secondary }}
          >
            감정 영역별 상황 분석
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quadrants.map((quadrant) => (
            <div key={quadrant.id}>
              {/* 카테고리 헤더 */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(184, 154, 122, 0.15)",
                    color: "#8B6F47",
                  }}
                >
                  {quadrant.icon}
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: COLORS.text.primary, fontWeight: 600 }}
                >
                  {quadrant.title}
                </p>
              </div>

              {/* 트리거 리스트 - 깔끔한 리스트 형식 */}
              {quadrant.triggers && quadrant.triggers.length > 0 ? (
                <ul className="space-y-1.5 ml-10">
                  {quadrant.triggers.map((trigger, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs"
                      style={{
                        color: COLORS.text.secondary,
                        lineHeight: "1.6",
                      }}
                    >
                      <span
                        className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: "#8B6F47",
                        }}
                      />
                      <span style={{ lineHeight: "1.6" }}>{trigger}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ml-10">
                  <p
                    className="text-xs"
                    style={{
                      color: COLORS.text.muted,
                      fontStyle: "italic",
                    }}
                  >
                    이번 주에 해당 감정을 느끼는 상황이 없었습니다.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
