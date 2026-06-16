"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isStudentProfilePath, routes } from "@/lib/routes";
import { teacher } from "@/lib/mock-data";
import {
  Bell,
  LogOut,
  PenLine,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Capture", href: routes.feed, icon: PenLine, match: "feed" },
  { label: "Students", href: routes.roster, icon: Users, match: "students" },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppTopNav() {
  const pathname = usePathname();

  function isActive(match: string): boolean {
    if (match === "feed") {
      return pathname === routes.feed;
    }
    if (match === "students") {
      return pathname === routes.roster || isStudentProfilePath(pathname);
    }
    return false;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1560px] flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={routes.feed} className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg text-primary">
              <PenLine className="size-5" strokeWidth={2.25} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
              ClassTrace
            </span>
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href={routes.settings}
              aria-label="Settings"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-4" />
            </Link>
            <SignOutButton redirectUrl={routes.root}>
              <button
                type="button"
                aria-label="Sign out"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
              </button>
            </SignOutButton>
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
              {getInitials(teacher.name)}
            </div>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-wrap items-center justify-center gap-1 overflow-visible"
        >
          {navItems.map((item) => {
            const active = isActive(item.match);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <item.icon
                  className={active ? "size-4 text-primary" : "size-4"}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-3 hidden h-0.5 rounded-full bg-primary lg:block" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4" strokeWidth={1.75} />
          </button>
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
            {getInitials(teacher.name)}
          </div>
          <Link
            href={routes.settings}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <span>{teacher.name}</span>
            <Settings className="size-4 text-muted-foreground" />
          </Link>
          <SignOutButton redirectUrl={routes.root}>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
          </SignOutButton>
        </div>
      </div>
    </header>
  );
}
