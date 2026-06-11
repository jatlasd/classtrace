const roles = [
  { label: "Special education teachers", color: "bg-audience-blue" },
  { label: "Case managers", color: "bg-audience-gold" },
  { label: "Interventionists", color: "bg-validated" },
  { label: "Resource teachers", color: "bg-audience-rose" },
  { label: "Co-teachers", color: "bg-audience-lavender" },
  { label: "Teachers drowning in documentation", color: "bg-audience-tan" },
];

export function LandingAudience() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 lg:px-8 lg:py-28">
      <h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        Built for the people expected to remember everything.
      </h2>
      <ul className="mt-10 flex flex-wrap gap-4">
        {roles.map((role, index) => (
          <li
            key={role.label}
            className={`relative ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
          >
            <span
              aria-hidden="true"
              className="tape-tab absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rounded-sm"
            />
            <span
              className={`font-hand inline-block rounded-sm border border-border/50 px-4 py-2.5 text-base text-foreground shadow-paper ${role.color}`}
            >
              {role.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
