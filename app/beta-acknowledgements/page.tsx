import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { BetaAcknowledgementFlow } from "@/components/beta-agreement/beta-acknowledgement-flow";
import { SiteFooter } from "@/components/layout/site-footer";
import { getProvisionedCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { hasAcceptedCurrentBetaAgreement } from "@/lib/beta-agreement/beta-agreement";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Before you enter — ClassTrace",
  description:
    "Required acknowledgements for entering the ClassTrace limited beta.",
};

export default async function BetaAcknowledgementsPage() {
  const workspace = await getProvisionedCurrentWorkspace();
  const hasAccepted = await hasAcceptedCurrentBetaAgreement(
    workspace.teacherProfileId
  );

  if (hasAccepted) {
    redirect(routes.app);
  }

  return (
    <ClassTraceClerkProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 items-center px-4 py-8 outline-none sm:px-6 sm:py-12"
        >
          <div className="mx-auto w-full max-w-2xl">
            <BetaAcknowledgementFlow />
          </div>
        </main>
        <SiteFooter />
      </div>
    </ClassTraceClerkProvider>
  );
}
