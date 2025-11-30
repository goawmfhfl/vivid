"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/hooks/useEnvironment";

// 에러를 발생시키는 컴포넌트
function ErrorThrower({ errorType }: { errorType: string }) {
  // 컴포넌트 렌더링 중 에러를 발생시켜야 Error Boundary가 잡을 수 있습니다
  if (errorType === "general") {
    throw new Error(
      "테스트 에러입니다. 이 에러는 의도적으로 발생시킨 것입니다."
    );
  }

  if (errorType === "async") {
    throw new Error("비동기 테스트 에러입니다.");
  }

  if (errorType === "network") {
    throw new Error(
      "네트워크 연결 오류가 발생했습니다. 서버에 연결할 수 없습니다."
    );
  }

  return null;
}

export default function TestErrorPage() {
  const { isTest, isDevelopment } = useEnvironment();
  const [errorType, setErrorType] = useState<string | null>(null);

  // 개발 환경이나 테스트 환경에서만 접근 가능
  if (!isTest && !isDevelopment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center">
          이 페이지는 개발 환경에서만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  // 에러가 발생하면 ErrorThrower 컴포넌트를 렌더링
  if (errorType) {
    return <ErrorThrower errorType={errorType} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">에러 페이지 테스트</h1>
      <p className="mb-6 text-gray-600">
        아래 버튼을 클릭하면 각각 다른 종류의 에러가 발생하여 error.tsx 페이지가
        표시됩니다.
      </p>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">일반 에러</h2>
          <p className="text-sm text-gray-600 mb-3">
            동기적으로 에러를 발생시킵니다.
          </p>
          <Button
            onClick={() => setErrorType("general")}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
            }}
          >
            일반 에러 발생
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">비동기 에러</h2>
          <p className="text-sm text-gray-600 mb-3">
            비동기 작업 후 에러를 발생시킵니다.
          </p>
          <Button
            onClick={() => setErrorType("async")}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
            }}
          >
            비동기 에러 발생
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">네트워크 에러</h2>
          <p className="text-sm text-gray-600 mb-3">
            네트워크 관련 에러를 시뮬레이션합니다.
          </p>
          <Button
            onClick={() => setErrorType("network")}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
            }}
          >
            네트워크 에러 발생
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>참고:</strong> 에러가 발생하면 error.tsx 페이지가 표시됩니다.
          &quot;다시 시도&quot; 버튼을 클릭하면 이 페이지로 돌아옵니다.
        </p>
      </div>
    </div>
  );
}
