import { LoadingSpinner } from "../ui/LoadingSpinner";

export function WeeklyVividLoadingState() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="py-16">
          <LoadingSpinner
            message="주간 VIVID를 불러오는 중..."
            size="md"
            showMessage={true}
          />
        </div>
      </div>
    </div>
  );
}
