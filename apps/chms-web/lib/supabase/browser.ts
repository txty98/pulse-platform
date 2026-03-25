import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig, type Database } from "@pulse/supabase";

export function createClient() {
  const { url, publicKey } = requireSupabaseConfig();

  return createBrowserClient<Database>(url, publicKey);
}
