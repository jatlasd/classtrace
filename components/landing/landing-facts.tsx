import { Check } from "lucide-react";

const rules = [
  ["You approve every record.", "A capture stays a draft until you review it."],
  ["No generative AI.", "Predictable rules suggest. Your notes never go to a model."],
  ["One student per record.", "Zero- and multi-student captures can’t be saved."],
  ["Drafts clear at midnight.", "Until you approve them, drafts stay on this device."],
] as const;

export function LandingFacts() {
  return (
    <section aria-label="Built-in rules" className="bg-base pt-8 lg:pt-10">
      <dl className="mx-auto grid max-w-[1280px] grid-cols-1 gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {rules.map(([rule, detail]) => (
          <div key={rule} className="flex gap-3 bg-base px-4 py-5 md:px-6 lg:px-8">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-fg text-base"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <div>
              <dt className="font-display text-[1.125rem] font-semibold leading-tight text-fg">{rule}</dt>
              <dd className="mt-1 max-w-[34ch] text-sm leading-relaxed text-fg-2">{detail}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
