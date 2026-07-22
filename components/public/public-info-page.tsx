import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { routes } from "@/lib/routes";

type PageSection = {
  id: string;
  label: string;
};

type PublicInfoPageProps = {
  title: string;
  description: string;
  sections: PageSection[];
  children: ReactNode;
  lastUpdated?: string;
};

export function PublicInfoPage({
  title,
  description,
  sections,
  children,
  lastUpdated,
}: PublicInfoPageProps) {
  return (
    <div className="landing-paper-texture relative flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <Link href={routes.root} className="flex items-center gap-2.5">
            <NotebookPen
              className="size-7 text-navy"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
              ClassTrace
            </span>
          </Link>
          <nav aria-label="Public" className="flex items-center gap-4">
            <Link
              href={routes.support}
              className="rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Support
            </Link>
            <Link
              href={routes.signIn}
              className="rounded-md py-2 text-sm font-semibold text-link transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[210px_minmax(0,720px)] lg:gap-16 lg:px-8 lg:py-16">
          <aside className="lg:pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              ClassTrace beta
            </p>
            <nav aria-label="On this page" className="mt-4">
              <ol className="border-l border-border">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={"#" + section.id}
                      className="group flex gap-3 border-l-2 border-transparent py-2 pl-4 text-sm text-muted-foreground transition-colors hover:border-link hover:text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs text-muted-foreground/70"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0">
            <header className="border-b border-border pb-8">
              <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
              {lastUpdated ? (
                <p className="mt-5 font-mono text-xs text-muted-foreground">
                  Last updated {lastUpdated}
                </p>
              ) : null}
            </header>

            <div className="space-y-12 py-9 sm:py-11">{children}</div>
          </article>
        </div>
      </main>

      <SiteFooter showAccessLinks />
    </div>
  );
}

type PublicInfoSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function PublicInfoSection({
  id,
  title,
  children,
}: PublicInfoSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id + "-heading"}
      className="scroll-mt-8"
    >
      <h2
        id={id + "-heading"}
        className="font-display text-2xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc">
        {children}
      </div>
    </section>
  );
}

type PublicActionLinkProps = {
  href: string;
  children: ReactNode;
};

export function PublicActionLink({ href, children }: PublicActionLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-link/50 hover:text-link focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function PublicNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-y border-border bg-card/50 px-4 py-4 text-sm leading-6 text-foreground sm:px-5">
      {children}
    </div>
  );
}
