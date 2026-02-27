"use client";

import { Suspense } from "react";
import { withAuth } from "@/components/auth/withAuth";
import { SurveyForm } from "@/components/survey/SurveyForm";

function SurveyPageContent() {
  return <SurveyForm />;
}

function SurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <SurveyPageContent />
    </Suspense>
  );
}

export default withAuth(SurveyPage);
