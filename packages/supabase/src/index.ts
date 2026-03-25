import { createClient } from "@supabase/supabase-js";

type Database = Record<string, never>;

function readEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  return undefined;
}

export function getSupabaseConfigSnapshot() {
  const url =
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ??
    readEnv("EXPO_PUBLIC_SUPABASE_URL") ??
    readEnv("SUPABASE_URL");
  const anonKey =
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("SUPABASE_ANON_KEY");

  return {
    url,
    anonKey,
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey)
  };
}

export function createPulseSupabaseClient() {
  const { url, anonKey } = getSupabaseConfigSnapshot();

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient<Database>(url, anonKey);
}
