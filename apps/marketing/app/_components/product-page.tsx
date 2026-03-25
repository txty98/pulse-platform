import Link from "next/link";
import { PageHero } from "./page-hero";
import { SiteHeader } from "./site-header";

type ProductPageProps = {
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  pillars: Array<{ title: string; body: string }>;
  outcomes: string[];
};

export function ProductPage({
  name,
  eyebrow,
  title,
  description,
  pillars,
  outcomes
}: ProductPageProps) {
  return (
    <main className="page">
      <SiteHeader />

      <PageHero eyebrow={eyebrow} title={title} description={description} />

      <section className="section section-tight">
        <div className="single-column-panel">
          <div className="feature-list-card">
            <p className="story-kicker">{name}</p>
            <ul className="feature-list">
              {outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">What It Includes</p>
          <h2>Built to support the real cadence of church work.</h2>
        </div>

        <div className="highlight-grid">
          {pillars.map((pillar) => (
            <article className="feature-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-contrast">
        <div className="section-heading">
          <p className="eyebrow">Next Step</p>
          <h2>See how {name} fits into the wider Pulse platform.</h2>
          <p>
            Each Pulse product is designed to work as part of a larger church operations system,
            sharing context without creating complexity for your team.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="button button-primary" href="/contact">
            Talk with us
          </Link>
          <Link className="button button-secondary" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
