import { getRequiredDashboardContext } from "../../../lib/dashboard-context";
import { updateProfileSettings, updateWorkspaceSettings } from "./actions";

type SettingsPageProps = {
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.supabase || !context.access?.user || !context.access.activeMembership) {
    return null;
  }

  const tenantId = context.access.activeMembership.tenant.id;
  const canManageTenantResult = await (context.supabase.rpc as any)("has_tenant_permission", {
    target_tenant_id: tenantId,
    target_permission_code: "tenant.manage"
  });
  const canManageTenant = Boolean(canManageTenantResult.data);

  const profile = context.access.profile;
  const tenant = context.access.activeMembership.tenant;

  return (
    <section className="people-module">
      <article className="panel-card settings-panel">
        <div className="panel-header">
          <div>
            <h2>Settings</h2>
            <p className="panel-copy">Manage your profile and workspace configuration for this tenant.</p>
          </div>
        </div>

        {params.error ? <p className="people-form-error">{params.error}</p> : null}
        {params.message ? <p className="people-form-message">{params.message}</p> : null}

        <div className="settings-grid">
          <article className="panel-card settings-card">
            <div className="panel-header">
              <div>
                <h2>Your Profile</h2>
                <p className="panel-copy">These details are tied to your user profile across the app.</p>
              </div>
            </div>

            <form action={updateProfileSettings} className="people-form">
              <input name="tenant" type="hidden" value={tenant.slug} />

              <label className="field">
                <span>Email</span>
                <input type="email" value={profile?.email ?? context.access.user.email ?? ""} disabled readOnly />
              </label>

              <label className="field">
                <span>Full Name</span>
                <input defaultValue={profile?.fullName ?? ""} name="full_name" type="text" placeholder="Pulse Admin" />
              </label>

              <label className="field">
                <span>Avatar URL</span>
                <input
                  defaultValue={profile?.avatarUrl ?? ""}
                  name="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                />
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Save Profile
                </button>
              </div>
            </form>
          </article>

          <article className="panel-card settings-card">
            <div className="panel-header">
              <div>
                <h2>Workspace</h2>
                <p className="panel-copy">Update the tenant name and slug used across this workspace.</p>
              </div>
            </div>

            {canManageTenant ? (
              <form action={updateWorkspaceSettings} className="people-form">
                <input name="tenant" type="hidden" value={tenant.slug} />

                <label className="field">
                  <span>Workspace Name</span>
                  <input defaultValue={tenant.name} name="tenant_name" type="text" required />
                </label>

                <label className="field">
                  <span>Workspace Slug</span>
                  <input defaultValue={tenant.slug} name="tenant_slug" type="text" required />
                </label>

                <div className="people-modal-actions">
                  <button className="primary-button" type="submit">
                    Save Workspace
                  </button>
                </div>
              </form>
            ) : (
              <div className="person-section-empty">
                <p>Your current role does not include permission to manage workspace settings.</p>
              </div>
            )}
          </article>
        </div>
      </article>
    </section>
  );
}
