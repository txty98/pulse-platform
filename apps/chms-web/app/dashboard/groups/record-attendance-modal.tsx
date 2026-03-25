"use client";

import { useState } from "react";
import { recordGroupAttendance } from "./actions";

type RecordAttendanceModalProps = {
  groupId: string;
  groupName: string;
  tenantSlug: string;
  activeTab: string;
  members: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
};

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export function RecordAttendanceModal({
  groupId,
  groupName,
  tenantSlug,
  activeTab,
  members
}: RecordAttendanceModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="section-action-button" type="button" onClick={() => setIsOpen(true)}>
        Record Attendance
      </button>

      {isOpen ? (
        <div className="people-modal-backdrop" onClick={() => setIsOpen(false)} role="presentation">
          <div
            className="people-modal-card attendance-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-attendance-title"
          >
            <div className="panel-header people-panel-header">
              <div>
                <h2 id="record-attendance-title">Record Attendance</h2>
                <p className="panel-copy">Create a simple attendance report for {groupName}.</p>
              </div>
            </div>

            {members.length > 0 ? (
              <form action={recordGroupAttendance} className="people-form">
                <input name="tenant" type="hidden" value={tenantSlug} />
                <input name="group_id" type="hidden" value={groupId} />
                <input name="return_tab" type="hidden" value={activeTab} />

                <label className="field">
                  <span>Report Name</span>
                  <input defaultValue={`${groupName} Attendance`} name="event_name" type="text" required />
                </label>

                <label className="field">
                  <span>Date</span>
                  <input defaultValue={getTodayDateValue()} name="occurred_on" type="date" required />
                </label>

                <div className="attendance-member-list">
                  {members.map((member) => (
                    <div className="attendance-member-row" key={member.id}>
                      <input name="person_ids" type="hidden" value={member.id} />
                      <div>
                        <strong>{formatName(member)}</strong>
                      </div>
                      <select className="people-select attendance-status-select" defaultValue="present" name={`status:${member.id}`}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="people-modal-actions">
                  <button className="primary-button" type="submit">
                    Save Attendance
                  </button>
                  <button className="people-modal-dismiss" onClick={() => setIsOpen(false)} type="button">
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="person-section-empty">
                <p>Add members to this group before recording attendance.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
