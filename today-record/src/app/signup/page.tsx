import { SignUpView } from "@/components/login/SignUpView";

// Next.js 15: searchParams는 Promise입니다
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = params.message as string | undefined;

  return <SignUpView initialMessage={message || null} />;
}
