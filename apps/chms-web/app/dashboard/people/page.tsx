import { getRequiredDashboardContext } from "../../../lib/dashboard-context";
import { AddPersonModal } from "./add-person-modal";
import { PeopleTable } from "./people-table";

type PersonRecord = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

type PeoplePageProps = {
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
    limit?: string;
  }>;
};

const PEOPLE_LIMIT_OPTIONS = [50, 100, 500, 1000] as const;

function formatPersonName(person: {
  first_name: string;
  last_name: string;
  preferred_name: string | null;
}) {
  if (person.preferred_name) {
    return `${person.preferred_name} ${person.last_name}`;
  }

  return `${person.first_name} ${person.last_name}`;
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const requestedLimit = Number(params.limit ?? "50");
  const limit = PEOPLE_LIMIT_OPTIONS.includes(requestedLimit as (typeof PEOPLE_LIMIT_OPTIONS)[number])
    ? requestedLimit
    : 50;

  const peopleResult = await context.supabase
    .from("people")
    .select("id, first_name, last_name, preferred_name, email, phone, is_active, created_at")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(limit);

  const people = (peopleResult.data ?? []) as PersonRecord[];
  const activePeopleCount = people.filter((person) => person.is_active).length;
  const withEmailCount = people.filter((person) => person.email).length;
  const withPhoneCount = people.filter((person) => person.phone).length;
  return (
    <>
      <section className="people-module">
        <article className="panel-card people-panel">
          <div className="panel-header people-panel-header">
            <div>
              <h2>People Directory</h2>
              <p className="panel-copy">
                Tenant-scoped profiles for the active church workspace.
              </p>
            </div>
            <AddPersonModal
              tenantName={context.access.activeMembership.tenant.name}
              tenantSlug={context.access.activeMembership.tenant.slug}
            />
          </div>

          {params.error ? <p className="people-form-error">{params.error}</p> : null}
          {params.message ? <p className="people-form-message">{params.message}</p> : null}

          <div className="people-stats">
            <div className="people-stat-pill">
              <strong>{people.length}</strong>
              <span>Total people</span>
            </div>
            <div className="people-stat-pill">
              <strong>{activePeopleCount}</strong>
              <span>Active</span>
            </div>
            <div className="people-stat-pill">
              <strong>{withEmailCount}</strong>
              <span>With email</span>
            </div>
            <div className="people-stat-pill">
              <strong>{withPhoneCount}</strong>
              <span>With phone</span>
            </div>
          </div>

          <div className="people-toolbar">
            <div className="people-toolbar-copy">
              <strong>{people.length}</strong>
              <span>records displayed</span>
            </div>

            <form className="people-limit-form" method="get">
              {params.tenant ? <input name="tenant" type="hidden" value={params.tenant} /> : null}
              <label className="people-limit-label" htmlFor="people-limit">
                Show
              </label>
              <select defaultValue={String(limit)} id="people-limit" name="limit">
                {PEOPLE_LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button className="people-limit-apply" type="submit">
                Apply
              </button>
            </form>
          </div>

          {peopleResult.error ? (
            <div className="people-empty-state">
              <p>{peopleResult.error.message}</p>
            </div>
          ) : people.length === 0 ? (
            <div className="people-empty-state">
              <h3>No people yet</h3>
              <p>Add your first person record to start building the church directory.</p>
            </div>
          ) : (
            <PeopleTable people={people} />
          )}
        </article>
      </section>
    </>
  );
}
