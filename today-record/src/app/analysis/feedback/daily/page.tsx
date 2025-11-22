import { DailyFeedbackClient } from "./DailyFeedbackClient";

// Next.js 15: searchParams는 Promise입니다
export default async function DailyFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const dateParam = params.date as string | undefined;
  const date = dateParam || new Date().toISOString().split("T")[0];

  return <DailyFeedbackClient initialDate={date} />;
}
