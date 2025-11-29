interface LogViewHeaderProps {
  year: number;
  month: number;
  recordCount: number;
  isLoading: boolean;
}

export function LogViewHeader({
  year,
  month,
  recordCount,
  isLoading,
}: LogViewHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="mb-1" style={{ color: "#333333", fontSize: "1.5rem" }}>
        지난 기록
      </h1>
      <p style={{ color: "#4E4B46", opacity: 0.7, fontSize: "0.9rem" }}>
        {isLoading
          ? "로딩 중..."
          : `${year}년 ${month}월: ${recordCount}개의 기록`}
      </p>
    </header>
  );
}
