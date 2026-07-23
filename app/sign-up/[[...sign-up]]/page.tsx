import type { Metadata } from "next";
import type { ReactElement } from "react";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Invitation sign-up — ClassTrace",
  description:
    "Complete sign-up for the invitation-only ClassTrace teacher beta.",
};

export default async function SignUpPage(): Promise<ReactElement> {
  const { userId } = await auth();

  if (userId) {
    redirect(routes.app);
  }

  return (
    <ClassTraceClerkProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <header className="mb-6 text-center">
              <p className="text-sm font-semibold text-primary">
                Invitation-only beta
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Complete your ClassTrace sign-up
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Use the invitation sent to your email to create your teacher
                workspace. Already have an account? Sign in instead.
              </p>
            </header>
            <div className="flex justify-center">
              <SignUp
                path={clerkSignUpUrl}
                routing="path"
                signInUrl={clerkSignInUrl}
                fallbackRedirectUrl={clerkAfterSignUpUrl}
              />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </ClassTraceClerkProvider>
  );
}
