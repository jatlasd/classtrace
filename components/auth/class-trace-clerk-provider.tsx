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
      appearance={{
        variables: {
          colorPrimary: "#2b2140",
          colorBackground: "#ffffff",
          colorForeground: "#2b2140",
          colorMutedForeground: "#66597d",
          colorInput: "#f6f2fb",
          colorInputForeground: "#2b2140",
          colorBorder: "rgb(43 33 64 / 0.24)",
          colorRing: "#ffb020",
          colorDanger: "#b4123f",
          colorSuccess: "#1f6b4a",
          colorWarning: "#b85c00",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-grotesk), ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          cardBox: "border border-[rgb(43_33_64_/_0.1)] rounded-2xl shadow-[0_18px_40px_rgb(43_33_64_/_0.1)]",
          headerTitle: "font-display text-2xl font-semibold tracking-[-0.02em]",
          formButtonPrimary: "rounded-full",
        },
      }}
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      signInFallbackRedirectUrl={clerkAfterSignInUrl}
      signUpFallbackRedirectUrl={clerkAfterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  );
}
