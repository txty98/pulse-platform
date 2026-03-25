import { getSupabaseConfigSnapshot } from "@pulse/supabase";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { signInWithPassword } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    redirectedFrom?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const config = getSupabaseConfigSnapshot();

  if (config.hasUrl && config.hasPublicKey) {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();

    if (userResult.data.user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <form className="auth-form" action={signInWithPassword}>
          <div className="auth-logo-wrap">
            <Image
              src="/brand/logo-primary.svg"
              alt="Pulse RMS"
              width={276}
              height={46}
              className="auth-logo"
              priority
            />
          </div>

          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@church.org" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              required
            />
          </label>

          <button className="primary-button" type="submit">
            Sign In
          </button>

          <Link className="secondary-button auth-secondary-button auth-link-button" href="/signup">
            Sign Up
          </Link>

          {params.error ? <p className="form-error">{params.error}</p> : null}

          {params.message ? <p className="form-note">{params.message}</p> : null}

          {!config.hasUrl || !config.hasPublicKey ? (
            <p className="form-note">
              Add `NEXT_PUBLIC_SUPABASE_URL` and a publishable or anon key before testing auth.
            </p>
          ) : null}

          {params.redirectedFrom ? (
            <p className="form-note">Authentication is required to view {params.redirectedFrom}.</p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
