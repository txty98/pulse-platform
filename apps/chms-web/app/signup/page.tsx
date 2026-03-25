import Link from "next/link";
import { getSupabaseConfigSnapshot } from "@pulse/supabase";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "../../lib/supabase/server";
import { signUpChurchTenant } from "./actions";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
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
        <form className="auth-form" action={signUpChurchTenant}>
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
            <span>Church Name</span>
            <input
              name="church_name"
              type="text"
              autoComplete="organization"
              placeholder="Grace Community Church"
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@church.org" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
            />
          </label>

          <button className="primary-button" type="submit">
            Create Church Workspace
          </button>

          <Link className="secondary-button auth-secondary-button auth-link-button" href="/">
            Back to Sign In
          </Link>

          {params.error ? <p className="form-error">{params.error}</p> : null}

          {!config.hasUrl || !config.hasPublicKey ? (
            <p className="form-note">
              Add `NEXT_PUBLIC_SUPABASE_URL` and a publishable or anon key before testing auth.
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
