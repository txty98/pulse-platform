import { pulseBrand } from "@pulse/design-system";
import { getSupabaseConfigSnapshot } from "@pulse/supabase";
import { SectionCard } from "@pulse/ui";

const config = getSupabaseConfigSnapshot();

export default function ChmsDashboardPage() {
  return (
    <main className="page-shell">
      <section className="header">
        <div>
          <p className="eyebrow">{pulseBrand.productName} Workspace</p>
          <h1>Ministry operations with context, not just records.</h1>
        </div>
        <SectionCard title="Supabase Status">
          {config.hasUrl && config.hasAnonKey
            ? "Environment variables are present."
            : "Add Supabase environment variables before connecting data."}
        </SectionCard>
      </section>

      <section className="grid">
        <SectionCard title="People">Households, members, and pastoral notes.</SectionCard>
        <SectionCard title="Care">Follow-up queues, prayer needs, and care workflows.</SectionCard>
        <SectionCard title="Ministry">Groups, attendance, serving, and communication.</SectionCard>
      </section>
    </main>
  );
}
