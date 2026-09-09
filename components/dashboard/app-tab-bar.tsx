import Link from "next/link";
import {
  APP_NAVIGATION_ITEMS,
  isAppNavigationItemActive,
} from "@/components/dashboard/app-navigation";

type AppTabBarProps = {
  pathname: string;
};

export function AppTabBar({ pathname }: AppTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="app-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-line bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:inset-auto lg:z-auto lg:border-0 lg:bg-transparent lg:pb-0 lg:backdrop-blur-none"
    >
      <ul className="grid grid-cols-4 lg:flex lg:items-baseline lg:gap-7">
        {APP_NAVIGATION_ITEMS.map((item) => {
          const active = isAppNavigationItemActive(pathname, item.match);
          const primary = item.match === "capture";

          return (
            <li key={item.label} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-2 text-[0.6875rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-inset lg:min-h-0 lg:flex-row lg:gap-0 lg:rounded-sm lg:px-0 lg:py-1 lg:font-display lg:text-[1.35rem] lg:font-semibold lg:focus-visible:ring-inset-0 lg:focus-visible:ring-offset-4 lg:focus-visible:ring-offset-base ${
                  active
                    ? primary
                      ? "text-live lg:text-fg"
                      : "text-fg"
                    : "text-fg-3 hover:text-fg"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition-colors lg:hidden ${
                    primary
                      ? active
                        ? "bg-live-bright text-live-fg"
                        : "bg-live-bright/80 text-live-fg"
                      : active
                        ? "bg-plate text-fg"
                        : ""
                  }`}
                >
                  <item.icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </span>
                <span className="truncate">{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 hidden size-1.5 rounded-full bg-live-bright lg:inline-block"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
