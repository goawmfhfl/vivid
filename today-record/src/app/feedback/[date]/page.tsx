"use client";

import { useParams, useRouter } from "next/navigation";
import { useJournal } from "../../providers";
import { DailyFeedbackView } from "@/components/DailyFeedbackView";
import { DailyFeedbackPayload, type Entry } from "@/types/Entry";

export default function DateFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const { entries } = useJournal();

  const dateStr = params.date as string;
  const selectedDate = new Date(dateStr);

  // 해당 날짜의 기록들 필터링
  const dateEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    const entryDateStr = `${entryDate.getFullYear()}-${String(
      entryDate.getMonth() + 1
    ).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;
    return entryDateStr === dateStr;
  });

  // 해당 날짜의 피드백 데이터 생성
  const generateFeedbackForDate = (
    date: string,
    entries: Entry[]
  ): DailyFeedbackPayload => {
    return {
      date: date,
      lesson:
        entries.length > 0
          ? `${entries.length}개의 기록을 통해 이 날의 패턴을 분석해보니, ${
              entries.some((e) => e.type === "visualizing")
                ? "시각화"
                : entries.some((e) => e.type === "insight")
                ? "인사이트"
                : "피드백"
            } 중심의 성찰이 돋보입니다.`
          : "이 날에는 특별한 기록이 없었지만, 조용한 성찰의 시간을 가졌을 것입니다.",
      keywords:
        entries.length > 0 ? ["성찰", "성장", "인사이트"] : ["휴식", "성찰"],
      observation:
        entries.length > 0
          ? "기록된 내용들을 보면 성장에 대한 의지가 강하게 드러나네요. 작은 변화들도 의미 있게 기록하고 계시는 모습이 인상적입니다."
          : "조용한 하루를 보내며 내면의 평화를 찾으셨네요.",
      insight:
        entries.length > 0
          ? "꾸준한 기록 습관이 자기 인식의 깊이를 더해주고 있습니다."
          : "가끔은 조용한 시간도 의미 있는 성찰의 시간이 될 수 있습니다.",
      action_feedback: {
        well_done: "구체적이고 근거 있는 판단을 내렸어요",
        to_improve: "휴식 시간을 더 확보해보세요",
      },
      focus_tomorrow:
        "내일은 오전 중 짧은 산책을 추가하고, 점심 후 10분간 명상 시간을 가져보세요. 감정 에너지를 재충전할 수 있을 거예요.",
      focus_score: entries.length > 0 ? 7.5 : 6.0,
      satisfaction_score: entries.length > 0 ? 8.2 : 7.0,
    };
  };

  const feedback = generateFeedbackForDate(dateStr, dateEntries);

  const handleBack = () => {
    router.push("/logs");
  };

  const pageTitle = `${selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })} AI 리뷰`;

  const pageSubtitle = `${dateEntries.length}개의 기록 기반 분석`;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <DailyFeedbackView
        feedback={feedback}
        loading={false}
        error={null}
        onBack={handleBack}
        showBackButton={true}
        title={pageTitle}
        subtitle={pageSubtitle}
      />
    </div>
  );
}
