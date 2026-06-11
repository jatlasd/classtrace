import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
