"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { pulseBrand } from "@pulse/design-system";

type NavIcon =
  | "dashboard"
  | "people"
  | "groups"
  | "communications"
  | "outreach"
  | "giving"
  | "reports"
  | "forms"
  | "automations"
  | "tasks"
  | "missions"
  | "sites"
  | "apps"
  | "bell"
  | "shield"
  | "settings";

type NavItem = {
  label: string;
  icon: Exclude<NavIcon, "bell" | "shield" | "settings">;
  href?: string;
  collapsible?: boolean;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "People", icon: "people", href: "/dashboard/people" },
  { label: "Groups", icon: "groups", href: "/dashboard/groups" },
  { label: "Communications", icon: "communications", href: "/dashboard/communications" },
  { label: "Outreach", icon: "outreach", href: "/dashboard/outreach", collapsible: true },
  { label: "Giving", icon: "giving", href: "/dashboard/giving", collapsible: true },
  { label: "Reports", icon: "reports", href: "/dashboard/reports" },
  { label: "Forms", icon: "forms", href: "/dashboard/forms" },
  { label: "Automations", icon: "automations", href: "/dashboard/automations" },
  { label: "Tasks", icon: "tasks", disabled: true },
  { label: "Missions", icon: "missions", disabled: true },
  { label: "Sites", icon: "sites", disabled: true },
  { label: "Apps", icon: "apps", disabled: true }
];

function AppIcon({ name }: { name: NavIcon }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "people":
      return (
        <svg {...sharedProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 8v6" />
          <path d="M17 11h6" />
        </svg>
      );
    case "groups":
      return (
        <svg {...sharedProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <circle cx="17.5" cy="8.5" r="2.5" />
          <path d="M15 20a5 5 0 0 1 6.5-4.7" />
        </svg>
      );
    case "communications":
      return (
        <svg {...sharedProps}>
          <path d="M4 5h16v11H7l-3 3V5Z" />
        </svg>
      );
    case "outreach":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "giving":
      return (
        <svg {...sharedProps}>
          <path d="M12 3v18" />
          <path d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5-2 3.5-4.5 3.5-4.5-1.6-4.5-3.5" />
        </svg>
      );
    case "reports":
      return (
        <svg {...sharedProps}>
          <path d="M4 19h16" />
          <path d="M7 15V9" />
          <path d="M12 15V5" />
          <path d="M17 15v-3" />
        </svg>
      );
    case "forms":
      return (
        <svg {...sharedProps}>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M9 10h6" />
          <path d="M9 14h6" />
          <path d="M9 18h4" />
        </svg>
      );
    case "automations":
      return (
        <svg {...sharedProps}>
          <rect x="7" y="7" width="10" height="10" rx="2.5" />
          <path d="M12 3v4" />
          <path d="M8 3 9.5 6" />
          <path d="M16 3 14.5 6" />
          <circle cx="10" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="11" r="1" fill="currentColor" stroke="none" />
          <path d="M10 14c.7.7 1.3 1 2 1s1.3-.3 2-1" />
          <path d="M7 12H4" />
          <path d="M20 12h-3" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...sharedProps}>
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      );
    case "missions":
      return (
        <svg {...sharedProps}>
          <path d="M12 21c4.97 0 9-4.03 9-9" />
          <path d="M12 3C7.03 3 3 7.03 3 12" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
    case "sites":
      return (
        <svg {...sharedProps}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );
    case "apps":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...sharedProps}>
          <path d="M15 17H5.5a1 1 0 0 1-.8-1.6L6 13.5V10a6 6 0 1 1 12 0v3.5l1.3 1.9a1 1 0 0 1-.8 1.6H15" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "shield":
      return (
        <svg {...sharedProps}>
          <path d="M12 3 6 5v6c0 4.1 2.6 7.7 6 9 3.4-1.3 6-4.9 6-9V5l-6-2Z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
        </svg>
      );
  }
}

export function DashboardShell({
  children,
  displayName,
  tenantName,
  tenantSlug
}: {
  children: React.ReactNode;
  displayName: string;
  tenantName: string;
  tenantSlug: string;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const headingTitle =
    pathname.startsWith("/dashboard/people")
      ? "People"
      : pathname.startsWith("/dashboard/groups")
        ? "Groups"
        : pathname.startsWith("/dashboard/communications")
          ? "Communications"
        : pathname.startsWith("/dashboard/forms")
          ? "Forms"
        : pathname.startsWith("/dashboard/automations")
          ? "Automations"
        : pathname.startsWith("/dashboard/settings")
          ? "Settings"
        : "Dashboard";

  return (
    <div className="dashboard-app">
      <header className="dashboard-topbar">
        <details className="topbar-brand-menu">
          <summary className="topbar-brand" aria-label="Pulse product menu">
            <Image src="/brand/logo-primary.svg" alt={pulseBrand.productName} width={168} height={28} priority />
            <span className="topbar-brand-caret" aria-hidden="true">
              ▾
            </span>
          </summary>

          <div className="topbar-brand-panel">
            <span className="topbar-menu-label">Pulse Suite</span>
            <span className="topbar-brand-item is-active">
              <span className="topbar-brand-item-icon">
                <Image src="/brand/logo-primary.svg" alt="" width={104} height={18} aria-hidden="true" />
              </span>
              <span className="topbar-brand-item-copy">
                <strong>Pulse RMS</strong>
                <small>Current workspace</small>
              </span>
            </span>
            <span className="topbar-brand-item is-disabled">
              <span className="topbar-brand-item-icon">
                <Image src="/brand/tasks-logo.svg" alt="" width={104} height={18} aria-hidden="true" />
              </span>
              <span className="topbar-brand-item-copy">
                <strong>Tasks</strong>
                <small>Coming soon</small>
              </span>
            </span>
            <span className="topbar-brand-item is-disabled">
              <span className="topbar-brand-item-icon">
                <Image src="/brand/missions-logo.svg" alt="" width={104} height={18} aria-hidden="true" />
              </span>
              <span className="topbar-brand-item-copy">
                <strong>Missions</strong>
                <small>Coming soon</small>
              </span>
            </span>
          </div>
        </details>

        <div className="topbar-actions">
          <button className="icon-button" type="button" aria-label="Notifications">
            <AppIcon name="bell" />
            <span className="notification-dot">1</span>
          </button>
          <button className="icon-button" type="button" aria-label="Security">
            <AppIcon name="shield" />
          </button>
          <Link className="icon-button" href="/dashboard/settings" aria-label="Settings">
            <AppIcon name="settings" />
          </Link>
          <details className="topbar-menu">
            <summary className="topbar-user" aria-label="Workspace menu">
              <div>
                <span className="topbar-user-label">{pulseBrand.productName}</span>
                <strong>{displayName}</strong>
              </div>
              <span className="topbar-user-caret" aria-hidden="true">
                ▾
              </span>
            </summary>

            <div className="topbar-menu-panel">
              <span className="topbar-menu-label">{tenantSlug}</span>
              <Link className="topbar-menu-item" href={`/dashboard?tenant=${encodeURIComponent(tenantSlug)}`}>
                {tenantSlug}
              </Link>
              <form action="/auth/signout" method="post">
                <button className="topbar-menu-item topbar-menu-button" type="submit">
                  Sign Out
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      <div className={isSidebarCollapsed ? "dashboard-shell is-collapsed" : "dashboard-shell"}>
        <aside className="dashboard-sidebar">
          <button
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sidebar-collapse"
            onClick={() => setIsSidebarCollapsed((value) => !value)}
            type="button"
          >
            <span aria-hidden="true">{isSidebarCollapsed ? "›" : "‹"}</span>
          </button>

          <nav className="sidebar-nav" aria-label="Primary">
            {navItems.map((item) => {
              if (item.disabled) {
                return (
                  <span className="sidebar-link is-disabled" key={item.label}>
                    <span className="sidebar-icon">
                      <AppIcon name={item.icon} />
                    </span>
                    <span className="sidebar-label">{item.label}</span>
                  </span>
                );
              }

              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link className={isActive ? "sidebar-link is-active" : "sidebar-link"} href={item.href!} key={item.label}>
                  <span className="sidebar-icon">
                    <AppIcon name={item.icon} />
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                  {item.collapsible ? <span className="sidebar-caret">⌄</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="dashboard-main">
          <section className="dashboard-heading">
            <div>
              <h1>{headingTitle}</h1>
              <p>{tenantName}</p>
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
