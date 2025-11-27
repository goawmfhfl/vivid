"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { withAuth } from "@/components/auth";

interface MigrationStats {
  totalProcessed: number;
  totalEncrypted: number;
  totalSkipped: number;
  totalErrors: number;
}

interface FeedbackMigrationStats {
  daily: MigrationStats;
  weekly: MigrationStats;
  monthly: MigrationStats;
}

interface RecordsMigrationResponse {
  message: string;
  stats: MigrationStats;
  errors?: Array<{ id: number; error: string }>;
}

interface FeedbacksMigrationResponse {
  message: string;
  stats: FeedbackMigrationStats;
  errors?: Array<{ table: string; id: string; error: string }>;
}

function MigrationPage() {
  const { data: currentUser } = useCurrentUser();
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [migrationType, setMigrationType] = useState<
    "records" | "feedbacks" | "all"
  >("all");
  const [recordsResult, setRecordsResult] =
    useState<RecordsMigrationResponse | null>(null);
  const [feedbacksResult, setFeedbacksResult] =
    useState<FeedbacksMigrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    if (!currentUser) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsRunning(true);
    setError(null);
    setRecordsResult(null);
    setFeedbacksResult(null);

    try {
      // Records 마이그레이션
      if (migrationType === "records" || migrationType === "all") {
        try {
          const recordsResponse = await fetch(
            "/api/migration/encrypt-records",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: currentUser.id,
                batchSize: 100,
                dryRun: isDryRun,
              }),
            }
          );

          if (!recordsResponse.ok) {
            const errorData = await recordsResponse.json();
            throw new Error(errorData.error || "Records 마이그레이션 실패");
          }

          const recordsData: RecordsMigrationResponse =
            await recordsResponse.json();
          setRecordsResult(recordsData);
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Records 마이그레이션 중 오류 발생";
          setError((prev) =>
            prev ? `${prev}\n${errorMessage}` : errorMessage
          );
        }
      }

      // Feedbacks 마이그레이션
      if (migrationType === "feedbacks" || migrationType === "all") {
        try {
          const feedbacksResponse = await fetch(
            "/api/migration/encrypt-feedbacks",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: currentUser.id,
                tableType: "all",
                batchSize: 50,
                dryRun: isDryRun,
              }),
            }
          );

          if (!feedbacksResponse.ok) {
            const errorData = await feedbacksResponse.json();
            throw new Error(errorData.error || "Feedbacks 마이그레이션 실패");
          }

          const feedbacksData: FeedbacksMigrationResponse =
            await feedbacksResponse.json();
          setFeedbacksResult(feedbacksData);
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Feedbacks 마이그레이션 중 오류 발생";
          setError((prev) =>
            prev ? `${prev}\n${errorMessage}` : errorMessage
          );
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError((prev) => (prev ? `${prev}\n${errorMessage}` : errorMessage));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: "#000000" }}>
            데이터 암호화 마이그레이션
          </h1>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="checkbox"
                id="dryRun"
                checked={isDryRun}
                onChange={(e) => setIsDryRun(e.target.checked)}
                className="w-4 h-4"
                disabled={isRunning}
              />
              <label
                htmlFor="dryRun"
                className="text-sm"
                style={{ color: "#000000" }}
              >
                Dry Run 모드 (실제 데이터 변경 없이 테스트)
              </label>
            </div>

            <div className="mb-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: "#000000" }}
              >
                마이그레이션 대상:
              </label>
              <div className="flex gap-4">
                <label
                  className="flex items-center gap-2"
                  style={{ color: "#000000" }}
                >
                  <input
                    type="radio"
                    name="migrationType"
                    value="records"
                    checked={migrationType === "records"}
                    onChange={(e) =>
                      setMigrationType(e.target.value as typeof migrationType)
                    }
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "#000000" }}>
                    Records만
                  </span>
                </label>
                <label
                  className="flex items-center gap-2"
                  style={{ color: "#000000" }}
                >
                  <input
                    type="radio"
                    name="migrationType"
                    value="feedbacks"
                    checked={migrationType === "feedbacks"}
                    onChange={(e) =>
                      setMigrationType(e.target.value as typeof migrationType)
                    }
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "#000000" }}>
                    Feedbacks만
                  </span>
                </label>
                <label
                  className="flex items-center gap-2"
                  style={{ color: "#000000" }}
                >
                  <input
                    type="radio"
                    name="migrationType"
                    value="all"
                    checked={migrationType === "all"}
                    onChange={(e) =>
                      setMigrationType(e.target.value as typeof migrationType)
                    }
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "#000000" }}>
                    전체
                  </span>
                </label>
              </div>
            </div>

            <p className="text-sm mb-4" style={{ color: "#000000" }}>
              현재 사용자({currentUser?.email || "로딩 중..."})의 데이터를
              암호화합니다.
            </p>

            <Button
              onClick={handleMigration}
              disabled={isRunning || !currentUser}
              className="w-full"
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
              }}
            >
              {isRunning
                ? "마이그레이션 진행 중..."
                : isDryRun
                ? "테스트 실행 (Dry Run)"
                : "마이그레이션 실행"}
            </Button>
          </div>

          {error && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
              }}
            >
              <p className="font-semibold">오류 발생</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isRunning && (
            <div className="mb-4">
              <LoadingSpinner message="마이그레이션 진행 중..." size="md" />
            </div>
          )}

          {recordsResult && (
            <div
              className="p-4 rounded-lg mb-4"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #86EFAC",
              }}
            >
              <h2
                className="font-semibold mb-3 text-lg"
                style={{ color: "#000000" }}
              >
                Records 마이그레이션 결과
              </h2>
              <div className="space-y-2 text-sm" style={{ color: "#000000" }}>
                <div>
                  <span className="font-medium" style={{ color: "#000000" }}>
                    총 처리된 레코드:
                  </span>{" "}
                  {recordsResult.stats.totalProcessed}개
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#000000" }}>
                    암호화된 레코드:
                  </span>{" "}
                  {recordsResult.stats.totalEncrypted}개
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#000000" }}>
                    이미 암호화된 레코드:
                  </span>{" "}
                  {recordsResult.stats.totalSkipped}개
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#000000" }}>
                    오류 발생:
                  </span>{" "}
                  {recordsResult.stats.totalErrors}개
                </div>
              </div>

              {recordsResult.errors && recordsResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600 mb-2">오류 상세:</p>
                  <div className="max-h-40 overflow-y-auto">
                    {recordsResult.errors.map((err, idx) => (
                      <div key={idx} className="text-xs text-red-600">
                        ID {err.id}: {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {feedbacksResult && (
            <div
              className="p-4 rounded-lg mb-4"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #86EFAC",
              }}
            >
              <h2
                className="font-semibold mb-3 text-lg"
                style={{ color: "#000000" }}
              >
                Feedbacks 마이그레이션 결과
              </h2>

              <div className="mb-4">
                <h3
                  className="font-medium mb-2 text-base"
                  style={{ color: "#000000" }}
                >
                  Daily Feedback
                </h3>
                <div
                  className="space-y-1 text-sm ml-4"
                  style={{ color: "#000000" }}
                >
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      처리:
                    </span>{" "}
                    {feedbacksResult.stats.daily?.totalProcessed || 0}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      암호화:
                    </span>{" "}
                    {feedbacksResult.stats.daily?.totalEncrypted || 0}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      스킵:
                    </span>{" "}
                    {feedbacksResult.stats.daily?.totalSkipped || 0}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      오류:
                    </span>{" "}
                    {feedbacksResult.stats.daily?.totalErrors || 0}개
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="font-medium mb-2 text-base"
                  style={{ color: "#000000" }}
                >
                  Weekly Feedback
                </h3>
                <div
                  className="space-y-1 text-sm ml-4"
                  style={{ color: "#000000" }}
                >
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      처리:
                    </span>{" "}
                    {feedbacksResult.stats.weekly.totalProcessed}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      암호화:
                    </span>{" "}
                    {feedbacksResult.stats.weekly.totalEncrypted}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      스킵:
                    </span>{" "}
                    {feedbacksResult.stats.weekly.totalSkipped}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      오류:
                    </span>{" "}
                    {feedbacksResult.stats.weekly.totalErrors}개
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="font-medium mb-2 text-base"
                  style={{ color: "#000000" }}
                >
                  Monthly Feedback
                </h3>
                <div
                  className="space-y-1 text-sm ml-4"
                  style={{ color: "#000000" }}
                >
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      처리:
                    </span>{" "}
                    {feedbacksResult.stats.monthly.totalProcessed}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      암호화:
                    </span>{" "}
                    {feedbacksResult.stats.monthly.totalEncrypted}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      스킵:
                    </span>{" "}
                    {feedbacksResult.stats.monthly.totalSkipped}개
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#000000" }}>
                      오류:
                    </span>{" "}
                    {feedbacksResult.stats.monthly.totalErrors}개
                  </div>
                </div>
              </div>

              {feedbacksResult.errors && feedbacksResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600 mb-2">오류 상세:</p>
                  <div className="max-h-40 overflow-y-auto">
                    {feedbacksResult.errors.map((err, idx) => (
                      <div key={idx} className="text-xs text-red-600">
                        {err.table} ID {err.id}: {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm" style={{ color: "#000000" }}>
              <strong>주의사항:</strong>
            </p>
            <ul
              className="text-sm mt-2 list-disc list-inside space-y-1"
              style={{ color: "#000000" }}
            >
              <li>이 기능은 개발 환경에서만 사용 가능합니다.</li>
              <li>마이그레이션 전에 데이터 백업을 권장합니다.</li>
              <li>Dry Run 모드로 먼저 테스트해보세요.</li>
              <li>마이그레이션 중에는 다른 작업을 하지 마세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(MigrationPage);
