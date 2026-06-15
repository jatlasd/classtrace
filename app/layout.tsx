import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Caveat, Fraunces, Inter } from "next/font/google";
import {
  clerkAfterSignInUrl,
  clerkAfterSignUpUrl,
  clerkSignInUrl,
  clerkSignUpUrl,
} from "@/lib/auth-routes";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClassTrace",
  description:
    "Quick capture for classroom evidence. Capture the messy moment now. Organize the evidence later.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="paper-grain min-h-full flex flex-col font-sans">
        <ClerkProvider
          signInUrl={clerkSignInUrl}
          signUpUrl={clerkSignUpUrl}
          signInFallbackRedirectUrl={clerkAfterSignInUrl}
          signUpFallbackRedirectUrl={clerkAfterSignUpUrl}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
