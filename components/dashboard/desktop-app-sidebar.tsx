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
    <aside className="app-shell-sidebar fixed inset-y-0 left-0 z-50 hidden w-52 flex-col bg-background text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link
          href={routes.feed}
          aria-label="ClassTrace capture"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandLockup size="md" />
        </Link>
      </div>

      <nav aria-label="Primary" className="flex-1 px-3 py-5">
        <div className="space-y-1">
          {APP_NAVIGATION_ITEMS.map((item) => {
            const active = isAppNavigationItemActive(pathname, item.match);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-md border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "border-transparent text-foreground underline decoration-2 underline-offset-8"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <item.icon
                  aria-hidden="true"
                  className={`size-[18px] shrink-0 ${active ? "text-foreground" : ""}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3">
        <button
          type="button"
          disabled={isSigningOut}
          onClick={onSignOut}
          className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  );
}
