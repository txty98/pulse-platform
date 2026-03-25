import Link from "next/link";
import { getDashboardSnapshot } from "../../lib/dashboard";
import { getRequiredDashboardContext } from "../../lib/dashboard-context";

type MetricDescriptor = {
  label: string;
  value: string;
  tone: "blue" | "green" | "mint";
  icon: "people" | "groups" | "giving";
  helper: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function getMetricValue(metrics: Awaited<ReturnType<typeof getDashboardSnapshot>>["metrics"], label: string) {
  return metrics.find((metric) => metric.label === label)?.value ?? 0;
}

function SummaryIcon({ name }: { name: MetricDescriptor["icon"] }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "people":
      return (
        <svg {...sharedProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 8v6" />
          <path d="M17 11h6" />
        </svg>
      );
    case "groups":
      return (
        <svg {...sharedProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <circle cx="17.5" cy="8.5" r="2.5" />
          <path d="M15 20a5 5 0 0 1 6.5-4.7" />
        </svg>
      );
    case "giving":
      return (
        <svg {...sharedProps}>
          <path d="M12 3v18" />
          <path d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5-2 3.5-4.5 3.5-4.5-1.6-4.5-3.5" />
        </svg>
      );
  }
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
      <path d="m5.6 5.6 4.2 4.2" />
      <path d="m14.2 14.2 4.2 4.2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

type DashboardPageProps = {
  searchParams?: Promise<{
    tenant?: string;
  }>;
};

export default async function DashboardOverviewPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.access || !context.supabase) {
    return null;
  }

  if (!context.access.activeMembership) {
    return null;
  }

  const snapshot = await getDashboardSnapshot(
    context.supabase,
    context.access.activeMembership.tenant.id
  );

  const peopleCount = getMetricValue(snapshot.metrics, "People");
  const familyCount = getMetricValue(snapshot.metrics, "Families");
  const groupCount = getMetricValue(snapshot.metrics, "Groups");
  const attendanceEventCount = getMetricValue(snapshot.metrics, "Attendance Events");
  const givingThisMonth = 0;
  const averageAttendance = attendanceEventCount > 0 ? Math.max(peopleCount, 1) : 0;

  const topMetrics: MetricDescriptor[] = [
    {
      label: "Total People",
      value: String(peopleCount),
      tone: "blue",
      icon: "people",
      helper: `${familyCount} family records`
    },
    {
      label: "Active Groups",
      value: String(groupCount),
      tone: "green",
      icon: "groups",
      helper: "Ministry groups in progress"
    },
    {
      label: "Giving This Month",
      value: formatCurrency(givingThisMonth),
      tone: "mint",
      icon: "giving",
      helper: "Giving is not connected yet"
    }
  ];

  const recentInteractions = [
    {
      name: context.access.profile?.fullName ?? context.access.user?.email ?? "New admin",
      type: "tenant onboarding",
      note: `Signed in to ${context.access.activeMembership.tenant.name} and opened the dashboard.`,
      date: "Today"
    },
    {
      name: context.access.activeMembership.tenant.name,
      type: "workspace created",
      note: `Primary role assignment: ${context.access.activeMembership.roles.map((role) => role.name).join(", ") || "No roles assigned yet"}.`,
      date: "Today"
    }
  ];

  return (
    <>
      <section className="dashboard-card-row">
        {topMetrics.map((metric) => (
          <article className="summary-card" key={metric.label}>
            <div className={`summary-icon tone-${metric.tone}`}>
              <SummaryIcon name={metric.icon} />
            </div>
            <strong className="summary-value">{metric.value}</strong>
            <h2>{metric.label}</h2>
            <p>{metric.helper}</p>
          </article>
        ))}

        <article className="impact-card">
          <div className="impact-header">
            <h2>Weekly Impact</h2>
            <button className="impact-link" type="button">
              Show Chart
            </button>
          </div>

          <div className="impact-grid">
            <div className="impact-stat tone-sky">
              <span>Avg. Attendance</span>
              <strong>{averageAttendance}</strong>
            </div>
            <div className="impact-stat tone-green">
              <span>Reach Total</span>
              <strong>{peopleCount}</strong>
            </div>
          </div>
        </article>
      </section>

      {snapshot.warning ? (
        <section className="inline-warning">
          <p>{snapshot.warning}</p>
        </section>
      ) : null}

      <section className="panel-card insights-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">
              <InsightsIcon />
            </span>
            <h2>Smart Insights</h2>
          </div>
        </div>

        <div className="insights-grid">
          <article className="insight-box">
            <div className="insight-heading">
              <span className="insight-icon birthday-icon">✦</span>
              <h3>Upcoming Birthdays</h3>
            </div>
            <p>
              {peopleCount > 0
                ? "Birthday insights will appear here as people records are enriched with profile dates."
                : "No people records yet. Add your first households to start surfacing milestone reminders."}
            </p>
          </article>

          <article className="insight-box">
            <div className="insight-heading">
              <span className="insight-icon alert-icon">
                <AlertIcon />
              </span>
              <h3>Needs Attention</h3>
            </div>
            <p>
              {groupCount > 0
                ? "Your first groups are in place. Next step is connecting attendance and follow-up workflows."
                : "Create groups, add leaders, and connect attendance to unlock actual ministry follow-up signals."}
            </p>
          </article>
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions-grid">
            <Link className="quick-action-card" href="/dashboard/people">
              <span className="quick-action-icon tone-blue">+</span>
              <div>
                <strong>Add Person</strong>
                <p>Create profile</p>
              </div>
            </Link>

            <Link className="quick-action-card" href="/dashboard/groups">
              <span className="quick-action-icon tone-green">+</span>
              <div>
                <strong>Create Group</strong>
                <p>Set up ministry</p>
              </div>
            </Link>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h2>Recent Interactions</h2>
          </div>

          <div className="interaction-list">
            {recentInteractions.map((item) => (
              <article className="interaction-card" key={`${item.name}-${item.type}`}>
                <div className="interaction-copy">
                  <strong>{item.name}</strong>
                  <span>{item.type}</span>
                  <p>{item.note}</p>
                </div>
                <span className="interaction-date">{item.date}</span>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
