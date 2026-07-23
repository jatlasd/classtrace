import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import {
  clerkAfterSignInUrl,
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";

export function ClassTraceClerkProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      signInFallbackRedirectUrl={clerkAfterSignInUrl}
      signUpFallbackRedirectUrl={clerkAfterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  );
}
