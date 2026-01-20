import { MonthlyReportSchema } from "./schema";
import type { JsonSchema } from "../types";

/**
 * 각 섹션별 스키마 추출 함수
 * @param sectionName 섹션 이름
 * @param isPro Pro 멤버십 여부 (report의 this_month_identity 포함 여부 결정)
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

  // report의 경우, Pro 여부에 따라 this_month_identity 처리
  let processedSchema = fullSchema;
  if (sectionName === "report") {
    const schemaCopy = JSON.parse(JSON.stringify(fullSchema)) as JsonSchema;
    if (schemaCopy.type === "object" && schemaCopy.properties) {
      const props = schemaCopy.properties as Record<string, JsonSchema>;
      const hasThisMonthIdentity = Object.prototype.hasOwnProperty.call(
        props,
        "this_month_identity"
      );

      // Pro 여부에 따라 this_month_identity 처리
      if (isPro) {
        // Pro일 때: this_month_identity가 properties에 있고 required에도 포함되어 있는지 확인
        if (
          hasThisMonthIdentity &&
          schemaCopy.required &&
          Array.isArray(schemaCopy.required) &&
          !schemaCopy.required.includes("this_month_identity")
        ) {
          schemaCopy.required.push("this_month_identity");
        }
      } else {
        // Pro가 아닐 때: this_month_identity를 properties와 required에서 모두 제거
        if (hasThisMonthIdentity) {
          delete props["this_month_identity"];
        }
        if (schemaCopy.required && Array.isArray(schemaCopy.required)) {
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
