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
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sign up — ClassTrace",
  description: "Create your private ClassTrace teacher workspace.",
};

export default async function SignUpPage(): Promise<ReactElement> {
  const { userId } = await auth();

  if (userId) {
    redirect(routes.app);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <SignUp
        path={clerkSignUpUrl}
        routing="path"
        signInUrl={clerkSignInUrl}
        fallbackRedirectUrl={clerkAfterSignUpUrl}
      />
    </main>
  );
}
