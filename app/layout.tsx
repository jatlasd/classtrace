import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const grotesk = Bricolage_Grotesque({
  variable: "--font-grotesk",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "ClassTrace",
  description:
    "Write one sentence about one student. Review it when you have a minute. Ask your evidence questions later.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-base font-sans text-fg">
        {children}
      </body>
    </html>
  );
}
