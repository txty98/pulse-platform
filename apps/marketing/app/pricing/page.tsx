import { PageHero } from "../_components/page-hero";
import { SiteHeader } from "../_components/site-header";

export default function PricingPage() {
  return (
    <main className="page">
      <SiteHeader />

      <PageHero
        eyebrow="Pricing"
        title="Pricing designed to scale with the real shape of church teams."
        description="The goal is to keep Pulse approachable for smaller churches while supporting larger, more complex ministry environments as the platform grows."
      />

      <section className="section">
        <div className="single-column-panel">
          <article className="feature-card">
            <p className="story-kicker">Starting plan</p>
            <h3>Pulse RMS Core</h3>
            <p className="pricing-amount">
              $49 <span>per month</span>
            </p>
            <p>
              This plan gives churches access to the core RMS system, including people, groups,
              attendance, mass contact, and the foundational tools needed to organize ministry well.
            </p>

            <ul className="feature-list">
              <li>People and household management</li>
              <li>Groups and group participation</li>
              <li>Attendance tracking</li>
              <li>Mass contact and communication basics</li>
              <li>Core church relationship management workflows</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
