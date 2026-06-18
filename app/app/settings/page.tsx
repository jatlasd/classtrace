import { BadgeCheck, BriefcaseBusiness, UserRound } from "lucide-react";
import { SettingsSignOutAction } from "@/components/settings/settings-sign-out-action";
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

export default async function SettingsPage() {
  const settings = await getSettingsPageData();

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

      <div className="space-y-4">
        <section className="border border-border bg-card/60 p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
              <UserRound className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Account
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sign-in details are managed by the account provider you used to
                enter ClassTrace.
              </p>
            </div>
          </div>

          <dl>
            <DetailRow label="Signed in as" value={settings.accountName} />
            <DetailRow label="Email" value={settings.accountEmail} />
          </dl>
        </section>

        <section className="border border-border bg-card/60 p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
              <BriefcaseBusiness className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Workspace
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                ClassTrace keeps this as your personal teacher workspace for
                roster students and validated evidence.
              </p>
            </div>
          </div>

          <dl>
            <DetailRow label="Workspace" value={settings.workspaceName} />
            <DetailRow
              label="Teacher profile"
              value={settings.teacherDisplayName}
            />
          </dl>
        </section>

        <section className="border-l-4 border-primary bg-card/60 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-primary">
                <BadgeCheck className="size-4" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Sign out
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Leave this ClassTrace session and return to the public page.
                </p>
              </div>
            </div>
            <SettingsSignOutAction />
          </div>
        </section>
      </div>
    </div>
  );
}
