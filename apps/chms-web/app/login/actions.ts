"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function buildLoginRedirect(message: string) {
  return `/?error=${encodeURIComponent(message)}`;
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(buildLoginRedirect("Email and password are required."));
  }

  const supabase = await createClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInResult.error) {
    redirect(buildLoginRedirect(signInResult.error.message));
  }

  redirect("/dashboard");
}
