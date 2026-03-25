"use client";

import { useState } from "react";
import { createPersonNote } from "./actions";

type AddNoteModalProps = {
  tenantSlug: string;
  personId: string;
  activeTab: string;
};

export function AddNoteModal({ tenantSlug, personId, activeTab }: AddNoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="section-action-button" type="button" onClick={() => setIsOpen(true)}>
        Add Note
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-note-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="add-note-title">Add Internal Note</h2>
                <p className="panel-copy">Sensitive internal notes are only visible to authorized administrators.</p>
              </div>
            </div>

            <form action={createPersonNote} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />
              <input name="person_id" type="hidden" value={personId} />
              <input name="return_tab" type="hidden" value={activeTab} />

              <label className="field">
                <span>Title</span>
                <input name="title" type="text" placeholder="Pastoral follow-up" />
              </label>

              <label className="field">
                <span>Note</span>
                <textarea
                  className="note-textarea"
                  name="body"
                  placeholder="Write a sensitive note for admins only..."
                  required
                  rows={6}
                />
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Save Note
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
