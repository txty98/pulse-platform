import Link from "next/link";

export default function AutomationsPage() {
  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header people-panel-header">
          <div>
            <h2>Automations</h2>
            <p className="panel-copy">Build repeatable workflows for follow-up, assignments, and recurring admin work.</p>
          </div>
        </div>

        <div className="people-empty-state">
          <h3>Automation builder coming next</h3>
          <p>This module is ready for the next pass. We can use it for recurring tasks, workflow triggers, and operational automations.</p>
          <Link className="section-action-button" href="/dashboard/forms">
            Back to Forms
          </Link>
        </div>
      </article>
    </section>
  );
}
