import Link from "next/link";
import { SiteHeader } from "./_components/site-header";

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

const products = [
  {
    name: "Pulse RMS",
    slug: "pulse-rms",
    body: "A relationship management system for people, groups, attendance, discipleship, reporting, and everyday church operations."
  },
  {
    name: "Pulse Tasks",
    slug: "pulse-tasks",
    body: "Action-oriented workflows for staff and leaders who need assignment clarity, follow-up, and momentum across ministry teams."
  },
  {
    name: "Pulse Missions",
    slug: "pulse-missions",
    body: "Outreach and mission engagement tools focused on local impact, response tracking, and community follow-through."
  }
];

export default function MarketingHomePage() {
  return (
    <main className="page" id="top">
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Church Relationship Management, Reimagined</p>
          <h1>Organize ministry, care for people, and reach your community.</h1>
          <p className="lede">
            We help churches organize their ministry, care for their people, and reach their
            communities through simple, powerful technology built for real-world church life.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" href="#platform">
              Explore the platform
            </Link>
            <Link className="button button-secondary" href="/products/pulse-rms">
              See what it includes
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="single-column-panel">
          <aside className="hero-panel" aria-label="Pulse RMS product focus">
            <p className="panel-label">What Pulse helps you do</p>
            <div className="hero-metrics">
              <div className="metric-card">
                <strong>People</strong>
                <span>Profiles, households, notes, and relationship context in one place.</span>
              </div>
              <div className="metric-card">
                <strong>Outreach</strong>
                <span>Track response, impact, and next steps beyond event attendance.</span>
              </div>
              <div className="metric-card">
                <strong>Leadership</strong>
                <span>Give staff and leaders focused tools with clear access and reporting.</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" id="about">
        <div className="section-heading">
          <p className="eyebrow">About</p>
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

      <section className="section section-contrast" id="products">
        <div className="section-heading">
          <p className="eyebrow">Products</p>
          <h2>A suite built for the connected work of the church.</h2>
          <p>
            The Pulse platform is designed as a family of tools that share context, move quickly,
            and support ministry from the first conversation to long-term engagement.
          </p>
        </div>

        <div className="highlight-grid">
          {products.map((product) => (
            <article className="feature-card" key={product.name}>
              <h3>{product.name}</h3>
              <p>{product.body}</p>
              <Link className="card-link" href={`/products/${product.slug}`}>
                View product
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="platform">
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
          <p className="eyebrow">Explore More</p>
          <h2>Learn more through dedicated pages for the wider Pulse platform.</h2>
          <p>
            Security, blog, pricing, and contact now live as standalone pages so the marketing site
            can grow like a full product website instead of a single landing page.
          </p>
        </div>

        <div className="highlight-grid">
          <article className="feature-card">
            <h3>Security</h3>
            <p>See how Pulse approaches privacy, access control, and sensitive church data.</p>
            <Link className="card-link" href="/security">
              View security
            </Link>
          </article>
          <article className="feature-card">
            <h3>Blog</h3>
            <p>Read product thinking, ministry systems ideas, and future platform updates.</p>
            <Link className="card-link" href="/blog">
              Visit blog
            </Link>
          </article>
          <article className="feature-card">
            <h3>Pricing and contact</h3>
            <p>Review the pricing direction and talk with us about early access and fit.</p>
            <Link className="card-link" href="/pricing">
              Explore pricing
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
