import { AppTopNav } from "@/components/dashboard/app-top-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <AppTopNav />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
