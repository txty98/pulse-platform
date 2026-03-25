import { createClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./config";
import type { Database } from "./database";

export function createPulseSupabaseClient() {
  const { url, publicKey } = requireSupabaseConfig();

  return createClient<Database>(url, publicKey);
}
