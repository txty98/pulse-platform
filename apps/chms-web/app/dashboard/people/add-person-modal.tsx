"use client";

import { useState } from "react";
import { createPerson } from "./actions";

export function AddPersonModal({ tenantName, tenantSlug }: { tenantName: string; tenantSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="people-add-button" onClick={() => setIsOpen(true)} type="button">
        <span className="people-add-button-icon" aria-hidden="true">
          +
        </span>
        Add Person
      </button>

      {isOpen ? (
        <div
          className="people-modal-backdrop"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-person-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="add-person-title">Add Person</h2>
                <p className="panel-copy">Create a tenant-safe person profile in {tenantName}.</p>
              </div>
            </div>

            <form action={createPerson} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />

              <label className="field">
                <span>First Name</span>
                <input name="first_name" type="text" placeholder="Jessica" required />
              </label>

              <label className="field">
                <span>Last Name</span>
                <input name="last_name" type="text" placeholder="King" required />
              </label>

              <label className="field">
                <span>Preferred Name</span>
                <input name="preferred_name" type="text" placeholder="Jess" />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" type="email" placeholder="jessica@church.org" />
              </label>

              <label className="field">
                <span>Phone</span>
                <input name="phone" type="tel" placeholder="(555) 555-5555" />
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Save Person
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
