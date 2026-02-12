import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decrypt } from "@/lib/encryption";
import { getKSTDateString } from "@/lib/date-utils";
import { buildUserPersonaPrompt } from "./prompts";
import {
  decryptJsonbFields,
  encryptJsonbFields,
  type JsonbValue,
} from "@/lib/jsonb-encryption";
import { SYSTEM_PROMPT_USER_PERSONA, UserPersonaSchema } from "./schema";

type VividRecordRow = {
  user_id: string;
  kst_date: string;
  type: string;
  content: string;
  created_at: string;
};

type PersonaRow = {
  user_id: string;
  persona: Record<string, unknown>;
  source_start: string | null;
  source_end: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonaResult = {
  userId: string;
  status: "updated" | "skipped";
  reason?: string;
};

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }
  return new GoogleGenerativeAI(apiKey);
}

function cleanSchemaRecursive(schemaObj: unknown): unknown {
  if (typeof schemaObj !== "object" || schemaObj === null) {
    return schemaObj;
  }

  if (Array.isArray(schemaObj)) {
    return schemaObj.map(cleanSchemaRecursive);
  }

  const obj = schemaObj as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  const allowedFields = new Set(["type", "properties", "required", "items", "enum"]);

  for (const [key, value] of Object.entries(obj)) {
    if (!allowedFields.has(key)) {
      continue;
    }

    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      const propertiesObj = value as Record<string, unknown>;
      const cleanedProperties: Record<string, unknown> = {};
      for (const [propKey, propValue] of Object.entries(propertiesObj)) {
        const cleanedProp = cleanSchemaRecursive(propValue);
        if (cleanedProp !== null && cleanedProp !== undefined) {
          cleanedProperties[propKey] = cleanedProp;
        }
      }
      if (Object.keys(cleanedProperties).length > 0) {
        cleaned[key] = cleanedProperties;
      }
    } else if (key === "items" && value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = cleanSchemaRecursive(value);
    } else if (key === "required" && Array.isArray(value)) {
      cleaned[key] = value;
    } else if (key === "type" || key === "enum") {
      cleaned[key] = value;
    } else if (value && typeof value === "object") {
      cleaned[key] = cleanSchemaRecursive(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function getKstDateRange(days: number): {
  startDate: string;
  endDate: string;
} {
  const endDate = getKSTDateString();
  const endKstDate = new Date(`${endDate}T00:00:00+09:00`);
  const startKstDate = new Date(endKstDate);
  startKstDate.setDate(startKstDate.getDate() - (days - 1));

  const startDate = getKSTDateString(startKstDate);

  return {
    startDate,
    endDate,
  };
}

export function getKstDateRangeFromBase(
  baseDate: string,
  days: number
): {
  startDate: string;
  endDate: string;
} {
  const endKstDate = new Date(`${baseDate}T00:00:00+09:00`);
  const startKstDate = new Date(endKstDate);
  startKstDate.setDate(startKstDate.getDate() - (days - 1));

  const startDate = getKSTDateString(startKstDate);

  return {
    startDate,
    endDate: baseDate,
  };
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** 이전 주(월~일)의 KST 날짜 범위 반환. baseDate가 비어있으면 오늘(KST) 기준 */
export function getPreviousWeekKstRange(baseDate?: string): {
  startDate: string;
  endDate: string;
} {
  const refDateStr = baseDate || getKSTDateString();
  const ref = new Date(`${refDateStr}T00:00:00+09:00`);
  const dayOfWeek = ref.getUTCDay(); // 0=Sun, 1=Mon, ...
  const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
  const lastSunday = new Date(ref);
  lastSunday.setUTCDate(ref.getUTCDate() - daysToLastSunday);
  const lastMonday = new Date(lastSunday);
  lastMonday.setUTCDate(lastSunday.getUTCDate() - 6);

  return {
    startDate: getKSTDateString(lastMonday),
    endDate: getKSTDateString(lastSunday),
  };
}

/** 이전 월의 KST 날짜 범위 반환. baseDate가 비어있으면 오늘(KST) 기준 */
export function getPreviousMonthKstRange(baseDate?: string): {
  startDate: string;
  endDate: string;
  month: string; // "YYYY-MM"
} {
  const refDateStr = baseDate || getKSTDateString();
  const [y, m] = refDateStr.split("-").map(Number);
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const firstDay = new Date(prevYear, prevMonth - 1, 1);
  const lastDay = new Date(prevYear, prevMonth, 0);

  return {
    startDate: getKSTDateString(firstDay),
    endDate: getKSTDateString(lastDay),
    month: `${prevYear}-${String(prevMonth).padStart(2, "0")}`,
  };
}

function parsePersonaResponse(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw);

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    !Array.isArray(parsed) &&
    Object.keys(parsed).length > 0
  ) {
    return parsed as Record<string, unknown>;
  }

  throw new Error("Invalid persona response format");
}

async function generatePersona(prompt: string): Promise<Record<string, unknown>> {
  const geminiClient = getGeminiClient();
  const modelName = "gemini-3-pro-preview";

  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT_USER_PERSONA,
  });

  const cleanedSchema = cleanSchemaRecursive(UserPersonaSchema.schema) as {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };

  if (!cleanedSchema.properties || Object.keys(cleanedSchema.properties).length === 0) {
    throw new Error("Persona schema properties is empty");
  }

  const contents = [
    {
      role: "user" as const,
      parts: [{ text: prompt }],
    },
  ];

  const generationConfig: {
    responseMimeType: "application/json";
    responseSchema: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  } = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: cleanedSchema.properties,
      ...(cleanedSchema.required && { required: cleanedSchema.required }),
    },
  };

  const request = {
    contents,
    generationConfig,
  } as unknown as GenerateContentRequest;

  try {
    const result = await model.generateContent(request);
    const content = result.response.text();

    if (!content) {
      throw new Error("No content from Gemini");
    }

    return parsePersonaResponse(content);
  } catch (error) {
    throw error;
  }
}

async function fetchExistingPersona(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string
): Promise<PersonaRow | null> {
  const { data, error } = await supabase
    .from("user_persona")
    .select("user_id, persona, source_start, source_end, created_at, updated_at")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user_persona: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const decryptedPersona = data.persona
    ? (decryptJsonbFields(data.persona) as Record<string, unknown>)
    : data.persona;

  return {
    ...(data as PersonaRow),
    persona: decryptedPersona,
  };
}

async function fetchVividRecords(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  startDate: string,
  endDate: string
): Promise<VividRecordRow[]> {
  const { data, error } = await supabase
    .from("vivid_records")
    .select("user_id, kst_date, type, content, created_at")
    .eq("user_id", userId)
    .in("type", ["vivid", "dream", "review"])
    .gte("kst_date", startDate)
    .lte("kst_date", endDate)
    .order("kst_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch vivid_records: ${error.message}`);
  }

  return (data || []) as VividRecordRow[];
}

export async function updatePersonaForUser(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  startDate: string,
  endDate: string
): Promise<PersonaResult> {
  const vividRecords = await fetchVividRecords(supabase, userId, startDate, endDate);

  if (!vividRecords.length) {
    return { userId, status: "skipped", reason: "no_records" };
  }

  // 일주일 구간에서 vivid-records가 7개 미만이면 인사이트 생성하지 않음
  const MIN_RECORDS_FOR_PERSONA = 7;
  if (vividRecords.length < MIN_RECORDS_FOR_PERSONA) {
    return {
      userId,
      status: "skipped",
      reason: "insufficient_records",
    };
  }

  const decrypted = vividRecords.map((row) => ({
    ...row,
    content: decrypt(row.content),
  }));

  const existingPersonaRow = await fetchExistingPersona(supabase, userId);

  const prompt = buildUserPersonaPrompt({
    records: decrypted.map((row) => ({
      kst_date: row.kst_date,
      type: row.type,
      content: row.content,
      created_at: row.created_at,
    })),
    startDate,
    endDate,
    existingPersona: existingPersonaRow?.persona || null,
  });

  const persona = await generatePersona(prompt);
  const encryptedPersona = encryptJsonbFields(persona as JsonbValue) as Record<
    string,
    unknown
  >;

  const now = new Date().toISOString();
  const { error: upsertError } = await supabase.from("user_persona").upsert(
    {
      user_id: userId,
      persona: encryptedPersona,
      source_start: startDate,
      source_end: endDate,
      updated_at: now,
      ...(existingPersonaRow ? {} : { created_at: now }),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    throw new Error(`Failed to upsert user_persona: ${upsertError.message}`);
  }

  return { userId, status: "updated" };
}
