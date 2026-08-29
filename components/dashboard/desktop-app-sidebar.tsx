import { LogOut } from "lucide-react";
import Link from "next/link";
import {
  APP_NAVIGATION_ITEMS,
  isAppNavigationItemActive,
} from "@/components/dashboard/app-navigation";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { routes } from "@/lib/routes";

type DesktopAppSidebarProps = {
  isSigningOut: boolean;
  onSignOut: () => void;
  pathname: string;
};

export function DesktopAppSidebar({
  isSigningOut,
  onSignOut,
  pathname,
}: DesktopAppSidebarProps) {
  return (
    <aside className="app-shell-sidebar fixed inset-y-0 left-0 z-50 hidden w-[232px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link
          href={routes.feed}
          aria-label="ClassTrace capture"
          className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
        >
          <BrandLockup size="md" tone="inverse" />
        </Link>
      </div>

      <nav aria-label="Primary" className="flex-1 px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
          Workspace
        </p>
        <div className="space-y-1">
          {APP_NAVIGATION_ITEMS.map((item) => {
            const active = isAppNavigationItemActive(pathname, item.match);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-md border-l-2 px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 ${
                  active
                    ? "border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-foreground/78 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon
                  aria-hidden="true"
                  className="size-[18px] shrink-0"
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">
          Teacher account
        </p>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={onSignOut}
          className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-sidebar-foreground/78 outline-none transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  );
}
