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
    <section aria-labelledby="boundaries-heading" className="border-t border-line bg-plate">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 py-20 md:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="label text-fg-3">The lines we hold</p>
          <h2
            id="boundaries-heading"
            className="mt-4 max-w-[12ch] font-display-wide text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[0.95] text-fg"
          >
            Small on purpose.
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-fg-2">
            ClassTrace is an evidence inbox, not a notebook, gradebook, SIS, or
            IEP writer. The boundaries are the product.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            <Link href={routes.privacy} className="label text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg">
              Privacy
            </Link>
            <Link href={routes.terms} className="label text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg">
              Beta terms
            </Link>
          </div>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          {boundaries.map(([term, detail]) => (
            <div key={term} className="grid gap-1 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6">
              <dt className="font-display text-[1.35rem] font-semibold leading-tight text-fg">{term}</dt>
              <dd className="text-[15px] leading-relaxed text-fg-2">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
