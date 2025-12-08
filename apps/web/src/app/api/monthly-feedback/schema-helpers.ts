import { MonthlyReportSchema } from "./schema";
import type { JsonSchema } from "../types";

/**
 * 각 섹션별 스키마 추출 함수
 * @param sectionName 섹션 이름
 * @param isPro Pro 멤버십 여부 (closing_report의 경우 this_month_identity 포함 여부 결정)
 */
export function getSectionSchema(sectionName: string, isPro: boolean = false) {
  // 타입 안전성을 위해 타입 단언 사용
  const schemaProps = MonthlyReportSchema.schema.properties as Record<
    string,
    JsonSchema
  >;
  const fullSchema = schemaProps[sectionName];

  if (!fullSchema) {
    throw new Error(`Schema not found for section: ${sectionName}`);
  }

  // closing_report의 경우, Pro 여부에 따라 this_month_identity 처리
  let processedSchema = fullSchema;
  if (sectionName === "closing_report") {
    const schemaCopy = JSON.parse(JSON.stringify(fullSchema)) as JsonSchema;
    if (schemaCopy.type === "object" && schemaCopy.properties) {
      const props = schemaCopy.properties as Record<string, JsonSchema>;
      const hasThisMonthIdentity = Object.prototype.hasOwnProperty.call(
        props,
        "this_month_identity"
      );

      if (!isPro) {
        // Pro가 아니면 this_month_identity 제거
        if (hasThisMonthIdentity) {
          delete props.this_month_identity;
        }
      }

      // required 배열도 조정
      if (schemaCopy.required && Array.isArray(schemaCopy.required)) {
        if (isPro) {
          // Pro일 때: this_month_identity가 properties에 있으면 required에도 추가
          if (
            hasThisMonthIdentity &&
            !schemaCopy.required.includes("this_month_identity")
          ) {
            schemaCopy.required.push("this_month_identity");
          }
        } else {
          // Pro가 아닐 때: this_month_identity를 required에서 제거 (이미 properties에서 제거됨)
          schemaCopy.required = schemaCopy.required.filter(
            (key: string) => key !== "this_month_identity"
          );
        }
      }

      processedSchema = schemaCopy;
    }
  }

  return {
    name: `${
      sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
    }Response`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        [sectionName]: processedSchema,
      },
      required: [sectionName],
    },
    strict: true,
  };
}
