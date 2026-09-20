import Link from "next/link";
import {
  APP_NAVIGATION_ITEMS,
  isAppNavigationItemActive,
} from "@/components/dashboard/app-navigation";

type AppPrimaryNavigationProps = {
  pathname: string;
};

export function AppPrimaryNavigation({ pathname }: AppPrimaryNavigationProps) {
  return (
    <nav aria-label="Primary" className="hidden lg:block lg:justify-self-center">
      <ul className="flex items-baseline gap-6 xl:gap-7">
        {APP_NAVIGATION_ITEMS.map((item) => {
          const active = isAppNavigationItemActive(pathname, item.match);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center whitespace-nowrap rounded-sm py-1 font-display text-[1.35rem] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-base ${
                  active ? "text-fg" : "text-fg-3 hover:text-fg"
                }`}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 size-1.5 rounded-full bg-live-bright"
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
