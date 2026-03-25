"use client";

import { useState } from "react";
import { addPersonToFamily, createFamilyForPerson, dissolveFamily } from "./actions";

type FamilyActionsProps = {
  activeTab?: string;
  tenantSlug: string;
  profilePerson: {
    id: string;
    first_name: string;
    last_name: string;
  };
  existingFamily: {
    id: string;
    household_name: string;
  } | null;
  availableFamilies: Array<{
    id: string;
    household_name: string;
  }>;
  availablePeople: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
};

type ModalKind = "create" | "join" | "add-member" | "dissolve" | null;

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export function FamilyActions({
  activeTab = "profile",
  tenantSlug,
  profilePerson,
  existingFamily,
  availableFamilies,
  availablePeople
}: FamilyActionsProps) {
  const [activeModal, setActiveModal] = useState<ModalKind>(null);

  return (
    <>
      <div className="person-section-tools">
        {!existingFamily ? (
          <>
            <button className="section-action-button" type="button" onClick={() => setActiveModal("create")}>
              Create Family
            </button>
            <button className="section-action-button is-secondary" type="button" onClick={() => setActiveModal("join")}>
              Add to Existing Family
            </button>
          </>
        ) : (
          <>
            <button className="section-action-button" type="button" onClick={() => setActiveModal("add-member")}>
              Add Person
            </button>
            <button
              className="section-action-button is-danger"
              type="button"
              onClick={() => setActiveModal("dissolve")}
            >
              Dissolve Family
            </button>
          </>
        )}
      </div>

      {activeModal === "create" ? (
        <div className="people-modal-backdrop" onClick={() => setActiveModal(null)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-family-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="create-family-title">Create Family</h2>
                <p className="panel-copy">Create a household and place {formatName(profilePerson)} into it.</p>
              </div>
            </div>

            <form action={createFamilyForPerson} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />
              <input name="person_id" type="hidden" value={profilePerson.id} />
              <input name="return_tab" type="hidden" value={activeTab} />

              <label className="field">
                <span>Household Name</span>
                <input name="household_name" type="text" placeholder="King Family" required />
              </label>

              <label className="field">
                <span>Relationship</span>
                <input name="relationship_to_family" type="text" placeholder="Primary" />
              </label>

              <label className="checkbox-field">
                <input className="checkbox-input" name="is_primary_contact" type="checkbox" defaultChecked />
                <span>Mark as primary family contact</span>
              </label>

              <div className="people-modal-actions">
                <button className="primary-button" type="submit">
                  Create Family
                </button>
                <button className="people-modal-dismiss" type="button" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {activeModal === "join" ? (
        <div className="people-modal-backdrop" onClick={() => setActiveModal(null)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-family-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="join-family-title">Add to Existing Family</h2>
                <p className="panel-copy">Place {formatName(profilePerson)} into an existing family unit.</p>
              </div>
            </div>

            {availableFamilies.length > 0 ? (
              <form action={addPersonToFamily} className="people-form">
                <input name="tenant" type="hidden" value={tenantSlug} />
                <input name="person_id" type="hidden" value={profilePerson.id} />
                <input name="profile_person_id" type="hidden" value={profilePerson.id} />
                <input name="return_tab" type="hidden" value={activeTab} />

                <label className="field">
                  <span>Family</span>
                  <select name="family_id" className="people-select" defaultValue={availableFamilies[0]?.id} required>
                    {availableFamilies.map((family) => (
                      <option key={family.id} value={family.id}>
                        {family.household_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Relationship</span>
                  <input name="relationship_to_family" type="text" placeholder="Spouse, Child, Parent..." />
                </label>

                <label className="checkbox-field">
                  <input className="checkbox-input" name="is_primary_contact" type="checkbox" />
                  <span>Mark as primary family contact</span>
                </label>

                <div className="people-modal-actions">
                  <button className="primary-button" type="submit">
                    Add to Family
                  </button>
                  <button className="people-modal-dismiss" type="button" onClick={() => setActiveModal(null)}>
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="person-section-empty">
                <p>No other family records exist yet for this tenant.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeModal === "add-member" && existingFamily ? (
        <div className="people-modal-backdrop" onClick={() => setActiveModal(null)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-family-member-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="add-family-member-title">Add Person to Family</h2>
                <p className="panel-copy">Add another person into {existingFamily.household_name}.</p>
              </div>
            </div>

            {availablePeople.length > 0 ? (
              <form action={addPersonToFamily} className="people-form">
                <input name="tenant" type="hidden" value={tenantSlug} />
                <input name="family_id" type="hidden" value={existingFamily.id} />
                <input name="profile_person_id" type="hidden" value={profilePerson.id} />
                <input name="return_tab" type="hidden" value={activeTab} />

                <label className="field">
                  <span>Person</span>
                  <select name="person_id" className="people-select" defaultValue={availablePeople[0]?.id} required>
                    {availablePeople.map((person) => (
                      <option key={person.id} value={person.id}>
                        {formatName(person)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Relationship</span>
                  <input name="relationship_to_family" type="text" placeholder="Child, Parent, Sibling..." />
                </label>

                <label className="checkbox-field">
                  <input className="checkbox-input" name="is_primary_contact" type="checkbox" />
                  <span>Mark as primary family contact</span>
                </label>

                <div className="people-modal-actions">
                  <button className="primary-button" type="submit">
                    Add Person
                  </button>
                  <button className="people-modal-dismiss" type="button" onClick={() => setActiveModal(null)}>
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="person-section-empty">
                <p>There are no unassigned people available to add to this family.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeModal === "dissolve" && existingFamily ? (
        <div className="people-modal-backdrop" onClick={() => setActiveModal(null)} role="presentation">
          <div
            className="people-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dissolve-family-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="dissolve-family-title">Dissolve Family</h2>
                <p className="panel-copy">
                  This will remove every person from {existingFamily.household_name} and delete the family record.
                </p>
              </div>
            </div>

            <form action={dissolveFamily} className="people-form">
              <input name="tenant" type="hidden" value={tenantSlug} />
              <input name="family_id" type="hidden" value={existingFamily.id} />
              <input name="profile_person_id" type="hidden" value={profilePerson.id} />
              <input name="return_tab" type="hidden" value={activeTab} />

              <div className="person-section-empty">
                <p>This action cannot be undone from the app yet.</p>
              </div>

              <div className="people-modal-actions">
                <button className="primary-button family-danger-submit" type="submit">
                  Dissolve Family
                </button>
                <button className="people-modal-dismiss" type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
