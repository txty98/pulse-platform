"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function buildSignUpRedirect(message: string) {
  return `/signup?error=${encodeURIComponent(message)}`;
}

function buildLoginRedirect(message: string) {
  return `/?message=${encodeURIComponent(message)}`;
}

export async function signUpChurchTenant(formData: FormData) {
  const churchName = String(formData.get("church_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!churchName || !email || !password) {
    redirect(buildSignUpRedirect("Church name, email, and password are required."));
  }

  const supabase = await createClient();
  const signUpResult = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        church_name: churchName
      }
    }
  });

  if (signUpResult.error) {
    redirect(buildSignUpRedirect(signUpResult.error.message));
  }

  if (signUpResult.data.session) {
    redirect("/dashboard");
  }

  redirect(buildLoginRedirect("Check your email to confirm your account, then sign in."));
}
