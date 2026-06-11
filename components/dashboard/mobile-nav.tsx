"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Settings, Users } from "lucide-react";
import { isStudentProfilePath, routes } from "@/lib/routes";

const items = [
  { icon: LayoutList, label: "Evidence Feed", href: routes.feed, match: "feed" },
  { icon: Users, label: "Roster", href: routes.roster, match: "roster" },
  { icon: Users, label: "Students", href: routes.roster, match: "students" },
  { icon: Settings, label: "Settings", href: routes.settings, match: "settings" },
];

export function MobileNav() {
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
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = isActive(item.match);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
