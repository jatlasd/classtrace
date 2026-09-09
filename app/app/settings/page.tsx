import { ExternalLink } from "lucide-react";
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
    <div className="grid gap-0.5 border-t border-dashed border-line py-2.5">
      <dt className="label text-fg-3">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-fg [overflow-wrap:anywhere]">
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
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6 border-b border-line pb-5">
        <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.01em] text-fg sm:text-5xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl font-display text-lg  leading-snug text-fg-2">
          Review the account signed in to ClassTrace and the personal teacher
          workspace connected to it.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-labelledby="help-feedback-heading"
          className="plate"
        >
          <div className="border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2
                id="help-feedback-heading"
                className="font-display text-2xl font-semibold text-fg"
              >
                Help and feedback
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-2">
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
          <section className="overflow-hidden rounded-md border border-line bg-well">
            <div className="px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-fg">
                Account
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-fg-2">
                Sign-in details are managed by your account provider.
              </p>
              <dl className="mt-3">
                <DetailRow label="Signed in as" value={settings.accountName} />
                <DetailRow label="Email" value={settings.accountEmail} />
              </dl>
            </div>

            <div className="border-t border-line px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-fg">
                Workspace
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-fg-2">
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
            className="plate overflow-hidden"
          >
            <div className="border-b border-line px-4 py-3">
              <h2
                id="privacy-terms-heading"
                className="font-display text-lg font-semibold text-fg"
              >
                Privacy and beta terms
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-fg-2">
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
                  <li key={item.href} className="border-b border-line last:border-b-0">
                    <Link
                      href={item.href}
                      className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-well hover:text-fg"
                    >
                      <span>{item.label}</span>
                      <ExternalLink
                        className="size-3.5 shrink-0 text-fg-2"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="flex items-center justify-between gap-4 border-y border-line py-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-fg">
                Sign out
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-fg-2">
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
