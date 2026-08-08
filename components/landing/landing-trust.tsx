import Image from "next/image";
import { Check } from "lucide-react";
import { TapeStrip } from "@/components/landing/landing-ephemera";
import { Reveal } from "@/components/landing/scroll-motion";
import styles from "./landing.module.css";

const filingRules = [
  "Every record belongs to exactly one student.",
  "Nothing saves without your sign-off.",
  "Your words are stored exactly as you approved them.",
  "Deterministic parsing — it never writes for you.",
  "One teacher, one workspace. Yours alone.",
];

const nots = [
  "Not a gradebook",
  "Not an IEP generator",
  "Not an admin dashboard",
  "Not a surveillance tool",
];

export function LandingTrust() {
  return (
    <section className="overflow-x-clip bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            This is not another platform your district bought.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-sidebar-foreground/80">
            It&apos;s your private filing cabinet — every record in it is one
            you reviewed and signed off on. And it follows rules that
            don&apos;t bend.
          </p>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {nots.map((item, index) => (
            <li key={item}>
              <Reveal
                delay={index * 110}
                from="translate-y-4 scale-90"
                className={`relative isolate ${index % 2 === 0 ? "-rotate-1" : "rotate-1"} px-6 py-3`}
              >
                <Image
                  src="/svg/landing/crossed-paper-slip.svg?v=2"
                  alt=""
                  fill
                  sizes="240px"
                  className="-z-10 object-fill"
                />
                <span className="font-hand relative text-lg text-foreground">
                  {item}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal
          from="translate-y-10 scale-[0.97]"
          className="mx-auto mt-14 max-w-xl"
        >
          <div className={`${styles.ruledCard} rotate-1`}>
            <TapeStrip className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" />
            <p
              className={`${styles.ruledRow} text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground`}
            >
              The filing rules
            </p>
            <ul>
              {filingRules.map((rule) => (
                <li
                  key={rule}
                  className={`${styles.ruledRow} text-[15px] font-medium leading-snug text-foreground`}
                >
                  <Check
                    className="size-4 shrink-0 text-primary"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <p className="font-hand mt-14 text-center text-xl text-sidebar-primary lg:text-2xl">
          Your roster is yours. Your evidence is yours.{" "}
          <span className="underline decoration-sidebar-primary/70 decoration-2 underline-offset-4">
            One teacher, one workspace.
          </span>
        </p>
      </div>
    </section>
  );
}
