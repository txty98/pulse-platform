"use client";

import { useRouter } from "next/navigation";

type GroupRecord = {
  id: string;
  name: string;
  group_type: string;
  status: string;
  memberCount: number;
  leaderName: string | null;
};

export function GroupsTable({ groups }: { groups: GroupRecord[] }) {
  const router = useRouter();

  return (
    <div className="people-table-wrap">
      <table className="people-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Leader</th>
            <th>Members</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr
              className="people-table-row-link"
              key={group.id}
              onClick={() => router.push(`/dashboard/groups/${group.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/dashboard/groups/${group.id}`);
                }
              }}
            >
              <td>
                <strong>{group.name}</strong>
              </td>
              <td>{group.group_type}</td>
              <td>{group.leaderName ?? "Unassigned"}</td>
              <td>{group.memberCount}</td>
              <td>
                <span className={group.status === "active" ? "person-status is-active" : "person-status"}>
                  {group.status === "active" ? "Active" : "Archived"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
