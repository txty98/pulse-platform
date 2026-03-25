"use client";

import { useState } from "react";
import { addGroupMember } from "./actions";

type AddGroupMemberModalProps = {
  tenantSlug: string;
  groupId: string;
  activeTab: string;
  people: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
};

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export function AddGroupMemberModal({ tenantSlug, groupId, activeTab, people }: AddGroupMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="section-action-button" type="button" onClick={() => setIsOpen(true)}>
        Add Member
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-group-member-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="add-group-member-title">Add Group Member</h2>
                <p className="panel-copy">Add a person from this tenant into the group.</p>
              </div>
            </div>

            {people.length > 0 ? (
              <form action={addGroupMember} className="people-form">
                <input name="tenant" type="hidden" value={tenantSlug} />
                <input name="group_id" type="hidden" value={groupId} />
                <input name="return_tab" type="hidden" value={activeTab} />

                <label className="field">
                  <span>Person</span>
                  <select className="people-select" defaultValue={people[0]?.id ?? ""} name="person_id" required>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {formatName(person)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Member Role</span>
                  <input name="member_role" type="text" placeholder="Leader, Member, Volunteer..." />
                </label>

                <label className="field">
                  <span>Joined Date</span>
                  <input name="joined_at" type="date" />
                </label>

                <div className="people-modal-actions">
                  <button className="primary-button" type="submit">
                    Add to Group
                  </button>
                  <button className="people-modal-dismiss" onClick={() => setIsOpen(false)} type="button">
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="person-section-empty">
                <p>Everyone in this tenant is already a member of this group.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
