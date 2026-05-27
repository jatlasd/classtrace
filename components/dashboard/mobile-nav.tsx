"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Hash, LayoutList, Users } from "lucide-react";

const items = [
  { icon: LayoutList, label: "Feed", href: "/" },
  { icon: Users, label: "Roster", href: "/students" },
  { icon: Hash, label: "Tags", href: "#" },
  { icon: BarChart3, label: "Reports", href: "#" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-2 lg:hidden">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

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
