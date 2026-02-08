import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { getKSTDateString } from "@/lib/date-utils";
import { buildUserPersonaPrompt } from "./prompts";
import { SYSTEM_PROMPT_USER_PERSONA, UserPersonaSchema } from "./schema";
import type { Report, TrendData } from "@/types/daily-vivid";

export const maxDuration = 180;

type DailyVividRow = {
  user_id: string;
  report_date: string;
  day_of_week: string | null;
  report: Report | null;
  trend: TrendData | null;
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

type PersonaResult = {
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

  const allowedFields = new Set([
    "type",
    "properties",
    "required",
    "items",
    "enum",
  ]);

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

function getKstDateRange(days: number): {
  startDate: string;
  endDate: string;
  startIso: string;
  endIsoExclusive: string;
} {
  const endDate = getKSTDateString();
  const endKstDate = new Date(`${endDate}T00:00:00+09:00`);
  const startKstDate = new Date(endKstDate);
  startKstDate.setDate(startKstDate.getDate() - (days - 1));

  const startDate = getKSTDateString(startKstDate);
  const endExclusive = new Date(endKstDate);
  endExclusive.setDate(endExclusive.getDate() + 1);

  return {
    startDate,
    endDate,
    startIso: startKstDate.toISOString(),
    endIsoExclusive: endExclusive.toISOString(),
  };
}

function getKstDateRangeFromBase(
  baseDate: string,
  days: number
): {
  startDate: string;
  endDate: string;
  startIso: string;
  endIsoExclusive: string;
} {
  const endKstDate = new Date(`${baseDate}T00:00:00+09:00`);
  const startKstDate = new Date(endKstDate);
  startKstDate.setDate(startKstDate.getDate() - (days - 1));

  const startDate = getKSTDateString(startKstDate);
  const endExclusive = new Date(endKstDate);
  endExclusive.setDate(endExclusive.getDate() + 1);

  return {
    startDate,
    endDate: baseDate,
    startIso: startKstDate.toISOString(),
    endIsoExclusive: endExclusive.toISOString(),
  };
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
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
  const modelName = "gemini-3-flash-preview";

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

  const result = await model.generateContent(request);
  const content = result.response.text();

  if (!content) {
    throw new Error("No content from Gemini");
  }

  return parsePersonaResponse(content);
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

  return data as PersonaRow;
}

async function fetchDailyVividRecords(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  startIso: string,
  endIsoExclusive: string
): Promise<DailyVividRow[]> {
  const { data, error } = await supabase
    .from("daily_vivid")
    .select("user_id, report_date, day_of_week, report, trend, created_at")
    .eq("user_id", userId)
    .gte("created_at", startIso)
    .lt("created_at", endIsoExclusive)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily_vivid: ${error.message}`);
  }

  return (data || []) as DailyVividRow[];
}

async function updatePersonaForUser(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  startDate: string,
  endDate: string,
  startIso: string,
  endIsoExclusive: string
): Promise<PersonaResult> {
  const dailyVividRows = await fetchDailyVividRecords(
    supabase,
    userId,
    startIso,
    endIsoExclusive
  );

  if (!dailyVividRows.length) {
    return { userId, status: "skipped", reason: "no_records" };
  }

  const decrypted = dailyVividRows.map((row) =>
    decryptDailyVivid(row as unknown as Record<string, unknown>) as DailyVividRow
  );

  const existingPersonaRow = await fetchExistingPersona(supabase, userId);

  const prompt = buildUserPersonaPrompt({
    records: decrypted.map((row) => ({
      report_date: row.report_date,
      day_of_week: row.day_of_week,
      report: row.report,
      trend: row.trend,
      created_at: row.created_at,
    })),
    startDate,
    endDate,
    existingPersona: existingPersonaRow?.persona || null,
  });

  const persona = await generatePersona(prompt);

  const now = new Date().toISOString();
  const { error: upsertError } = await supabase.from("user_persona").upsert(
    {
      user_id: userId,
      persona,
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "25", 10), 1),
      100
    );
    const baseDate = searchParams.get("baseDate");
    const targetUserId = searchParams.get("userId");

    const supabase = getServiceSupabase();

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const { startDate, endDate, startIso, endIsoExclusive } = baseDate
      ? getKstDateRangeFromBase(baseDate, 7)
      : getKstDateRange(7);

    let users: Array<{ id: string }> = [];
    if (targetUserId) {
      users = [{ id: targetUserId }];
    } else {
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers({
          page,
          perPage: limit,
        });
      if (usersError) {
        throw new Error(`Failed to list users: ${usersError.message}`);
      }
      users = usersData?.users || [];
    }

    const results: PersonaResult[] = [];

    for (const user of users) {
      try {
        const result = await updatePersonaForUser(
          supabase,
          user.id,
          startDate,
          endDate,
          startIso,
          endIsoExclusive
        );
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[update-persona] user ${user.id} failed:`, message);
        results.push({ userId: user.id, status: "skipped", reason: message });
      }
    }

    const updatedCount = results.filter((r) => r.status === "updated").length;
    const skippedCount = results.length - updatedCount;

    return NextResponse.json({
      ok: true,
      page,
      limit,
      processed: results.length,
      updated: updatedCount,
      skipped: skippedCount,
      nextPage: users.length === limit ? page + 1 : null,
    });
  } catch (error) {
    console.error("Cron update-persona error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
