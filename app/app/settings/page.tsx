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
    <div className="grid gap-1 border-t border-border/60 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">{value}</dd>
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
    <div className="mx-auto w-full max-w-[920px] px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Account and workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Review the account signed in to ClassTrace and the personal teacher
          workspace connected to it.
        </p>
      </header>

      <div className="space-y-5">
        <section className="overflow-hidden rounded-card border border-border bg-card/60">
          <div className="grid lg:grid-cols-2">
            <div className="p-5 sm:p-6 lg:border-r lg:border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Account
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Sign-in details are managed by the account provider you used to
                enter ClassTrace.
              </p>
              <dl className="mt-4">
                <DetailRow label="Signed in as" value={settings.accountName} />
                <DetailRow label="Email" value={settings.accountEmail} />
              </dl>
            </div>

            <div className="border-t border-border p-5 sm:p-6 lg:border-t-0">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Workspace
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                ClassTrace keeps this as your personal teacher workspace for
                roster students and validated evidence.
              </p>
              <dl className="mt-4">
                <DetailRow label="Workspace" value={settings.workspaceName} />
                <DetailRow
                  label="Teacher profile"
                  value={settings.teacherDisplayName}
                />
              </dl>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="help-feedback-heading"
          className="rounded-card border border-border bg-card p-5 shadow-paper sm:p-6"
        >
          <div className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
              <MessageCircleQuestion
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
            <div>
              <h2
                id="help-feedback-heading"
                className="font-display text-lg font-semibold text-foreground"
              >
                Help and feedback
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Tell us what broke, what felt confusing, or what would make
                ClassTrace more useful.
              </p>
            </div>
          </div>

          <HelpFeedbackForm
            initialReplyEmail={settings.replyEmail}
            initialErrorReference={initialErrorReference}
          />
        </section>

        <section
          aria-labelledby="privacy-terms-heading"
          className="border-y border-border/70 py-5"
        >
          <div className="mb-3">
              <h2
                id="privacy-terms-heading"
              className="text-sm font-semibold text-foreground"
              >
                Privacy and beta terms
              </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review data handling, beta boundaries, support, and account
              deletion.
            </p>
          </div>

          <nav aria-label="Privacy and account information">
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {[
                { label: "Privacy", href: routes.privacy },
                { label: "Beta terms", href: routes.terms },
                { label: "Support", href: routes.support },
                { label: "Account deletion", href: routes.dataDeletion },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center justify-between gap-4 border-t border-border/60 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-link"
                  >
                    <span>{item.label}</span>
                    <ExternalLink
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section className="py-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Sign out
                </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Leave this ClassTrace session and return to the public page.
                </p>
            </div>
            <SettingsSignOutAction />
          </div>
        </section>
      </div>
    </div>
  );
}
