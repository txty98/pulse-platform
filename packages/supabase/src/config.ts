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
  const publishableKey =
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    readEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    readEnv("SUPABASE_PUBLISHABLE_KEY");
  const anonKey =
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("SUPABASE_ANON_KEY");
  const publicKey = publishableKey ?? anonKey;

  return {
    url,
    publishableKey,
    anonKey,
    publicKey,
    hasUrl: Boolean(url),
    hasPublishableKey: Boolean(publishableKey),
    hasAnonKey: Boolean(anonKey),
    hasPublicKey: Boolean(publicKey)
  };
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfigSnapshot();

  if (!config.url || !config.publicKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and a publishable or anon key."
    );
  }

  return {
    url: config.url,
    publicKey: config.publicKey
  };
}
