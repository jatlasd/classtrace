const nots = ["a gradebook", "an IEP generator", "an admin dashboard", "a surveillance tool"];

export function LandingNotDashboard() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            What ClassTrace is not
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
            This is not{" "}
            <span className="text-sidebar-foreground/50">another platform</span>{" "}
            your district bought.
          </h2>
          <ul className="mt-8 space-y-3">
            {nots.map((item) => (
              <li key={item} className="flex items-baseline gap-3 text-lg">
                <span aria-hidden="true" className="font-hand text-xl text-sidebar-primary">
                  ✗
                </span>
                <span className="text-sidebar-foreground/50 line-through decoration-sidebar-primary/70 decoration-2">
                  Not {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-hand mt-8 text-3xl leading-snug text-sidebar-foreground">
            It&apos;s your documentation memory.
          </p>
        </div>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-6 lg:p-8">
          <h3 className="text-lg font-semibold">You stay in control</h3>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-sidebar-foreground/80">
            <p>
              Every saved record is one <em>you</em> reviewed and validated.
              ClassTrace structures your words — it never invents
              documentation, never guesses on your behalf, and never saves
              anything without your sign-off.
            </p>
            <p>
              Your roster is yours. Your evidence is yours. One teacher, one
              workspace — no shared student records, no district visibility.
            </p>
          </div>
          <p className="mt-6 border-t border-sidebar-border pt-4 text-xs text-sidebar-foreground/60">
            Captures save only when exactly one student is attached and you
            approve the structured evidence.
          </p>
        </div>
      </div>
    </section>
  );
}
