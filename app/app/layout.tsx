import { AppTopNav } from "@/components/dashboard/app-top-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <AppTopNav />
      <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        {children}
      </main>
    </div>
  );
}
