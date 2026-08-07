"use client";

import { useState } from "react";
import { Check, FileCheck2, PenLine, ShieldCheck } from "lucide-react";
import styles from "./filing.module.css";

const INITIAL_NOTE = "@Stacy used her calm-down strategy!!";

export function FiledProductDemo() {
  const [note, setNote] = useState(INITIAL_NOTE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function handleSave() {
    setIsEditing(false);
    setIsSaved(true);
  }

  return (
    <div className={styles.demoFlow} aria-label="Interactive Filed product preview">
      <section className={styles.demoBeat} aria-label="First, write one line">
        <div className={styles.demoBeatLabel}>
          <span aria-hidden="true">1</span>
          <strong>Scribble it down</strong>
        </div>
        <article className={`${styles.demoSheet} ${styles.demoCapture}`}>
          <div className={styles.demoSheetHeader}>
            <span>
              <PenLine aria-hidden="true" size={17} strokeWidth={2.1} />
              Quick capture
            </span>
            <span>Tue 9:12 AM</span>
          </div>
          <label htmlFor="filed-demo-capture">What happened?</label>
          <textarea
            id="filed-demo-capture"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setIsSaved(false);
            }}
            rows={6}
          />
          <p>Mid-lesson speed. Exclamation points welcome.</p>
        </article>
      </section>

      <section className={styles.demoBeat} aria-label="Second, check the draft">
        <div className={styles.demoBeatLabel}>
          <span aria-hidden="true">2</span>
          <strong>Check the draft</strong>
        </div>
        <article className={`${styles.demoSheet} ${styles.demoDraft}`}>
          <div className={styles.demoSheetHeader}>
            <span>
              <FileCheck2 aria-hidden="true" size={17} strokeWidth={2.1} />
              Review before saving
            </span>
            <span>Drafted by Filed</span>
          </div>

          <dl className={styles.demoFields}>
            <div>
              <dt>Student</dt>
              <dd>Stacy</dd>
            </div>
            <div>
              <dt>Evidence type</dt>
              <dd>
                <span className={styles.demoTypeTag}>Behavior</span>
              </dd>
            </div>
            <div>
              <dt>Topic</dt>
              <dd>Calm-down strategy</dd>
            </div>
          </dl>

          <div className={styles.demoNote}>
            <div>
              <span>Evidence note</span>
              <button type="button" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? "Done editing" : "Edit"}
              </button>
            </div>
            {isEditing ? (
              <textarea
                aria-label="Evidence note"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setIsSaved(false);
                }}
                rows={4}
              />
            ) : (
              <p>{note}</p>
            )}
          </div>
        </article>
      </section>

      <section className={`${styles.demoBeat} ${styles.demoApprove}`} aria-label="Third, approve and it is filed">
        <div className={styles.demoBeatLabel}>
          <span aria-hidden="true">3</span>
          <strong>Approve. It&apos;s filed.</strong>
        </div>
        <article className={`${styles.demoSheet} ${styles.demoApproveCard}`}>
          <p aria-live="polite">
            {isSaved ? (
              <>
                <Check aria-hidden="true" size={16} strokeWidth={2.5} />
                Saved to Stacy&apos;s timeline
              </>
            ) : (
              <>
                <ShieldCheck aria-hidden="true" size={16} strokeWidth={2.1} />
                Nothing is permanent until you approve it.
              </>
            )}
          </p>
          <button type="button" onClick={handleSave} disabled={isSaved || note.trim().length === 0}>
            {isSaved ? "Evidence saved" : "Save validated evidence"}
          </button>
        </article>

        <article
          className={
            isSaved ? `${styles.demoTimeline} ${styles.demoTimelineSaved}` : styles.demoTimeline
          }
        >
          <div className={styles.demoTimelineHeader}>
            <span>Stacy&apos;s timeline</span>
            <span>{isSaved ? "Just updated" : "Validated evidence"}</span>
          </div>
          <div className={styles.demoTimelineRow}>
            <time>Tue 9:15 AM</time>
            <strong>Calm-down strategy</strong>
            <p>{note}</p>
          </div>
        </article>
      </section>
    </div>
  );
}
