import { useRef, useEffect } from "react";
import { ArrowRight, CalendarDays, Inbox } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/autoplay";
import type { WeeklyReportData } from "./types";

type ByDayTimelineSectionProps = {
  byDay: WeeklyReportData["by_day"];
  emotionTrend: string[];
};

export function ByDayTimelineSection({
  byDay,
  emotionTrend,
}: ByDayTimelineSectionProps) {
  const hasData = byDay && byDay.length > 0;
  const hasEmotions = emotionTrend && emotionTrend.length > 0;
  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 컴포넌트가 뷰포트에 들어왔는지 감지
  useEffect(() => {
    if (!hasData || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 컴포넌트가 뷰포트에 들어왔을 때 autoplay 시작
            if (swiperRef.current?.autoplay) {
              swiperRef.current.autoplay.start();
            }
          } else {
            // 컴포넌트가 뷰포트에서 벗어났을 때 autoplay 일시정지
            if (swiperRef.current?.autoplay) {
              swiperRef.current.autoplay.stop();
            }
          }
        });
      },
      {
        threshold: 0.3, // 컴포넌트의 30%가 보일 때 트리거
        rootMargin: "0px 0px -50px 0px", // 하단 여백
      }
    );

    const currentRef = containerRef.current;
    // 약간의 지연을 두어 Swiper가 초기화될 시간을 줌
    const timeoutId = setTimeout(() => {
      observer.observe(currentRef);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasData]);

  return (
    <div ref={containerRef} className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          일별 타임라인
        </h2>
      </div>

      {/* Swiper Cards Effect */}
      {hasData ? (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[320px] sm:max-w-[360px]">
            <Swiper
              effect="cards"
              grabCursor={true}
              modules={[EffectCards, Autoplay]}
              className="swiper-cards"
              cardsEffect={{
                perSlideOffset: 8,
                perSlideRotate: 2,
                rotate: true,
                slideShadows: true,
              }}
              autoplay={{
                delay: 1500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false,
                waitForTransition: true,
              }}
              speed={800}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                // 초기에는 autoplay를 시작하지 않음
                swiper.autoplay.stop();
              }}
              onReachEnd={(swiper) => {
                // 마지막 슬라이드에 도달하면 3초 후 처음으로 돌아가기
                setTimeout(() => {
                  swiper.slideTo(0, 1000);
                }, 3000);
              }}
              style={{
                width: "100%",
                height: "400px",
                paddingTop: "20px",
                paddingBottom: "20px",
              }}
            >
              {byDay.map((day, index) => (
                <SwiperSlide key={index}>
                  <Card
                    className="p-5 h-full transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #EFE9E3",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Date & Score - Fixed Height */}
                    <div
                      className="flex items-start justify-between flex-shrink-0 mb-4"
                      style={{ minHeight: "64px" }}
                    >
                      <div className="flex-1">
                        {/* 요일 배지 - 더 명확하게 표시 */}
                        <div className="mb-2">
                          <Badge
                            className="text-sm px-3 py-1.5 rounded-full font-semibold"
                            style={{
                              backgroundColor: "#A3BFD9",
                              color: "white",
                              border: "none",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            {day.weekday}
                          </Badge>
                        </div>
                        <p
                          className="text-lg font-bold"
                          style={{ color: "#333333" }}
                        >
                          {day.date}
                        </p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ml-3"
                        style={{
                          backgroundColor: "#E8EFE8",
                          border: "2px solid #A8BBA8",
                        }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#6B7A6F" }}
                        >
                          {day.integrity_score}
                        </span>
                      </div>
                    </div>

                    {/* One Liner - Flexible Height with Max */}
                    <div
                      className="mb-4 flex-shrink-0"
                      style={{ minHeight: "64px", maxHeight: "88px" }}
                    >
                      <p
                        className="text-sm leading-relaxed line-clamp-3"
                        style={{
                          color: "#333333",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: "1.6",
                        }}
                      >
                        {day.one_liner || "기록이 없습니다"}
                      </p>
                    </div>

                    {/* Key Mood Badge - Fixed Position */}
                    <div
                      className="mb-4 flex-shrink-0"
                      style={{
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Badge
                        className="text-xs px-4 py-1.5 rounded-full"
                        style={{
                          backgroundColor: "#E5EEF5",
                          color: "#5A7A8F",
                          border: "none",
                          fontWeight: "500",
                        }}
                      >
                        {day.key_mood || "감정 없음"}
                      </Badge>
                    </div>

                    {/* Keywords - Flexible Height with Max */}
                    <div
                      className="flex flex-wrap gap-2 flex-shrink-0"
                      style={{
                        minHeight: "44px",
                        maxHeight: "68px",
                        alignContent: "flex-start",
                      }}
                    >
                      {day.keywords && day.keywords.length > 0 ? (
                        day.keywords.slice(0, 3).map((keyword, kidx) => (
                          <Badge
                            key={kidx}
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: "#FAFAF8",
                              color: "#6B7A6F",
                              border: "1px solid #EFE9E3",
                              fontWeight: "500",
                            }}
                          >
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p
                          className="text-xs"
                          style={{ color: "#9CA3AF", fontStyle: "italic" }}
                        >
                          키워드 없음
                        </p>
                      )}
                    </div>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : (
        <Card
          className="p-8 sm:p-12"
          style={{
            backgroundColor: "white",
            border: "1px solid #EFE9E3",
            textAlign: "center",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F5F5" }}
            >
              <Inbox className="w-8 h-8" style={{ color: "#9CA3AF" }} />
            </div>
            <div>
              <p
                className="text-base font-medium mb-1"
                style={{ color: "#333333" }}
              >
                일별 데이터가 없습니다
              </p>
              <p className="text-sm" style={{ color: "#6B7A6F", opacity: 0.7 }}>
                이번 주의 일별 기록이 아직 없어요
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Emotion Trend Visualization */}
      {hasEmotions ? (
        <Card
          className="p-4 sm:p-5 mt-4"
          style={{
            backgroundColor: "white",
            border: "1px solid #EFE9E3",
          }}
        >
          <p
            className="text-xs sm:text-sm mb-3 font-medium"
            style={{ color: "#6B7A6F" }}
          >
            이번 주 감정의 흐름
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {emotionTrend.map((emotion, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  className="text-sm px-3 py-1.5"
                  style={{
                    backgroundColor: "#E8EFE8",
                    color: "#6B7A6F",
                    border: "none",
                  }}
                >
                  {emotion}
                </Badge>
                {index < emotionTrend.length - 1 && (
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#A8BBA8" }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card
          className="p-6 mt-4"
          style={{
            backgroundColor: "#FAFAF8",
            border: "1px dashed #E5E7EB",
            textAlign: "center",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              감정 데이터가 없습니다
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
