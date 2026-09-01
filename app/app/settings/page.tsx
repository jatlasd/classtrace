import { ExternalLink, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { HelpFeedbackForm } from "@/components/settings/help-feedback-form";
import { SettingsSignOutAction } from "@/components/settings/settings-sign-out-action";
import { normalizeErrorReference } from "@/lib/errors/error-reference";
import { routes } from "@/lib/routes";
import { getSettingsPageData } from "@/lib/settings/settings-page-data";

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-0.5 border-t border-border/60 py-2.5">
      <dt className="text-[11px] font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

type SettingsPageProps = {
  searchParams: Promise<{
    errorReference?: string | string[];
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [settings, query] = await Promise.all([
    getSettingsPageData(),
    searchParams,
  ]);
  const initialErrorReference = normalizeErrorReference(query.errorReference);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-4 sm:px-5 sm:py-5">
      <header className="mb-4 border-b border-border pb-4">
        <h1 className="font-sans text-lg font-semibold tracking-tight text-foreground">
          Account and workspace
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Review the account signed in to ClassTrace and the personal teacher
          workspace connected to it.
        </p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section
          aria-labelledby="help-feedback-heading"
          className="rounded-lg border border-border bg-card shadow-surface"
        >
          <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-link">
              <MessageCircleQuestion
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
            <div>
              <h2
                id="help-feedback-heading"
                className="font-sans text-lg font-semibold text-foreground"
              >
                Help and feedback
              </h2>
              <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                Tell us what broke, what felt confusing, or what would make
                ClassTrace more useful.
              </p>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <HelpFeedbackForm
              initialReplyEmail={settings.replyEmail}
              initialErrorReference={initialErrorReference}
            />
          </div>
        </section>

        <aside className="space-y-4" aria-label="Account details and resources">
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="px-4 py-3">
              <h2 className="font-sans text-sm font-semibold text-foreground">
                Account
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Sign-in details are managed by your account provider.
              </p>
              <dl className="mt-3">
                <DetailRow label="Signed in as" value={settings.accountName} />
                <DetailRow label="Email" value={settings.accountEmail} />
              </dl>
            </div>

            <div className="border-t border-border px-4 py-3">
              <h2 className="font-sans text-sm font-semibold text-foreground">
                Workspace
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Your personal roster and validated evidence workspace.
              </p>
              <dl className="mt-3">
                <DetailRow label="Workspace" value={settings.workspaceName} />
                <DetailRow
                  label="Teacher profile"
                  value={settings.teacherDisplayName}
                />
              </dl>
            </div>
          </section>

          <section
            aria-labelledby="privacy-terms-heading"
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="border-b border-border px-4 py-3">
              <h2
                id="privacy-terms-heading"
                className="font-sans text-sm font-semibold text-foreground"
              >
                Privacy and beta terms
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Data handling, support, and account boundaries.
              </p>
            </div>

            <nav aria-label="Privacy and account information">
              <ul>
                {[
                  { label: "Privacy", href: routes.privacy },
                  { label: "Beta terms", href: routes.terms },
                  { label: "Support", href: routes.support },
                  { label: "Account deletion", href: routes.dataDeletion },
                ].map((item) => (
                  <li key={item.href} className="border-b border-border last:border-b-0">
                    <Link
                      href={item.href}
                      className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 hover:text-link"
                    >
                      <span>{item.label}</span>
                      <ExternalLink
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="flex items-center justify-between gap-4 border-y border-border py-3">
            <div>
              <h2 className="font-sans text-sm font-semibold text-foreground">
                Sign out
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Leave this ClassTrace session.
              </p>
            </div>
            <SettingsSignOutAction />
          </section>
        </aside>
      </div>
    </div>
  );
}
