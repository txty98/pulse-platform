"use client";

import { useMemo, useState } from "react";
import { savePersonAccountAccess } from "./actions";

type RoleOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  permissions: Array<{
    code: string;
    label: string;
  }>;
};

type AccountAccessFormProps = {
  tenantSlug: string;
  personId: string;
  initialEmail: string;
  initialRoleId: string;
  roles: RoleOption[];
  linkedAccount: {
    email: string | null;
    status: string;
    roleName: string | null;
  } | null;
  pendingInvitation: {
    email: string;
    status: string;
    invitedAt: string;
    roleName: string | null;
  } | null;
};

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AccountAccessForm({
  tenantSlug,
  personId,
  initialEmail,
  initialRoleId,
  roles,
  linkedAccount,
  pendingInvitation
}: AccountAccessFormProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId]
  );

  return (
    <article className="panel-card person-section-card">
      <div className="panel-header">
        <div>
          <h2>Tenant Access</h2>
          <p className="person-section-subtitle">Invite this person as a tenant user and assign their role-based access.</p>
        </div>
      </div>

      {linkedAccount ? (
        <div className="account-state-card">
          <strong>Linked User</strong>
          <p>
            {linkedAccount.email ?? "No profile email available"} • {formatStatus(linkedAccount.status)}
          </p>
          <span>{linkedAccount.roleName ? `Current role: ${linkedAccount.roleName}` : "No role assigned yet"}</span>
        </div>
      ) : null}

      {!linkedAccount && pendingInvitation ? (
        <div className="account-state-card is-pending">
          <strong>Pending Invitation</strong>
          <p>
            {pendingInvitation.email} • {formatStatus(pendingInvitation.status)}
          </p>
          <span>
            {pendingInvitation.roleName ? `Pending role: ${pendingInvitation.roleName}` : "Role not selected"}
          </span>
        </div>
      ) : null}

      <form action={savePersonAccountAccess} className="people-form account-access-form">
        <input name="tenant" type="hidden" value={tenantSlug} />
        <input name="person_id" type="hidden" value={personId} />
        <input name="return_tab" type="hidden" value="account" />

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            defaultValue={initialEmail}
            placeholder="person@church.org"
            required
          />
        </label>

        <label className="field">
          <span>Role</span>
          <select
            className="people-select"
            name="role_id"
            value={selectedRoleId}
            onChange={(event) => setSelectedRoleId(event.target.value)}
            required
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>

        {selectedRole ? (
          <div className="account-permission-card">
            <strong>{selectedRole.name} Permissions</strong>
            <p>{selectedRole.description ?? "Permissions inherited from the selected role."}</p>
            <div className="account-permission-list">
              {selectedRole.permissions.map((permission) => (
                <span className="account-permission-pill" key={permission.code}>
                  {permission.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="people-modal-actions">
          <button className="primary-button" type="submit">
            {linkedAccount ? "Update Account Access" : pendingInvitation ? "Update Invitation" : "Invite to Tenant"}
          </button>
        </div>
      </form>
    </article>
  );
}
