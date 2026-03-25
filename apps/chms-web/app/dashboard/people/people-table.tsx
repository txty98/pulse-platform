"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type PersonRecord = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

function formatPersonName(person: {
  first_name: string;
  last_name: string;
  preferred_name: string | null;
}) {
  if (person.preferred_name) {
    return `${person.preferred_name} ${person.last_name}`;
  }

  return `${person.first_name} ${person.last_name}`;
}

export function PeopleTable({ people }: { people: PersonRecord[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allIds = useMemo(() => people.map((person) => person.id), [people]);
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => allIds.includes(id)));
  }, [allIds]);

  function toggleAll() {
    setSelectedIds((current) => (current.length === allIds.length ? [] : allIds));
  }

  function toggleOne(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function openPerson(personId: string) {
    router.push(`/dashboard/people/${personId}`);
  }

  return (
    <div className="people-table-wrap">
      <table className="people-table">
        <thead>
          <tr>
            <th className="people-select-col">
              <input
                aria-label="Select all people"
                checked={allSelected}
                onChange={toggleAll}
                ref={selectAllRef}
                type="checkbox"
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const isSelected = selectedIds.includes(person.id);

            return (
              <tr
                className={isSelected ? "is-selected person-row-clickable" : "person-row-clickable"}
                key={person.id}
                onClick={() => openPerson(person.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPerson(person.id);
                  }
                }}
                tabIndex={0}
              >
                <td className="people-select-col">
                  <input
                    aria-label={`Select ${formatPersonName(person)}`}
                    checked={isSelected}
                    onChange={() => toggleOne(person.id)}
                    onClick={(event) => event.stopPropagation()}
                    type="checkbox"
                  />
                </td>
                <td>
                  <div className="person-cell">
                    <span className="person-avatar">
                      {person.first_name.charAt(0)}
                      {person.last_name.charAt(0)}
                    </span>
                    <div className="person-main">
                      <strong>{formatPersonName(person)}</strong>
                      <span>
                        Added{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric"
                        }).format(new Date(person.created_at))}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{person.email ?? "No email on file"}</td>
                <td>{person.phone ?? "No phone"}</td>
                <td>
                  <span className={person.is_active ? "person-status is-active" : "person-status"}>
                    {person.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
