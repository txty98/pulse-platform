"use client";

import { useState } from "react";
import { updatePerson } from "./actions";

type EditPersonModalProps = {
  tenantSlug: string;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    preferred_name: string | null;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    is_active: boolean;
  };
};

export function EditPersonModal({ tenantSlug, person }: EditPersonModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="person-profile-action" type="button" aria-label="Edit" onClick={() => setIsOpen(true)}>
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
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-person-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="edit-person-title">Edit Person</h2>
                <p className="panel-copy">Update the stored details for this person profile.</p>
              </div>
            </div>

            <form action={updatePerson} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />
              <input name="person_id" type="hidden" value={person.id} />

              <label className="field">
                <span>First Name</span>
                <input name="first_name" type="text" defaultValue={person.first_name} required />
              </label>

              <label className="field">
                <span>Last Name</span>
                <input name="last_name" type="text" defaultValue={person.last_name} required />
              </label>

              <label className="field">
                <span>Preferred Name</span>
                <input name="preferred_name" type="text" defaultValue={person.preferred_name ?? ""} />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" type="email" defaultValue={person.email ?? ""} />
              </label>

              <label className="field">
                <span>Phone</span>
                <input name="phone" type="tel" defaultValue={person.phone ?? ""} />
              </label>

              <label className="field">
                <span>Birth Date</span>
                <input name="birth_date" type="date" defaultValue={person.birth_date ?? ""} />
              </label>

              <label className="checkbox-field">
                <input className="checkbox-input" name="is_active" type="checkbox" defaultChecked={person.is_active} />
                <span>Active person record</span>
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
