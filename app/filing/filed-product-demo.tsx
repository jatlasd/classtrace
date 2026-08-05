"use client";

import { useState } from "react";
import { Check, FileCheck2, PenLine } from "lucide-react";
import styles from "./filing.module.css";

const INITIAL_NOTE =
  "During science lab, @Jeremy noticed a classmate's setup was off balance. He suggested a fix and helped adjust it. The experiment worked better after that.";

export function FiledProductDemo() {
  const [note, setNote] = useState(INITIAL_NOTE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function handleSave() {
    setIsEditing(false);
    setIsSaved(true);
  }

  return (
    <section className={styles.productStage} aria-label="Interactive Filed product preview">
      <article className={styles.captureSheet}>
        <div className={styles.sheetHeader}>
          <span>
            <PenLine aria-hidden="true" size={18} strokeWidth={2} />
            Quick capture
          </span>
          <span>Jeremy · Today, 9:12 AM</span>
        </div>
        <label htmlFor="filed-demo-capture">What happened?</label>
        <textarea
          id="filed-demo-capture"
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setIsSaved(false);
          }}
          rows={5}
        />
        <p>Draft ready for your review</p>
      </article>

      <article className={styles.reviewSheet}>
        <div className={styles.sheetHeader}>
          <span>
            <FileCheck2 aria-hidden="true" size={19} strokeWidth={2} />
            Review before saving
          </span>
          <span>Jeremy · Today, 9:15 AM</span>
        </div>

        <dl className={styles.reviewFields}>
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

        <div className={styles.evidenceNote}>
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

        <div className={styles.reviewActions}>
          <p aria-live="polite">
            {isSaved ? (
              <>
                <Check aria-hidden="true" size={16} strokeWidth={2.3} />
                Saved to Jeremy&apos;s timeline
              </>
            ) : (
              "Nothing is permanent until you approve it."
            )}
          </p>
          <button type="button" onClick={handleSave} disabled={isSaved || note.trim().length === 0}>
            {isSaved ? "Evidence saved" : "Save validated evidence"}
          </button>
        </div>
      </article>

      <article className={`${styles.demoTimeline} ${isSaved ? styles.demoTimelineSaved : ""}`}>
        <div className={styles.demoTimelineHeader}>
          <span>Jeremy&apos;s timeline</span>
          <span>{isSaved ? "Just updated" : "Validated evidence"}</span>
        </div>
        <div className={styles.demoTimelineRow}>
          <span aria-hidden="true" />
          <time>Today, 9:15 AM</time>
          <strong>Science lab</strong>
          <p>{note}</p>
        </div>
      </article>
    </section>
  );
}
