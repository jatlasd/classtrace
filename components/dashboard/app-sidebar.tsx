"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isStudentProfilePath, routes } from "@/lib/routes";
import { teacher } from "@/lib/mock-data";
import {
  LayoutList,
  PenLine,
  Search,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Evidence Feed", href: routes.feed, icon: LayoutList, match: "feed" },
  { label: "Roster", href: routes.roster, icon: Users, match: "roster" },
  { label: "Students", href: routes.roster, icon: Users, match: "students" },
  { label: "Settings", href: routes.settings, icon: Settings, match: "settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(match: string): boolean {
    if (match === "feed") {
      return pathname === routes.feed;
    }
    if (match === "roster") {
      return pathname === routes.roster;
    }
    if (match === "students") {
      return isStudentProfilePath(pathname);
    }
    if (match === "settings") {
      return pathname === routes.settings;
    }
    return false;
  }

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex xl:w-[220px]">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border xl:justify-start xl:px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <PenLine className="size-4.5" strokeWidth={2.5} />
        </div>
        <span className="font-display ml-3 hidden text-[15px] font-semibold tracking-tight text-sidebar-foreground xl:block">
          ClassTrace
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {navItems.map((item) => {
          const active = isActive(item.match);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon
                className={`size-[18px] shrink-0 ${active ? "text-sidebar-primary" : ""}`}
                strokeWidth={2}
              />
              <span className="hidden xl:block">{item.label}</span>
              {active && (
                <span className="ml-auto hidden size-1.5 rounded-full bg-sidebar-primary xl:block" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-2 py-4">
        <div className="mb-2 flex flex-col gap-1">
          <button
            type="button"
            className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground xl:justify-start"
          >
            <Search className="size-[18px]" strokeWidth={2} />
            <span className="hidden text-sm xl:block">Search</span>
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-lg px-2 py-2 xl:justify-start xl:px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            {teacher.initials}
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {teacher.name}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {teacher.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
