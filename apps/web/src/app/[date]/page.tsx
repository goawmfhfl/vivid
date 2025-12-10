"use client";

import { Home } from "@/components/Home";
import { withAuth } from "@/components/auth";
import { useParams } from "next/navigation";

function DatePage() {
  const params = useParams();
  const date = params.date as string;

  // 날짜 형식 검증 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>잘못된 날짜 형식입니다.</p>
      </div>
    );
  }

  return <Home selectedDate={date} />;
}

export default withAuth(DatePage);
