import { AppTopNav } from "@/components/dashboard/app-top-nav";
import { AppBottomNav } from "@/components/dashboard/app-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getCurrentAppWorkspace();

  return (
    <ClassTraceClerkProvider>
      <div className="flex min-h-dvh flex-col bg-background pb-16 lg:pb-0">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <AppTopNav />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 outline-none"
        >
          {children}
        </main>
        <SiteFooter />
        <AppBottomNav />
      </div>
    </ClassTraceClerkProvider>
  );
}
