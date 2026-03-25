import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseConfig, type Database } from "@pulse/supabase";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publicKey } = requireSupabaseConfig();

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Cookie writes from Server Components are handled by the request proxy.
        }
      }
    }
  });
}
