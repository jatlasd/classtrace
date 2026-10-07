import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const grotesk = Bricolage_Grotesque({
  variable: "--font-grotesk",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const description =
  "Write one sentence about one student. Review it when you have a minute. Ask your evidence questions later.";

export const metadata: Metadata = {
  title: "ClassTrace",
  description,
  openGraph: {
    type: "website",
    siteName: "ClassTrace",
    title: "ClassTrace",
    description,
    images: [{ url: "/demo/overview-title.jpg", width: 1920, height: 1080 }],
  },
  twitter: { card: "summary_large_image" },
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
