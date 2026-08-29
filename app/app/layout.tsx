import { AppShellNavigation } from "@/components/dashboard/app-shell-navigation";
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
      <div className="authenticated-app flex min-h-dvh flex-col bg-background">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[90] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0 lg:left-[248px]"
        >
          Skip to main content
        </a>
        <AppShellNavigation />
        <div className="app-shell-workspace flex min-h-0 flex-1 flex-col lg:pl-[232px] lg:pt-14">
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 outline-none"
          >
            {children}
          </main>
          <SiteFooter />
        </div>
      </div>
    </ClassTraceClerkProvider>
  );
}
