"use client";

import { LogoutButton } from "@/components/actions/LogoutButton";
import { FOCUS_RING } from "@/lib/styles";
import { countNewSuggestions } from "@/services/suggestionService";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  key: string;
  label: string;
  href?: string;
  matchPrefix?: string;
  badge?: number;
};

type SidebarManager = {
  name: string;
  initials: string;
  role: string;
};

type Props = {
  manager: SidebarManager;
  weekStat: {
    week: string;
    ratingsThisWeek: number;
  };
};

function isActive(item: NavItem, pathname: string) {
  if (!item.matchPrefix) return false;
  return (
    pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`)
  );
}

export function AdminSidebar({ manager, weekStat }: Props) {
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);
  const suggestionsBadge: Pick<NavItem, "badge"> = newSuggestionsCount
    ? {
        badge: newSuggestionsCount,
      }
    : {};

  useEffect(() => {
    countNewSuggestions().then(count => setNewSuggestionsCount(count));
  }, []);

  const navItems: NavItem[] = [
    { key: "home", label: "Overview", href: "/admin", matchPrefix: "/admin" },
    {
      key: "suggestions",
      label: "Suggestions",
      href: "/admin/suggestions",
      matchPrefix: "/admin/suggestions",
      ...suggestionsBadge,
    },
    {
      key: "new-tea",
      label: "New tea",
      href: "/admin/tea/new",
      matchPrefix: "/admin/tea/new",
    },
  ];

  const pathname = usePathname() ?? "";
  const activeItem = navItems
    .filter(it => isActive(it, pathname))
    .sort(
      (a, b) => (b.matchPrefix?.length ?? 0) - (a.matchPrefix?.length ?? 0)
    )[0];
  const activeKey = activeItem?.key;

  return (
    <aside className="bg-paper border-ink/[0.06] sticky flex h-full w-50 shrink-0 flex-col border-r px-3 py-5 font-sans">
      <nav className="flex flex-col gap-0.5">
        {navItems.map(it => {
          const active = activeKey === it.key;
          const stateClass = active
            ? "bg-tea text-paper font-medium"
            : it.href
              ? "text-ink hover:bg-ink/[0.04] transition-colors"
              : "text-ink";
          const inner = (
            <span
              className={`text-body flex items-center justify-between rounded-[9px] ${stateClass}`}
              style={{
                padding: "9px 12px",
                opacity: it.href ? 1 : 0.4,
                cursor: it.href ? "pointer" : "default",
              }}
            >
              <span className="flex items-center gap-2">
                <span>{it.label}</span>
                {it.badge !== undefined && (
                  <span
                    className={
                      "text-tiny rounded-full px-2 py-1 leading-none font-semibold " +
                      (active ? "bg-paper/20 text-paper" : "bg-tea text-paper")
                    }
                  >
                    {it.badge}
                  </span>
                )}
              </span>
            </span>
          );
          return it.href ? (
            <Link
              key={it.key}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-[9px] ${FOCUS_RING.paper}`}
            >
              {inner}
            </Link>
          ) : (
            <span key={it.key} aria-disabled title="Coming soon">
              {inner}
            </span>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div
        className="text-ink-muted text-meta"
        style={{
          background: "rgba(45,74,62,0.06)",
          borderRadius: 10,
          padding: 12,
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        <div className="text-tea font-semibold" style={{ marginBottom: 4 }}>
          {weekStat.week}
        </div>
        {weekStat.ratingsThisWeek} ratings this week
      </div>

      <div
        className="border-ink/[0.06] flex items-center border-t"
        style={{ padding: "10px 12px", borderRadius: 10, gap: 10 }}
      >
        <div
          className="bg-tea text-paper text-meta flex items-center justify-center font-semibold"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            letterSpacing: 0,
          }}
        >
          {manager.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-ink text-meta truncate font-medium">
            {manager.name}
          </div>
          <div className="text-ink-soft text-tiny">{manager.role}</div>
        </div>
        <LogoutButton
          title="Log out"
          aria-label="Log out"
          className={`text-rose hover:bg-rose/10 flex items-center justify-center rounded-md transition-colors ${FOCUS_RING.paper}`}
          style={{ width: 26, height: 26 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </LogoutButton>
      </div>
    </aside>
  );
}
