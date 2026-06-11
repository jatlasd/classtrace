const nots = [
  "a gradebook",
  "an IEP generator",
  "an admin dashboard",
  "a surveillance tool",
];

export function LandingNotDashboard() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            What ClassTrace is not
          </p>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
            This is not another platform your district bought.
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {nots.map((item) => (
              <li
                key={item}
                className="tape-tab relative rounded-sm px-4 py-2.5"
              >
                <span className="font-hand text-base text-sidebar-foreground line-through decoration-destructive decoration-2">
                  Not {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-display mt-10 text-3xl font-medium leading-snug text-accent">
            It&apos;s your private documentation memory.
          </p>
        </div>
        <div className="rounded-card border border-sidebar-border bg-sidebar-accent/60 p-6 lg:p-8">
          <div className="space-y-4 text-[15px] leading-relaxed text-sidebar-foreground/85">
            <p>
              Every saved record is one you reviewed and validated. ClassTrace
              structures your words — it never invents documentation, never
              guesses on your behalf, and never saves anything without your
              sign-off.
            </p>
            <p>
              <span className="font-display text-lg text-accent">
                Your roster is yours. Your evidence is yours.
              </span>{" "}
              <span className="font-hand text-xl text-accent">
                One teacher, one workspace.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
