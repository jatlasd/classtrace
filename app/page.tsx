import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <EvidenceFeed />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
