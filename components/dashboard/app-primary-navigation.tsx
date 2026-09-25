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
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
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
                className={`flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base ${
                  active
                    ? "bg-well text-fg"
                    : "text-fg-2 hover:bg-well/60 hover:text-fg"
                }`}
              >
                {item.label}
                {item.match === "capture" && draftCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-live-bright px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-live-fg"
                  >
                    {draftCount > 99 ? "99+" : draftCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
