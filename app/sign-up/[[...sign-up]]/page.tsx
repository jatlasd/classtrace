import type { Metadata } from "next";
import type { ReactElement } from "react";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Invitation sign-up | ClassTrace",
  description:
    "Complete sign-up for the invitation-only ClassTrace teacher beta.",
};

type SignUpPageProps = {
  params: Promise<{ "sign-up"?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({
  params,
  searchParams,
}: SignUpPageProps): Promise<ReactElement> {
  const { userId } = await auth();

  if (userId) {
    redirect(routes.app);
  }

  const [{ "sign-up": step }, query] = await Promise.all([params, searchParams]);
  // Clerk invitation links carry a ticket; later sign-up steps use sub-paths.
  const hasInvitation =
    typeof query.__clerk_ticket === "string" || Boolean(step?.length);

  const page = (
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
              {hasInvitation
                ? "Complete your ClassTrace sign-up"
                : "ClassTrace is invitation-only right now"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-2">
              {hasInvitation
                ? "Use the invitation sent to your email to create your teacher workspace. Already have an account? Sign in instead."
                : "Accounts open from the link in an invitation email. If you were invited, open that email and use its link to create your workspace."}
            </p>
          </header>
          {hasInvitation ? (
            <div className="flex justify-center">
              <SignUp
                path={clerkSignUpUrl}
                routing="path"
                signInUrl={clerkSignInUrl}
                fallbackRedirectUrl={clerkAfterSignUpUrl}
              />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href={routes.demo}>Watch the 80-second overview</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.signIn} prefetch={false}>
                  Sign in
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );

  return hasInvitation ? (
    <ClassTraceClerkProvider>{page}</ClassTraceClerkProvider>
  ) : (
    page
  );
}
