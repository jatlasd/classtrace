import type { LucideIcon } from "lucide-react";
import { PenLine, Settings, Users } from "lucide-react";
import { isStudentProfilePath, routes } from "@/lib/routes";

export type AppNavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  match: "capture" | "settings" | "students";
};

export const APP_NAVIGATION_ITEMS: readonly AppNavigationItem[] = [
  {
    label: "Capture",
    href: routes.feed,
    icon: PenLine,
    match: "capture",
  },
  {
    label: "Students",
    href: routes.roster,
    icon: Users,
    match: "students",
  },
  {
    label: "Settings",
    href: routes.settings,
    icon: Settings,
    match: "settings",
  },
];

export function isAppNavigationItemActive(
  pathname: string,
  match: AppNavigationItem["match"]
): boolean {
  if (match === "capture") return pathname === routes.feed;
  if (match === "settings") return pathname === routes.settings;

  return pathname === routes.roster || isStudentProfilePath(pathname);
}

export function getAppRouteLabel(pathname: string): string {
  if (pathname === routes.feed) return "Feed";
  if (pathname === routes.roster) return "Students";
  if (pathname === routes.settings) return "Settings";
  if (isStudentProfilePath(pathname)) {
    return pathname.endsWith("/report") ? "Student report" : "Student timeline";
  }

  return "Workspace";
}
