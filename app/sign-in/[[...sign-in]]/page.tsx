import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import {
  clerkAfterSignInUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";

export const metadata: Metadata = {
  title: "Sign in — ClassTrace",
  description: "Sign in to your private ClassTrace teacher workspace.",
};

export default function SignInPage() {
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
