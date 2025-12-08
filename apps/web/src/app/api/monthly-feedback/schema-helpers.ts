import { MonthlyReportSchema } from "./schema";
import type { JsonSchema } from "../types";

/**
 * 각 섹션별 스키마 추출 함수
 */
export function getSectionSchema(sectionName: string) {
  // 타입 안전성을 위해 타입 단언 사용
  const schemaProps = MonthlyReportSchema.schema.properties as Record<
    string,
    JsonSchema
  >;
  const fullSchema = schemaProps[sectionName];

  if (!fullSchema) {
    throw new Error(`Schema not found for section: ${sectionName}`);
  }

  return {
    name: `${
      sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
    }Response`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        [sectionName]: fullSchema,
      },
      required: [sectionName],
    },
    strict: true,
  };
}
