const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getStoragePublicUrl(
  bucket: string,
  path: string
): string {
  if (!supabaseUrl || !path) return "";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
