"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Settings, Users } from "lucide-react";
import { isStudentProfilePath, routes } from "@/lib/routes";

const tabItems = [
  { label: "Capture", href: routes.feed, icon: PenLine, match: "feed" },
  { label: "Students", href: routes.roster, icon: Users, match: "students" },
  { label: "Account", href: routes.settings, icon: Settings, match: "settings" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  function isActive(match: string): boolean {
    if (match === "feed") {
      return pathname === routes.feed;
    }
    if (match === "students") {
      return pathname === routes.roster || isStudentProfilePath(pathname);
    }
    if (match === "settings") {
      return pathname === routes.settings;
    }
    return false;
  }

  return (
    <nav
      aria-label="Primary"
      className="app-bottom-nav fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {tabItems.map((item) => {
        const active = isActive(item.match);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <item.icon
              aria-hidden="true"
              className={active ? "size-5 text-primary" : "size-5"}
              strokeWidth={active ? 2.25 : 1.75}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
