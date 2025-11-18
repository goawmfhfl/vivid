import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Weekly Report Data Type
export type WeeklyReportData = {
  // Header
  week_range: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  integrity: {
    average: number;
    min: number;
    max: number;
    stddev: number;
    trend: string; // "전주 대비 +3"
  };
  weekly_one_liner: string; // "생각이 전략으로, 실행이 습관으로 달을 내린 한 주"
  next_week_focus: string; // "속도보다 방향 유지"

  // Weekly Overview
  weekly_overview: {
    narrative: string;
    top_keywords: string[];
    repeated_themes: Array<{ theme: string; count: number }>;
    emotion_trend: string[]; // ["불안", "몰입", "안도"]
    ai_overall_comment: string;
  };

  // By Day Timeline
  by_day: Array<{
    date: string; // "2025.10.28"
    weekday: string; // "월요일"
    one_liner: string;
    key_mood: string;
    keywords: string[];
    integrity_score: number;
  }>;

  // Growth Trends
  growth_points_top3: string[];
  adjustment_points_top3: string[];

  // Insight Replay
  core_insights: string[];
  meta_questions_highlight: string[];

  // Vision Report
  vision_summary: string;
  vision_keywords_trend: Array<{ keyword: string; count: number }>;
  alignment_comment: string;
  reminder_sentences_featured: string[];

  // Execution Reflection
  positives_top3: string[];
  improvements_top3: string[];
  ai_feedback_summary: string;

  // Closing
  next_week_objective: string;
  call_to_action: string[];
};

type WeeklyFeedbackReportProps = {
  data: WeeklyReportData;
  onBack: () => void;
};

export function WeeklyFeedbackReport({
  data,
  onBack,
}: WeeklyFeedbackReportProps) {
  // Prepare integrity score chart data
  const integrityChartData = data.by_day.map((day) => ({
    day: day.weekday.substring(0, 1), // 월 -> 월
    score: day.integrity_score,
  }));

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: "#6B7A6F" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        {/* 1️⃣ Header Section - Week Range */}
        <div className="mb-8 sm:mb-10">
          <div
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #A8BBA8 0%, #8FA894 100%)",
              color: "white",
            }}
          >
            {/* Week Range & Integrity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ opacity: 0.9 }}
                  />
                  <p className="text-sm sm:text-base" style={{ opacity: 0.9 }}>
                    주간 리포트
                  </p>
                </div>
                <h1 className="text-xl sm:text-2xl mb-1.5">
                  {data.week_range.start} – {data.week_range.end}
                </h1>
                <p className="text-sm sm:text-base" style={{ opacity: 0.85 }}>
                  평균 정합도 {data.integrity.average}점 {data.integrity.trend}
                </p>
              </div>

              {/* Next Week Focus Badge */}
              <Badge
                className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                {data.next_week_focus}
              </Badge>
            </div>

            {/* Weekly One-Liner - Hero Summary */}
            <div
              className="py-4 px-4 sm:py-5 sm:px-6 rounded-xl sm:rounded-2xl"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ opacity: 0.95 }}
              >
                {data.weekly_overview.narrative}
              </p>
            </div>
          </div>
        </div>

        {/* 2️⃣ By Day Timeline Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A3BFD9" }}
            >
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              일별 타임라인
            </h2>
          </div>

          {/* Horizontal Scrollable Cards */}
          <ScrollArea className="w-full">
            <div
              className="flex gap-3 sm:gap-4 pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4"
              style={{ minWidth: "max-content" }}
            >
              {data.by_day.map((day, index) => (
                <Card
                  key={index}
                  className="p-3.5 sm:p-4 flex-shrink-0"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #EFE9E3",
                    width: "200px",
                  }}
                >
                  {/* Date & Score */}
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div>
                      <p className="text-xs" style={{ color: "#6B7A6F" }}>
                        {day.weekday}
                      </p>
                      <p className="text-sm" style={{ color: "#333333" }}>
                        {day.date}
                      </p>
                    </div>
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#E8EFE8" }}
                    >
                      <span
                        className="text-sm sm:text-base"
                        style={{ color: "#6B7A6F" }}
                      >
                        {day.integrity_score}
                      </span>
                    </div>
                  </div>

                  {/* One Liner */}
                  <p
                    className="text-sm sm:text-base leading-relaxed mb-2.5"
                    style={{ color: "#333333" }}
                  >
                    {day.one_liner}
                  </p>

                  {/* Key Mood Badge */}
                  <Badge
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 mb-2.5"
                    style={{
                      backgroundColor: "#E5EEF5",
                      color: "#5A7A8F",
                    }}
                  >
                    {day.key_mood}
                  </Badge>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5">
                    {day.keywords.slice(0, 3).map((keyword, kidx) => (
                      <Badge
                        key={kidx}
                        className="text-xs px-2 py-1"
                        style={{
                          backgroundColor: "#FAFAF8",
                          color: "#6B7A6F",
                          border: "1px solid #EFE9E3",
                        }}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Emotion Trend Visualization */}
          <Card
            className="p-4 sm:p-5 mt-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              이번 주 감정의 흐름
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {data.weekly_overview.emotion_trend.map((emotion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge
                    className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
                    style={{
                      backgroundColor: "#E8EFE8",
                      color: "#6B7A6F",
                      border: "none",
                    }}
                  >
                    {emotion}
                  </Badge>
                  {index < data.weekly_overview.emotion_trend.length - 1 && (
                    <ArrowRight
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: "#A8BBA8" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 3️⃣ Weekly Overview Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A8BBA8" }}
            >
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              이번 주 요약
            </h2>
          </div>

          {/* Top Keywords */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {data.weekly_overview.top_keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                  style={{
                    backgroundColor: "#E8EFE8",
                    color: "#6B7A6F",
                    border: "none",
                  }}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Repeated Themes */}
          <Card
            className="p-4 sm:p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              반복되는 주제들
            </p>
            <div className="space-y-3">
              {data.weekly_overview.repeated_themes.map((theme, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p
                      className="text-sm sm:text-base"
                      style={{ color: "#333333" }}
                    >
                      {theme.theme}
                    </p>
                    <p
                      className="text-xs sm:text-sm"
                      style={{ color: "#6B7A6F" }}
                    >
                      {theme.count}회
                    </p>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: "#F0F5F0" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: "#A8BBA8",
                        width: `${(theme.count / 7) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Overall Comment */}
          <div
            className="p-4 sm:p-5 rounded-xl flex gap-3"
            style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
          >
            <Sparkles
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs mb-1.5 sm:mb-2"
                style={{ color: "#6B7A6F" }}
              >
                AI 총평
              </p>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#4E4B46" }}
              >
                {data.weekly_overview.ai_overall_comment}
              </p>
            </div>
          </div>
        </div>

        {/* 4️⃣ Growth Trends Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#D08C60" }}
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              성장 트렌드
            </h2>
          </div>

          {/* Integrity Score Chart */}
          <Card
            className="p-4 sm:p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              일별 정합도 점수
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={integrityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#6B7A6F" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "#6B7A6F" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #EFE9E3",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#A8BBA8"
                  strokeWidth={2.5}
                  dot={{ fill: "#A8BBA8", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 sm:gap-6 mt-3">
              <div className="text-center">
                <p className="text-xs" style={{ color: "#6B7A6F" }}>
                  평균
                </p>
                <p
                  className="text-base sm:text-lg"
                  style={{ color: "#333333" }}
                >
                  {data.integrity.average}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: "#6B7A6F" }}>
                  최소
                </p>
                <p
                  className="text-base sm:text-lg"
                  style={{ color: "#333333" }}
                >
                  {data.integrity.min}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: "#6B7A6F" }}>
                  최대
                </p>
                <p
                  className="text-base sm:text-lg"
                  style={{ color: "#333333" }}
                >
                  {data.integrity.max}
                </p>
              </div>
            </div>
          </Card>

          {/* Growth & Adjustment Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Growth Points */}
            <Card
              className="p-4 sm:p-5"
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "#A8BBA8" }}
                />
                <p className="text-xs sm:text-sm" style={{ color: "#6B7A6F" }}>
                  이번 주 성장 포인트
                </p>
              </div>
              <ul className="space-y-2 sm:space-y-2.5">
                {data.growth_points_top3.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#A8BBA8" }}
                    />
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Adjustment Points */}
            <Card
              className="p-4 sm:p-5"
              style={{
                backgroundColor: "#FDF6F0",
                border: "1px solid #F0DCC8",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" style={{ color: "#D08C60" }} />
                <p className="text-xs sm:text-sm" style={{ color: "#6B7A6F" }}>
                  개선 포인트
                </p>
              </div>
              <ul className="space-y-2 sm:space-y-2.5">
                {data.adjustment_points_top3.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#D08C60" }}
                    />
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* 5️⃣ Insight Replay Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#D08C60" }}
            >
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              이번 주의 인사이트
            </h2>
          </div>

          {/* Core Insights */}
          <div className="space-y-3 mb-4">
            {data.core_insights.map((insight, index) => (
              <Card
                key={index}
                className="p-4 sm:p-5"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EFE9E3",
                }}
              >
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "#333333" }}
                >
                  {insight}
                </p>
              </Card>
            ))}
          </div>

          {/* Meta Questions Highlight */}
          <Card
            className="p-4 sm:p-5"
            style={{
              backgroundColor: "#FDF6F0",
              border: "2px solid #D08C60",
            }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#D08C60" }}
            >
              이번 주 떠오른 질문들
            </p>
            <div className="space-y-2">
              {data.meta_questions_highlight.map((question, index) => (
                <p
                  key={index}
                  className="text-sm sm:text-base leading-relaxed italic"
                  style={{ color: "#4E4B46" }}
                >
                  "{question}"
                </p>
              ))}
            </div>
          </Card>
        </div>

        {/* 6️⃣ Vision Visualization Report Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A3BFD9" }}
            >
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              비전과 일치도
            </h2>
          </div>

          {/* Vision Summary */}
          <Card
            className="p-4 sm:p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: "#333333" }}
            >
              {data.vision_summary}
            </p>
          </Card>

          {/* Vision Keywords Trend - Bar Chart */}
          <Card
            className="p-4 sm:p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              비전 키워드 빈도
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.vision_keywords_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="keyword"
                  tick={{ fontSize: 10, fill: "#6B7A6F" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6B7A6F" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #EFE9E3",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                  }}
                />
                <Bar dataKey="count" fill="#A3BFD9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Alignment Comment */}
          <div className="flex gap-2 items-start mb-4">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-1"
              style={{ color: "#A3BFD9", opacity: 0.7 }}
            />
            <p
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: "#6B7A6F" }}
            >
              {data.alignment_comment}
            </p>
          </div>

          {/* Featured Reminder Sentences */}
          <div className="space-y-3">
            {data.reminder_sentences_featured.map((sentence, index) => (
              <Card
                key={index}
                className="p-4 sm:p-5"
                style={{
                  backgroundColor: "#A3BFD9",
                  color: "white",
                  border: "none",
                }}
              >
                <p className="text-sm sm:text-base leading-relaxed">
                  {sentence}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* 7️⃣ Execution Reflection Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6B7A6F" }}
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              실행 패턴 회고
            </h2>
          </div>

          {/* Positives & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Positives */}
            <Card
              className="p-4 sm:p-5"
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <p
                className="text-xs sm:text-sm mb-2.5 sm:mb-3"
                style={{ color: "#6B7A6F" }}
              >
                이번 주 잘한 점
              </p>
              <ul className="space-y-2 sm:space-y-2.5">
                {data.positives_top3.map((positive, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#A8BBA8" }}
                    />
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {positive}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Improvements */}
            <Card
              className="p-4 sm:p-5"
              style={{
                backgroundColor: "#FDF6F0",
                border: "1px solid #F0DCC8",
              }}
            >
              <p
                className="text-xs sm:text-sm mb-2.5 sm:mb-3"
                style={{ color: "#6B7A6F" }}
              >
                보완할 점
              </p>
              <ul className="space-y-2 sm:space-y-2.5">
                {data.improvements_top3.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#D08C60" }}
                    />
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {improvement}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* AI Feedback Summary */}
          <div
            className="p-4 sm:p-5 rounded-xl flex gap-3"
            style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
          >
            <Sparkles
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
              style={{ color: "#6B7A6F" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs mb-1.5 sm:mb-2"
                style={{ color: "#6B7A6F" }}
              >
                실행 종합 피드백
              </p>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#4E4B46" }}
              >
                {data.ai_feedback_summary}
              </p>
            </div>
          </div>
        </div>

        {/* 8️⃣ Closing Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#A8BBA8" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
              이번 주의 결론
            </h2>
          </div>

          {/* Weekly One-Liner - Main Conclusion */}
          <Card
            className="p-6 sm:p-8 mb-4"
            style={{
              background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
              color: "white",
              border: "none",
            }}
          >
            <p className="text-lg sm:text-xl leading-relaxed text-center">
              "{data.weekly_one_liner}"
            </p>
          </Card>

          {/* Next Week Objective */}
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              다음 주 방향
            </p>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "#333333" }}
            >
              {data.next_week_objective}
            </p>
          </Card>

          {/* Call to Action - Checklist Style */}
          <Card
            className="p-5 sm:p-6"
            style={{ backgroundColor: "#F0F5F0", border: "1px solid #D5E3D5" }}
          >
            <p
              className="text-xs sm:text-sm mb-2.5 sm:mb-3"
              style={{ color: "#6B7A6F" }}
            >
              다음 주 실행 계획
            </p>
            <ul className="space-y-2.5 sm:space-y-3">
              {data.call_to_action.map((action, index) => (
                <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: "#A8BBA8", backgroundColor: "white" }}
                  >
                    <CheckCircle2
                      className="w-3 h-3"
                      style={{ color: "#A8BBA8" }}
                    />
                  </div>
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "#333333" }}
                  >
                    {action}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onBack}
            className="rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            새로운 주간 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
