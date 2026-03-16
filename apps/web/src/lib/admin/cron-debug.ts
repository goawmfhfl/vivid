import { API_ENDPOINTS } from "@/constants";
import { decrypt } from "@/lib/encryption";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata } from "@/lib/subscription-utils";
import { getPreviousWeekSunToSatKstRange } from "@/app/api/cron/update-persona/helpers";

type AdminUserLite = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

type RecordRow = {
  user_id: string | null;
  kst_date: string;
  type: string;
  content: string;
};

type WeeklyVividRow = {
  user_id: string | null;
};

export type MissingWeeklyIdea = {
  kstDate: string;
  type: string;
  contentPreview: string;
};

export type MissingWeeklyProUser = {
  userId: string;
  email: string | null;
  name: string | null;
  weekStart: string;
  weekEnd: string;
  isPro: true;
  hasWeeklyVivid: false;
  ideaCount: number;
  ideas: MissingWeeklyIdea[];
};

export type MissingWeeklyProUsersQuery = {
  baseDate?: string;
  page: number;
  limit: number;
};

export type MissingWeeklyProUsersQueryResult = {
  weekStart: string;
  weekEnd: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  users: MissingWeeklyProUser[];
  stats: {
    totalUsers: number;
    proUsers: number;
    missingWeeklyVividUsers: number;
    withIdeasUsers: number;
  };
};

function safeDecryptContent(value: string): string {
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}

function toPreview(value: string, max = 120): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}...`;
}

function chunkArray<T>(items: T[], size: number): T[][]
{
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function listAllUsers(): Promise<AdminUserLite[]> {
  const supabase = getServiceSupabase();
  const perPage = 1000;
  let page = 1;
  let hasMore = true;
  const users: AdminUserLite[] = [];

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
    const current = (data?.users || []) as AdminUserLite[];
    users.push(...current);
    hasMore = current.length === perPage;
    page += 1;
  }

  return users;
}

async function fetchMissingWeeklyVividUserIds(
  userIds: string[],
  weekStart: string
): Promise<Set<string>> {
  if (userIds.length === 0) return new Set<string>();

  const supabase = getServiceSupabase();
  const existing = new Set<string>();
  const chunks = chunkArray(userIds, 500);

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.WEEKLY_VIVID)
      .select("user_id")
      .in("user_id", chunk)
      .eq("week_start", weekStart);

    if (error) {
      throw new Error(`Failed to fetch weekly_vivid rows: ${error.message}`);
    }

    for (const row of (data || []) as WeeklyVividRow[]) {
      if (row.user_id) existing.add(row.user_id);
    }
  }

  return new Set(userIds.filter((id) => !existing.has(id)));
}

function resolveDisplayNameFromMetadata(
  metadata: Record<string, unknown> | undefined
): string | null {
  if (!metadata) return null;

  const candidates = [
    metadata.username,
    metadata.name,
    metadata.full_name,
    metadata.user_name,
    metadata.nickname,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

async function fetchIdeasByUser(
  userIds: string[],
  weekStart: string,
  weekEnd: string
): Promise<Map<string, RecordRow[]>> {
  const supabase = getServiceSupabase();
  const byUser = new Map<string, RecordRow[]>();
  const chunks = chunkArray(userIds, 500);

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .select("user_id, kst_date, type, content")
      .in("user_id", chunk)
      .in("type", ["vivid", "dream"])
      .gte("kst_date", weekStart)
      .lte("kst_date", weekEnd)
      .order("kst_date", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch vivid_records: ${error.message}`);
    }

    for (const row of (data || []) as RecordRow[]) {
      if (!row.user_id) continue;
      const list = byUser.get(row.user_id) || [];
      list.push(row);
      byUser.set(row.user_id, list);
    }
  }

  return byUser;
}

export async function queryMissingWeeklyProUsers(
  query: MissingWeeklyProUsersQuery
): Promise<MissingWeeklyProUsersQueryResult> {
  const { startDate, endDate } = getPreviousWeekSunToSatKstRange(query.baseDate);
  const allUsers = await listAllUsers();
  const proUsers = allUsers.filter((user) =>
    isProFromMetadata(user.user_metadata as Record<string, unknown> | undefined)
  );
  const proUserIds = proUsers.map((user) => user.id);

  const missingWeeklyIds = await fetchMissingWeeklyVividUserIds(proUserIds, startDate);
  const missingIds = Array.from(missingWeeklyIds);
  const ideasByUser = await fetchIdeasByUser(missingIds, startDate, endDate);
  const userMap = new Map(proUsers.map((user) => [user.id, user]));

  const filteredUsers: MissingWeeklyProUser[] = missingIds
    .map((userId) => {
      const records = ideasByUser.get(userId) || [];
      if (records.length === 0) return null;

      const authUser = userMap.get(userId);
      const ideas: MissingWeeklyIdea[] = records.slice(0, 5).map((record) => ({
        kstDate: record.kst_date,
        type: record.type,
        contentPreview: toPreview(safeDecryptContent(record.content)),
      }));

      return {
        userId,
        email: authUser?.email || null,
        name: resolveDisplayNameFromMetadata(authUser?.user_metadata) || null,
        weekStart: startDate,
        weekEnd: endDate,
        isPro: true,
        hasWeeklyVivid: false,
        ideaCount: records.length,
        ideas,
      };
    })
    .filter((user): user is MissingWeeklyProUser => user !== null)
    .sort((a, b) => b.ideaCount - a.ideaCount);

  const total = filteredUsers.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
  const start = (query.page - 1) * query.limit;
  const paginated = filteredUsers.slice(start, start + query.limit);

  return {
    weekStart: startDate,
    weekEnd: endDate,
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    users: paginated,
    stats: {
      totalUsers: allUsers.length,
      proUsers: proUsers.length,
      missingWeeklyVividUsers: missingIds.length,
      withIdeasUsers: filteredUsers.length,
    },
  };
}
