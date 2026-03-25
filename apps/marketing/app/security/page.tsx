import { PageHero } from "../_components/page-hero";
import { SiteHeader } from "../_components/site-header";

const securityCards = [
  {
    title: "Tenant separation",
    body: "Pulse is designed so each church's data stays scoped with clear separation and architecture that respects privacy boundaries."
  },
  {
    title: "Role-based access",
    body: "Staff, admins, and leaders need different levels of access. The platform is being shaped around focused permissions and responsible visibility."
  },
  {
    title: "Private information lockdown",
    body: "Sensitive pastoral, personal, and family information deserves strong defaults, disciplined infrastructure, and auditable patterns."
  }
];

export default function SecurityPage() {
  return (
    <main className="page">
      <SiteHeader />

      <PageHero
        eyebrow="Security"
        title="Church data should be protected with seriousness and discipline."
        description="Pulse is being built around the stewardship responsibility churches carry when they manage personal, pastoral, family, and outreach information."
      />

      <section className="section">
        <div className="highlight-grid">
          {securityCards.map((card) => (
            <article className="feature-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
