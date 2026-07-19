import { Reveal } from "@/components/landing/scroll-motion";
import Image from "next/image";

const roles = [
  { label: "Special education teachers", asset: "blue" },
  { label: "Case managers", asset: "gold" },
  { label: "Interventionists", asset: "sage" },
  { label: "Resource teachers", asset: "rose" },
  { label: "Co-teachers", asset: "lavender" },
  {
    label: "Teachers drowning in documentation",
    asset: "tan",
    className: "min-h-16 w-80 justify-center px-7 text-lg",
  },
];

export function LandingAudience() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6 lg:px-8 lg:py-20">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
        Built for the people expected to remember everything.
      </h2>
      <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-6">
        {roles.map((role, index) => (
          <li key={role.label}>
            <Reveal
              delay={index * 90}
              from="translate-y-5 scale-95"
              className={`relative ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
            >
              <span
                className={`font-hand relative isolate inline-flex min-h-14 items-center px-6 py-2 text-foreground ${role.className ?? "text-lg"}`}
              >
                <Image
                  src={`/svg/landing/paper-label-${role.asset}.svg?v=3`}
                  alt=""
                  fill
                  sizes="300px"
                  className="-z-10 object-fill"
                />
                <Image
                  src="/svg/landing/tape-strip.svg?v=2"
                  alt=""
                  width={48}
                  height={17}
                  className="absolute left-1/2 top-0 h-4 w-12 -translate-x-1/2 rotate-2"
                />
                <span
                  className={role.asset === "tan" ? "relative whitespace-nowrap" : "relative"}
                >
                  {role.label}
                </span>
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
