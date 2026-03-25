const highlights = [
  {
    title: "Mobile First",
    body: "Built for pastors, ministry staff, and leaders who need to act in the moment, not wait until they are back at a desk."
  },
  {
    title: "Multi-Tenant",
    body: "Structured for many churches and campuses, with clean separation and room for the platform to grow."
  },
  {
    title: "Outreach Centric",
    body: "Designed to track community impact, follow-up, and the movement from first touch to ongoing discipleship."
  }
];

const features = [
  "People, groups, and attendance in one connected system",
  "Outreach impact tracking that helps churches see what is changing in their communities",
  "Discipleship steps that show progress beyond basic attendance metrics",
  "Leader mode for volunteers and team leads who need focused access",
  "Reports that turn ministry activity into clear action"
];

const outcomes = [
  {
    label: "Organize ministry",
    copy: "Keep people, groups, attendance, follow-up, and internal workflows aligned across the church."
  },
  {
    label: "Care for people",
    copy: "Help staff and leaders see needs, take action, and maintain meaningful context around every relationship."
  },
  {
    label: "Reach communities",
    copy: "Measure outreach, understand impact, and support the next step from connection to discipleship."
  }
];

export default function MarketingHomePage() {
  return (
    <main className="page">
      <section className="hero">
        <header className="topbar">
          <img
            className="wordmark"
            src="/brand/logo-primary.svg"
            alt="Pulse RMS"
            width="220"
            height="36"
          />
          <p className="topline">Church relationship management for the next era of ministry</p>
        </header>

        <div className="hero-copy">
          <p className="eyebrow">Mission</p>
          <h1>Simple, powerful technology built for real-world church life.</h1>
          <p className="lede">
            We help churches organize their ministry, care for their people, and reach their
            communities through simple, powerful technology built for real-world church life.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#platform">
              Explore the platform
            </a>
            <a className="button button-secondary" href="#features">
              See what it includes
            </a>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Pulse RMS product focus">
          <img
            className="mark"
            src="/brand/logo-mark.svg"
            alt=""
            width="72"
            height="64"
          />
          <p className="panel-label">Built for the full church journey</p>
          <ul className="signal-list">
            <li>First-time guest to active disciple</li>
            <li>Outreach event to measurable impact</li>
            <li>Pastoral care to long-term relationship health</li>
          </ul>
        </aside>
      </section>

      <section className="section" id="platform">
        <div className="section-heading">
          <p className="eyebrow">What We’re Building</p>
          <h2>A platform shaped by how churches actually work.</h2>
          <p>
            Pulse RMS is designed to support ministry teams with tools that feel connected, clear,
            and fast on every screen size.
          </p>
        </div>

        <div className="highlight-grid">
          {highlights.map((highlight) => (
            <article className="feature-card" key={highlight.title}>
              <h3>{highlight.title}</h3>
              <p>{highlight.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-contrast" id="features">
        <div className="section-heading">
          <p className="eyebrow">Core Capabilities</p>
          <h2>The foundation for a modern church RMS.</h2>
        </div>

        <div className="capability-layout">
          <div className="feature-list-card">
            <ul className="feature-list">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="story-card">
            <p className="story-kicker">Why it matters</p>
            <p className="story-copy">
              Churches do not just need a place to store data. They need a system that helps them
              act on relationships, recognize growth, and stay attentive to the people they serve.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Impact</p>
          <h2>Built to move ministry forward.</h2>
        </div>

        <div className="outcome-grid">
          {outcomes.map((outcome) => (
            <article className="outcome-card" key={outcome.label}>
              <h3>{outcome.label}</h3>
              <p>{outcome.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
