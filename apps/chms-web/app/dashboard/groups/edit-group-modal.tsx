"use client";

import { useState } from "react";
import { updateGroup } from "./actions";

type EditGroupModalProps = {
  tenantSlug: string;
  activeTab: string;
  group: {
    id: string;
    name: string;
    group_type: string;
    status: string;
    leader_person_id: string | null;
  };
  people: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
};

function GroupEditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 20 4.5-1 9.9-9.9a1.4 1.4 0 0 0 0-2l-1.5-1.5a1.4 1.4 0 0 0-2 0L5 15.5 4 20Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export function EditGroupModal({ tenantSlug, activeTab, group, people }: EditGroupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="person-profile-action" type="button" aria-label="Edit group" onClick={() => setIsOpen(true)}>
        <GroupEditIcon />
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-group-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="edit-group-title">Edit Group</h2>
                <p className="panel-copy">Update the core details for this group.</p>
              </div>
            </div>

            <form action={updateGroup} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />
              <input name="group_id" type="hidden" value={group.id} />
              <input name="return_tab" type="hidden" value={activeTab} />

              <label className="field">
                <span>Group Name</span>
                <input defaultValue={group.name} name="name" type="text" required />
              </label>

              <label className="field">
                <span>Group Type</span>
                <select className="people-select" defaultValue={group.group_type} name="group_type">
                  <option value="group">Group</option>
                  <option value="class">Class</option>
                  <option value="team">Team</option>
                  <option value="ministry">Ministry</option>
                </select>
              </label>

              <label className="field">
                <span>Leader</span>
                <select className="people-select" defaultValue={group.leader_person_id ?? ""} name="leader_person_id">
                  <option value="">No leader assigned</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {formatName(person)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Status</span>
                <select className="people-select" defaultValue={group.status} name="status">
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Save Changes
                </button>
                <button className="people-modal-dismiss" onClick={() => setIsOpen(false)} type="button">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
