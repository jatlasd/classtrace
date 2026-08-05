import type { Metadata } from "next";
import Link from "next/link";
import { Manrope } from "next/font/google";
import {
  ArrowRight,
  FileCheck2,
  FolderClosed,
  LockKeyhole,
} from "lucide-react";
import { FiledEvidenceFinder } from "./filed-evidence-finder";
import { FiledProductDemo } from "./filed-product-demo";
import { routes } from "@/lib/routes";
import styles from "./filing.module.css";

const filedFont = Manrope({
  variable: "--font-filed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Filed | Student evidence without the mental filing cabinet",
  description:
    "Write what happened, review the structured draft, and find validated student evidence when you need it later.",
};

export default function FilingPage() {
  return (
    <div className={`${styles.page} ${filedFont.variable}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <div className={styles.siteShell}>
        <header className={styles.header}>
          <Link className={styles.wordmark} href="/filing" aria-label="Filed home">
            <span className={styles.brandMark} aria-hidden="true">
              <FolderClosed size={21} strokeWidth={2.1} />
            </span>
            Filed
          </Link>

          <nav className={styles.nav} aria-label="Filed navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#for-teachers">For teachers</a>
            <a href="#why-filed">Why Filed</a>
          </nav>

          <div className={styles.accessNav}>
            <span className={styles.inviteStatus}>
              <LockKeyhole aria-hidden="true" size={15} strokeWidth={1.9} />
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
                <span>Filed does it for you.</span>
              </h1>
              <p>
                Write the moment. Check the draft. Filed keeps the evidence where
                you can find it.
              </p>
              <div className={styles.heroActions}>
                <Link
                  className={styles.primaryAction}
                  href={routes.signUp}
                  prefetch={false}
                >
                  Complete invited sign-up
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </Link>
                <Link className={styles.signInAction} href={routes.signIn} prefetch={false}>
                  Sign in
                </Link>
              </div>
            </div>

            <FiledProductDemo />
          </section>

          <section
            id="for-teachers"
            className={styles.burdenSection}
            aria-labelledby="burden-heading"
          >
            <div className={styles.burdenIntro}>
              <p>The mental filing cabinet</p>
              <h2 id="burden-heading">
                The note was one sentence. Holding the whole filing system in your
                head was the work.
              </h2>
            </div>

            <div className={styles.burdenQuestions} aria-label="The context teachers must remember">
              <p>Who was it?</p>
              <p>When did it happen?</p>
              <p>Where does it belong?</p>
              <p>Will I find it later?</p>
              <div className={styles.burdenRelease}>
                <span>Put the moment down once.</span>
                <strong>Filed carries the context forward.</strong>
              </div>
            </div>
          </section>

          <section
            id="how-it-works"
            className={styles.reviewChapter}
            aria-labelledby="review-heading"
          >
            <div className={styles.sectionHeading}>
              <h2 id="review-heading">Write what happened. Keep the final say.</h2>
              <p>
                Filed turns one student-specific note into a structured draft. You
                review every field and the Evidence note before save.
              </p>
            </div>

            <div className={styles.reviewCanvas}>
              <article className={styles.rawNotePanel}>
                <span>What you write</span>
                <p>
                  During science lab, @Jeremy noticed a classmate&apos;s setup was
                  off balance. He suggested a fix and helped adjust it.
                </p>
              </article>

              <div className={styles.draftBridge} aria-hidden="true">
                <span>Filed drafts</span>
                <ArrowRight size={24} strokeWidth={1.8} />
              </div>

              <article className={styles.reviewDetailPanel}>
                <header>
                  <span>Review before saving</span>
                  <strong>Jeremy</strong>
                </header>
                <dl>
                  <div>
                    <dt>Student</dt>
                    <dd>Jeremy</dd>
                  </div>
                  <div>
                    <dt>Evidence type</dt>
                    <dd>Academic</dd>
                  </div>
                  <div>
                    <dt>Topic</dt>
                    <dd>Science lab</dd>
                  </div>
                </dl>
                <div className={styles.reviewedNote}>
                  <span>Evidence note</span>
                  <p>
                    During science lab, @Jeremy noticed a classmate&apos;s setup was
                    off balance, suggested a fix, and helped adjust it.
                  </p>
                </div>
                <footer>
                  <span>Teacher review required</span>
                  <strong>Ready for your approval</strong>
                </footer>
              </article>
            </div>

            <p className={styles.reviewPromise}>
              <FileCheck2 aria-hidden="true" size={23} strokeWidth={1.9} />
              Nothing is permanent until you approve it.
            </p>
          </section>

          <section
            id="why-filed"
            className={styles.finderChapter}
            aria-labelledby="finder-heading"
          >
            <div className={styles.finderHeading}>
              <h2 id="finder-heading">When later arrives, it is already filed.</h2>
              <p>
                Search validated evidence by student, topic, or the words you
                remember.
              </p>
            </div>

            <FiledEvidenceFinder />
          </section>

          <aside className={styles.boundaryStatement} aria-label="Filed product boundaries">
            <p>Raw capture stays temporary.</p>
            <p>The teacher-approved Evidence note becomes the record.</p>
            <span>Deterministic parsing. One resolved student. Teacher review before save.</span>
          </aside>

          <section className={styles.closing} aria-labelledby="closing-heading">
            <div>
              <h2 id="closing-heading">Put the moment down.</h2>
              <p>Filed will keep its place until you need it again.</p>
            </div>
            <Link className={styles.primaryAction} href={routes.signUp} prefetch={false}>
              Complete invited sign-up
              <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>Filed is a placeholder name for this landing-page experiment.</p>
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
