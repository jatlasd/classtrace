const roles = [
  "Special education teachers",
  "Case managers",
  "Interventionists",
  "Resource teachers",
  "Co-teachers",
  "Anyone drowning in documentation",
];

export function LandingAudience() {
  return (
    <section className="border-y border-border/60 bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-6 md:px-6 lg:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Built for
        </span>
        {roles.map((role, index) => (
          <span key={role} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="font-hand text-base text-primary/60">
                ✱
              </span>
            )}
            <span className="text-sm font-medium text-foreground">{role}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
