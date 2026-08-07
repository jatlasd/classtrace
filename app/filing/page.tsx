import type { Metadata } from "next";
import Link from "next/link";
import { Manrope, Playfair_Display } from "next/font/google";
import { ArrowRight, Check, LockKeyhole, PenLine, ShieldCheck, Stamp } from "lucide-react";
import { FiledEvidenceFinder } from "./filed-evidence-finder";
import { FiledHeroVignette } from "./filed-hero-vignette";
import { FiledProductDemo } from "./filed-product-demo";
import { FiledReveal } from "./filed-reveal";
import { routes } from "@/lib/routes";
import styles from "./filing.module.css";

const filedSans = Manrope({
  variable: "--font-filed-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const filedSerif = Playfair_Display({
  variable: "--font-filed-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Filed | Stop organizing. Filed does it for you.",
  description:
    "Write what happened. Filed drafts the record, you approve it, and the evidence stays filed where you can find it.",
};

const filingRules = [
  "Every record belongs to exactly one roster student.",
  "You approve every note before it becomes permanent.",
  "Raw captures stay temporary. The approved note is the record.",
  "Deterministic parsing. No generative AI, ever.",
  "Your workspace is yours alone.",
];

export default function FilingPage() {
  return (
    <div className={`${styles.page} ${filedSans.variable} ${filedSerif.variable}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <div className={styles.siteShell}>
        <header className={styles.header}>
          <Link className={styles.wordmark} href="/filing" aria-label="Filed home">
            <span className={styles.brandMark} aria-hidden="true">
              <span className={styles.brandMarkSquare}>F</span>
              <span className={styles.brandMarkTabs}>
                <i />
                <i />
                <i />
              </span>
            </span>
            Filed
          </Link>

          <nav className={styles.nav} aria-label="Filed navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#find-it-later">Find it later</a>
            <a href="#filing-rules">The filing rules</a>
          </nav>

          <div className={styles.accessNav}>
            <span className={styles.inviteStatus}>
              <LockKeyhole aria-hidden="true" size={14} strokeWidth={2} />
              Invitation only
            </span>
            <Link href={routes.signIn} prefetch={false}>
              Sign in
            </Link>
          </div>
        </header>

        <main id="main-content">
          <section className={styles.hero} aria-labelledby="filed-heading">
            <div className={styles.heroCopy}>
              <h1 id="filed-heading">
                Stop organizing.
                <span>
                  Filed <span className={styles.markerHighlight}>does it for you.</span>
                </span>
              </h1>
              <p>
                Write what happened. Filed remembers where it belongs, so you never hold the
                filing system in your head again.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} href={routes.signUp} prefetch={false}>
                  Complete invited sign-up
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </Link>
                <Link className={styles.signInAction} href={routes.signIn} prefetch={false}>
                  Sign in
                </Link>
              </div>
            </div>

            <FiledHeroVignette />
          </section>

          <section className={styles.burdenSection} aria-labelledby="burden-heading">
            <div className={styles.burdenIntro}>
              <p>The mental filing cabinet</p>
              <h2 id="burden-heading">The note was never the hard part.</h2>
              <p className={styles.burdenLede}>
                Every quick note drags four filing questions behind it. Filed answers
                them from the line you already wrote.
              </p>
            </div>

            <div className={styles.burdenCanvas}>
              <article
                className={styles.burdenNote}
                aria-label="The captured note, marked up by Filed"
              >
                <div className={styles.burdenNoteHeader}>
                  <span>
                    <PenLine aria-hidden="true" size={17} strokeWidth={2.1} />
                    Quick capture
                  </span>
                  <mark className={`${styles.burdenMark} ${styles.burdenMarkWhen}`}>
                    Tue 9:12 AM
                  </mark>
                </div>
                <p>
                  <mark className={`${styles.burdenMark} ${styles.burdenMarkWho}`}>
                    @Stacy
                  </mark>{" "}
                  used her{" "}
                  <mark className={`${styles.burdenMark} ${styles.burdenMarkWhere}`}>
                    calm-down strategy
                  </mark>
                  !!
                </p>
              </article>

              <dl className={styles.burdenAnswers}>
                <div>
                  <dt>Who was it?</dt>
                  <dd>
                    <span className={`${styles.burdenChip} ${styles.burdenChipWho}`}>
                      Stacy
                    </span>
                    matched to your roster.
                  </dd>
                </div>
                <div>
                  <dt>When did it happen?</dt>
                  <dd>
                    <span className={`${styles.burdenChip} ${styles.burdenChipWhen}`}>
                      Tue 9:12 AM
                    </span>
                    stamped as you typed.
                  </dd>
                </div>
                <div>
                  <dt>Where does it belong?</dt>
                  <dd>
                    <span className={`${styles.burdenChip} ${styles.burdenChipWhere}`}>
                      Calm-down strategy
                    </span>
                    drafted as the topic, filed under Behavior.
                  </dd>
                </div>
                <div>
                  <dt>Will you find it in April?</dt>
                  <dd>
                    <span className={styles.burdenFiledProof}>
                      <Check aria-hidden="true" size={14} strokeWidth={2.6} />
                      Already on Stacy&apos;s timeline
                    </span>
                    one search away, all year.
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section
            id="how-it-works"
            className={styles.reviewChapter}
            aria-labelledby="review-heading"
          >
            <FiledReveal>
              <div className={styles.sectionHeading}>
                <h2 id="review-heading">You keep the judgment. Filed keeps the files.</h2>
                <p>
                  One line in. A structured, teacher-approved record out. Try it below, then save
                  the note yourself.
                </p>
              </div>
            </FiledReveal>

            <FiledProductDemo />
          </section>

          <section
            id="find-it-later"
            className={styles.finderChapter}
            aria-labelledby="finder-heading"
          >
            <FiledReveal>
              <div className={styles.finderHeading}>
                <h2 id="finder-heading">When later arrives, it is already filed.</h2>
                <p>Pull one student&apos;s record by tab, topic, or the words you remember.</p>
              </div>
            </FiledReveal>

            <FiledEvidenceFinder />
          </section>

          <section
            id="filing-rules"
            className={styles.rulesSection}
            aria-labelledby="rules-heading"
          >
            <FiledReveal>
              <div className={styles.rulesIntro}>
                <h2 id="rules-heading">Filed follows rules, not hunches.</h2>
                <p>
                  A filing system is only useful if you can trust it. These boundaries are fixed,
                  and they do not bend.
                </p>
              </div>
            </FiledReveal>

            <FiledReveal>
              <article className={styles.rulesCard} aria-label="The Filed filing rules">
                <div className={styles.rulesCardHeading}>
                  <span>The filing rules</span>
                  <Stamp aria-hidden="true" size={18} strokeWidth={1.9} />
                </div>
                <ul>
                  {filingRules.map((rule) => (
                    <li key={rule}>
                      <ShieldCheck aria-hidden="true" size={16} strokeWidth={2.1} />
                      {rule}
                    </li>
                  ))}
                </ul>
              </article>
            </FiledReveal>
          </section>

          <section className={styles.closing} aria-labelledby="closing-heading">
            <FiledReveal>
              <div className={styles.closingTabs} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <h2 id="closing-heading">Put the moment down.</h2>
              <p>Filed keeps its place until you need it again.</p>
              <Link className={styles.primaryAction} href={routes.signUp} prefetch={false}>
                Complete invited sign-up
                <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
              </Link>
            </FiledReveal>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>Filed is an invitation-only beta.</p>
          <nav aria-label="Filed legal and support">
            <Link href={routes.privacy}>Privacy</Link>
            <Link href={routes.terms}>Terms</Link>
            <Link href={routes.support}>Support</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
