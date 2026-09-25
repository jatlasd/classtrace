import Link from "next/link";
import { routes } from "@/lib/routes";

const boundaries = [
  ["One student per saved record.", "Zero- or multi-student captures cannot be saved."],
  ["You approve every record.", "Parsing suggests. It never saves on its own."],
  ["No generative AI.", "Deterministic rules only. Your notes never go to a model."],
  ["Raw notes are not stored.", "Only the Evidence note you approve, and one validated photo."],
  ["Drafts clear at midnight.", "Unreviewed captures never linger in a database."],
  ["One teacher, one workspace.", "No district view, no admin dashboard, no surveillance."],
] as const;

export function LandingBoundaries() {
  return (
    <section id="boundaries" aria-labelledby="boundaries-heading" className="scroll-mt-16 bg-base">
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="label text-fg-3">The lines we hold</p>
            <h2
              id="boundaries-heading"
              className="mt-4 font-display-wide text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[0.95] text-fg"
            >
              Small on purpose.
            </h2>
          </div>
          <div className="max-w-md lg:justify-self-end">
            <p className="text-[16px] leading-relaxed text-fg-2">
              ClassTrace is an evidence inbox, not a notebook, gradebook, SIS,
              or IEP writer. The boundaries are the product.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              <Link href={routes.privacy} className="label text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg">
                Privacy
              </Link>
              <Link href={routes.terms} className="label text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg">
                Beta terms
              </Link>
            </div>
          </div>
        </div>
        <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {boundaries.map(([term, detail]) => (
            <div key={term} className="rounded-xl border border-line bg-plate p-5">
              <dt className="font-display text-[1.25rem] font-semibold leading-tight text-fg">{term}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-fg-2">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
