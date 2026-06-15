import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import {
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";

export const metadata: Metadata = {
  title: "Sign up — ClassTrace",
  description: "Create your private ClassTrace teacher workspace.",
};

export default function SignUpPage() {
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
