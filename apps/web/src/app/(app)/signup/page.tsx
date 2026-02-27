import { Suspense } from "react";
import { SignUpView } from "@/components/signup/SignUpView";

// Next.js 15: searchParams는 Promise입니다
async function SignUpContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = params.message as string | undefined;
  const isSocialOnboarding = params.social === "1";
  const initialEmail = params.email as string | undefined;

  return (
    <SignUpView
      initialMessage={message || null}
      initialEmail={initialEmail || null}
      isSocialOnboarding={isSocialOnboarding}
    />
  );
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <SignUpContent searchParams={searchParams} />
    </Suspense>
  );
}
