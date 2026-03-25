import { PageHero } from "../_components/page-hero";
import { SiteHeader } from "../_components/site-header";

export default function ContactPage() {
  return (
    <main className="page">
      <SiteHeader />

      <PageHero
        eyebrow="Contact"
        title="Talk with us about your church, your team, and what comes next."
        description="Whether you are thinking about migration, outreach systems, reporting, or leader workflows, Pulse is being designed to support the practical realities of ministry."
        split
      >
        <div className="story-card" id="login">
          <p className="story-kicker">Login</p>
          <p className="story-copy">
            Existing users will eventually sign in here to access Pulse RMS and the wider
            platform.
          </p>
        </div>
      </PageHero>

      <section className="section section-tight">
        <div className="single-column-panel">
          <article className="feature-list-card">
            <p className="story-kicker">Reach out</p>
            <ul className="feature-list">
              <li>Book a product walkthrough</li>
              <li>Ask about early access and launch timing</li>
              <li>Share your church's operational needs and challenges</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="single-column-panel">
          <article className="feature-card">
            <h3>Where this can go</h3>
            <p>
              This page is ready for a real contact form, scheduling link, or early-access funnel
              whenever you want to connect it to the next stage of the marketing site.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
