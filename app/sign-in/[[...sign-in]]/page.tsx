import type { Metadata } from "next";
import type { ReactElement } from "react";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  clerkAfterSignInUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <SignIn
        path={clerkSignInUrl}
        routing="path"
        signUpUrl={clerkSignUpUrl}
        fallbackRedirectUrl={clerkAfterSignInUrl}
      />
    </main>
  );
}
