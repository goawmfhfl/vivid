import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowLeft } from "lucide-react";

export function LoadingState() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-10 text-center"
      style={{ color: "#6B7A6F" }}
    >
      로딩 중…
    </div>
  );
}

export function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card
        className="p-6"
        style={{ backgroundColor: "#FFF5F5", border: "1px solid #F5C2C2" }}
      >
        <p style={{ color: "#B00020" }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </Card>
      <div className="mt-4">
        <Button variant="ghost" onClick={onBack} style={{ color: "#6B7A6F" }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card
        className="p-6"
        style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
      >
        <p style={{ color: "#4E4B46" }}>
          해당 날짜의 피드백 데이터가 없습니다.
        </p>
      </Card>
      <div className="mt-4">
        <Button variant="ghost" onClick={onBack} style={{ color: "#6B7A6F" }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
        </Button>
      </div>
    </div>
  );
}
