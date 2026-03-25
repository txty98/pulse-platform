"use client";

import { useState } from "react";
import { createGroup } from "./actions";

type AddGroupModalProps = {
  tenantName: string;
  tenantSlug: string;
  people: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
};

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export function AddGroupModal({ tenantName, tenantSlug, people }: AddGroupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="people-add-button" onClick={() => setIsOpen(true)} type="button">
        <span className="people-add-button-icon" aria-hidden="true">
          +
        </span>
        Create Group
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-group-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="add-group-title">Create Group</h2>
                <p className="panel-copy">Set up a tenant-scoped group inside {tenantName}.</p>
              </div>
            </div>

            <form action={createGroup} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />

              <label className="field">
                <span>Group Name</span>
                <input name="name" type="text" placeholder="Sunday Volunteers" required />
              </label>

              <label className="field">
                <span>Group Type</span>
                <select className="people-select" name="group_type" defaultValue="group">
                  <option value="group">Group</option>
                  <option value="class">Class</option>
                  <option value="team">Team</option>
                  <option value="ministry">Ministry</option>
                </select>
              </label>

              <label className="field">
                <span>Leader</span>
                <select className="people-select" name="leader_person_id" defaultValue="">
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
                <select className="people-select" name="status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Save Group
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
