import { routes } from "@/lib/routes";

export const clerkSignInUrl = routes.signIn;
export const clerkSignUpUrl = routes.signUp;
export const clerkAfterSignInUrl = routes.app;
export const clerkAfterSignUpUrl = routes.app;
export const protectedAppRoutePatterns = [routes.app, `${routes.app}/(.*)`] as const;

export function isProtectedAppPath(pathname: string): boolean {
  return pathname === routes.app || pathname.startsWith(`${routes.app}/`);
}
