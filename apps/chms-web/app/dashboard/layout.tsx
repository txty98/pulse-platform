import type { ReactNode } from "react";
import { DashboardShell } from "./_components/dashboard-shell";
import { getRequiredDashboardContext } from "../../lib/dashboard-context";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const context = await getRequiredDashboardContext();

  if (!context.access) {
    return children;
  }

  if (!context.access.activeMembership) {
    return children;
  }

  return (
    <DashboardShell
      displayName={context.access.profile?.fullName ?? context.access.user?.email ?? "Pulse Admin"}
      tenantName={context.access.activeMembership.tenant.name}
      tenantSlug={context.access.activeMembership.tenant.slug}
    >
      {children}
    </DashboardShell>
  );
}
