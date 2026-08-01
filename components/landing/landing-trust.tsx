import { Reveal } from "@/components/landing/scroll-motion";
import Image from "next/image";

const promises = [
  {
    title: "Your words, saved exactly",
    body: "The evidence note is stored exactly as you approved it. The raw scribble never quietly becomes the permanent record.",
  },
  {
    title: "Deterministic, not generative",
    body: "ClassTrace structures your note with plain rules you can predict. It never invents documentation or writes on your behalf.",
  },
  {
    title: "One teacher, one workspace",
    body: "Your roster and your evidence live in a private workspace only you can see. No admin views, no district feed.",
  },
];

const nots = [
  "Not a gradebook",
  "Not an IEP generator",
  "Not an admin dashboard",
  "Not a surveillance tool",
];

export function LandingTrust() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            This is not another platform your district bought.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-sidebar-foreground/80">
            It&apos;s your private documentation memory — and every saved
            record is one you reviewed and signed off on.
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:mt-10">
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

        <dl className="mx-auto mt-10 grid max-w-4xl gap-8 text-center sm:grid-cols-3 sm:gap-8 sm:text-left lg:mt-14 lg:gap-10">
          {promises.map((promise, index) => (
            <Reveal key={promise.title} delay={index * 120}>
              <dt className="font-display text-lg font-semibold text-sidebar-primary">
                {promise.title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-sidebar-foreground/80">
                {promise.body}
              </dd>
            </Reveal>
          ))}
        </dl>

        <p className="font-hand mt-10 text-center text-xl text-sidebar-primary lg:mt-14 lg:text-2xl">
          Your roster is yours. Your evidence is yours.{" "}
          <span className="underline decoration-sidebar-primary/70 decoration-2 underline-offset-4">
            One teacher, one workspace.
          </span>
        </p>
      </div>
    </section>
  );
}
