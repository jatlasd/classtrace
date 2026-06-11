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
    <section className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6 lg:px-8 lg:py-20">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
        Built for the people expected to remember everything.
      </h2>
      <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-6">
        {roles.map((role, index) => (
          <li
            key={role.label}
            className={`relative ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
          >
            <span
              aria-hidden="true"
              className="tape-tab absolute -top-2.5 left-1/2 h-4 w-9 -translate-x-1/2 rotate-2 rounded-[2px]"
            />
            <span
              className={`font-hand inline-block rounded-sm px-5 py-2 text-lg text-foreground shadow-paper ${role.color}`}
            >
              {role.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
