import { SignUpView } from "@/components/signup/SignUpView";

// Next.js 15: searchParams는 Promise입니다
export default async function SignUpPage({
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
