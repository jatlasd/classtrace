import Link from "next/link";
import {
  APP_NAVIGATION_ITEMS,
  isAppNavigationItemActive,
} from "@/components/dashboard/app-navigation";

type AppPrimaryNavigationProps = {
  draftCount?: number;
  pathname: string;
};

export function AppPrimaryNavigation({
  draftCount = 0,
  pathname,
}: AppPrimaryNavigationProps) {
  return (
    <nav aria-label="Primary" className="hidden lg:block lg:justify-self-center">
      <ul className="flex items-baseline gap-6 xl:gap-7">
        {APP_NAVIGATION_ITEMS.map((item) => {
          const active = isAppNavigationItemActive(pathname, item.match);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-label={
                  item.match === "capture" && draftCount > 0
                    ? `Capture, ${draftCount} ${draftCount === 1 ? "draft" : "drafts"} to review`
                    : undefined
                }
                aria-current={active ? "page" : undefined}
                className={`flex items-center whitespace-nowrap rounded-sm py-1 font-display text-[1.35rem] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-base ${
                  active ? "text-fg" : "text-fg-3 hover:text-fg"
                }`}
              >
                {item.label}
                {item.match === "capture" && draftCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-live-soft px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none text-live"
                  >
                    {draftCount > 99 ? "99+" : draftCount}
                  </span>
                ) : null}
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
