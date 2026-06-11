const nots = [
  "Not a gradebook",
  "Not an IEP generator",
  "Not an admin dashboard",
  "Not a surveillance tool",
];

export function LandingNotDashboard() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 lg:px-8 lg:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
          This is not another platform your district bought.
        </h2>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {nots.map((item, index) => (
            <li
              key={item}
              className={`relative ${index % 2 === 0 ? "-rotate-1" : "rotate-1"} bg-audience-tan px-5 py-2.5 shadow-paper`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_top_right,transparent_48.75%,var(--destructive)_48.75%,var(--destructive)_51.25%,transparent_51.25%),linear-gradient(to_bottom_right,transparent_48.75%,var(--destructive)_48.75%,var(--destructive)_51.25%,transparent_51.25%)] opacity-60"
              />
              <span className="font-hand relative text-lg text-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
        <p className="font-display mt-12 text-2xl font-semibold tracking-tight text-sidebar-primary lg:text-3xl">
          It&apos;s your private documentation memory.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-sidebar-foreground/80">
          Every saved record is one you reviewed and validated. ClassTrace
          structures your words — it never invents documentation, never guesses
          on your behalf, and never saves anything without your sign-off.
        </p>
        <p className="font-hand mt-8 text-xl text-sidebar-primary lg:text-2xl">
          Your roster is yours. Your evidence is yours.{" "}
          <span className="underline decoration-sidebar-primary/70 decoration-2 underline-offset-4">
            One teacher, one workspace.
          </span>
        </p>
      </div>
    </section>
  );
}
