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
  return new OpenAI({
    apiKey,
    timeout: 30000, // 30초 타임아웃 (gpt-4o-mini는 더 빠르므로)
    maxRetries: 1, // 재시도 최소화
  });
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

  // 모델 선택: 환경 변수로 지정하거나 기본값 사용
  // GPT-5.1이 출시되었으므로 기본값을 gpt-5.1로 설정 (사용 불가능하면 gpt-4o-mini로 fallback)
  const model = "gpt-5.1";

  try {
    const completion = await openai.chat.completions.create({
      model,
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
      temperature: 0.3, // 구조화된 응답에는 낮은 temperature가 더 빠르고 일관성 있음
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI categorization");
    }

    return JSON.parse(content) as CategorizedRecords;
  } catch (error: any) {
    // GPT-5.1이 사용 불가능한 경우 gpt-4o-mini로 fallback
    if (
      model === "gpt-5.1" &&
      (error?.message?.includes("model") ||
        error?.code === "model_not_found" ||
        error?.status === 404)
    ) {
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
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
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI categorization");
      }

      return JSON.parse(content) as CategorizedRecords;
    }
    throw error;
  }
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

  // 모델 선택: 환경 변수로 지정하거나 기본값 사용
  // GPT-5.1이 출시되었으므로 기본값을 gpt-5.1로 설정 (사용 불가능하면 gpt-4o-mini로 fallback)
  const model = process.env.OPENAI_MODEL || "gpt-5.1";

  try {
    const completion = await openai.chat.completions.create({
      model,
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
      temperature: 0.3, // 구조화된 응답에는 낮은 temperature가 더 빠르고 일관성 있음
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI report generation");
    }

    return JSON.parse(content) as DailyReport;
  } catch (error: any) {
    // GPT-5.1이 사용 불가능한 경우 gpt-4o-mini로 fallback
    if (
      model === "gpt-5.1" &&
      (error?.message?.includes("model") ||
        error?.code === "model_not_found" ||
        error?.status === 404)
    ) {
      console.warn(
        "GPT-5.1 모델을 사용할 수 없습니다. gpt-4o-mini로 fallback합니다."
      );
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI report generation");
      }

      return JSON.parse(content) as DailyReport;
    }
    throw error;
  }
}
