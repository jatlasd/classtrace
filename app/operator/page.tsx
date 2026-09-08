import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { OperatorConsole } from "@/components/operator/operator-console";
import { SiteFooter } from "@/components/layout/site-footer";
import { requireOperator } from "@/lib/operator/operator-auth";
import { routes } from "@/lib/routes";

export default async function OperatorPage() {
  try {
    await requireOperator();
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-well text-fg">
      <header className="border-b border-line bg-plate">
        <div className="mx-auto flex min-h-16 max-w-[1040px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-fg text-on-ink">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">ClassTrace operator</p>
              <p className="text-xs text-fg-2">Owner-only account administration</p>
            </div>
          </div>
          <Link
            href={routes.app}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-sm px-3 text-sm font-semibold text-fg-2 transition-colors hover:bg-well hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-well"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Return to app</span>
            <span className="sm:hidden">App</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
            Account administration
          </h1>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-fg-2">
            Find one account by its complete email, review safe metadata, and run separately confirmed deletion actions. Student and evidence content is never shown here.
          </p>
        </header>

        <div className="border border-line bg-plate p-5 sm:p-7">
          <OperatorConsole />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
