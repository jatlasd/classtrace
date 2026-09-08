import type { Metadata } from "next";
import type { ReactElement } from "react";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  clerkAfterSignInUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sign in — ClassTrace",
  description: "Sign in to your private ClassTrace teacher workspace.",
};

export default async function SignInPage(): Promise<ReactElement> {
  const { userId } = await auth();

  if (userId) {
    redirect(routes.app);
  }

  return (
    <ClassTraceClerkProvider>
      <div className="grain flex min-h-dvh flex-col bg-base">
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <header className="mb-6 flex flex-col items-center text-center">
              <Link
                href={routes.root}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              >
                <BrandLockup size="md" />
              </Link>
              <h1 className="mt-5 font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
                Sign in to your workspace
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-fg-2">
                Your roster and validated evidence stay private to you.
              </p>
            </header>
            <div className="flex justify-center">
              <SignIn
                path={clerkSignInUrl}
                routing="path"
                signUpUrl={clerkSignUpUrl}
                fallbackRedirectUrl={clerkAfterSignInUrl}
              />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </ClassTraceClerkProvider>
  );
}
