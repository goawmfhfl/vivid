export function WeeklyFeedbackLoadingState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <div className="text-center py-16">
        <div className="animate-pulse">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#EFE9E3" }}
          >
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: "#6B7A6F" }}
            />
          </div>
          <p style={{ color: "#4E4B46", fontSize: "0.95rem" }}>
            주간 피드백을 불러오는 중…
          </p>
        </div>
      </div>
    </div>
  );
}
