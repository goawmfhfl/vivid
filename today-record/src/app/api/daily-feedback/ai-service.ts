import OpenAI from "openai";
import {
  DailyReportSchema,
  SYSTEM_PROMPT,
  RecordCategorizationSchema,
  SYSTEM_PROMPT_CATEGORIZATION,
} from "./schema";
import type { Record, CategorizedRecords, DailyReport } from "./types";
import { buildCategorizationPrompt, buildReportPrompt } from "./prompts";

/**
 * OpenAI 클라이언트를 지연 초기화 (빌드 시점 오류 방지)
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable."
    );
  }
  return new OpenAI({ apiKey });
}

/**
 * 기록을 카테고리로 분류
 */
export async function categorizeRecords(
  records: Record[],
  date: string
): Promise<CategorizedRecords> {
  const prompt = buildCategorizationPrompt(records, date);
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: SYSTEM_PROMPT_CATEGORIZATION },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: RecordCategorizationSchema.name,
        schema: RecordCategorizationSchema.schema,
        strict: RecordCategorizationSchema.strict,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content from OpenAI categorization");
  }

  return JSON.parse(content) as CategorizedRecords;
}

/**
 * 카테고리화된 기록을 기반으로 일일 리포트 생성
 */
export async function generateDailyReport(
  categorized: CategorizedRecords,
  date: string
): Promise<DailyReport> {
  const prompt = buildReportPrompt(categorized, date);
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: DailyReportSchema.name,
        schema: DailyReportSchema.schema,
        strict: DailyReportSchema.strict,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content from OpenAI report generation");
  }

  return JSON.parse(content) as DailyReport;
}
