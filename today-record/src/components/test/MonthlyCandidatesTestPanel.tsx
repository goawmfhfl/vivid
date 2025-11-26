"use client";

import { useState } from "react";
import { MonthlyCandidatesSection } from "../summaries/MonthlyCandidatesSection";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";

/**
 * 월간 후보 섹션 테스트 패널
 * 개발 환경에서만 표시되며, 날짜를 조작하여 테스트할 수 있습니다.
 */
export function MonthlyCandidatesTestPanel() {
  const [testDate, setTestDate] = useState<string>("2025-11-30"); // 기본값: 11월 마지막 일

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestDate(e.target.value);
  };

  const testDateObj = new Date(testDate + "T00:00:00+09:00"); // KST 기준

  // 프로덕션 환경에서는 절대 표시하지 않음
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      className="mb-6 p-4 rounded-lg"
      style={{
        backgroundColor: "#FFF9E6",
        border: "1px solid #F59E0B",
      }}
    >
      <div className="mb-4">
        <h3
          className="mb-2"
          style={{
            color: "#92400E",
            fontSize: "0.95rem",
            fontWeight: "600",
          }}
        >
          🧪 월간 후보 섹션 테스트 (개발 환경 전용)
        </h3>
        <p
          style={{
            color: "#78350F",
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "12px",
          }}
        >
          날짜를 변경하여 월간 피드백 생성 버튼이 올바르게 표시되는지 테스트할
          수 있습니다.
        </p>
        <div className="flex items-center gap-3">
          <label
            htmlFor="test-date"
            style={{
              color: "#78350F",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            테스트 날짜:
          </label>
          <input
            id="test-date"
            type="date"
            value={testDate}
            onChange={handleDateChange}
            className="px-3 py-1.5 rounded border"
            style={{
              borderColor: "#D97706",
              fontSize: "0.85rem",
            }}
          />
          <span
            style={{
              color: "#78350F",
              fontSize: "0.75rem",
              opacity: 0.7,
            }}
          >
            (KST 기준)
          </span>
        </div>
        <div className="mt-2">
          <p
            style={{
              color: "#78350F",
              fontSize: "0.75rem",
              opacity: 0.7,
            }}
          >
            선택한 날짜: {testDate} (KST)
            <br />
            예: 11월 30일을 선택하면 11월달에 대한 피드백 생성 버튼이 표시됩니다.
          </p>
        </div>
      </div>

      {/* 테스트용 MonthlyCandidatesSection */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: "white",
          border: "1px solid #EFE9E3",
        }}
      >
        <MonthlyCandidatesSection referenceDate={testDateObj} />
      </div>
    </div>
  );
}

