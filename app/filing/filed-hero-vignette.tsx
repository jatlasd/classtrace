import { Check, PenLine } from "lucide-react";
import styles from "./filing.module.css";

const students = [
  { name: "Jeremy", records: "Science lab, group work" },
  { name: "Stacy", records: "Calm-down strategy, reading" },
  { name: "Mary", records: "Math talk, check-ins" },
] as const;

export function FiledHeroVignette() {
  return (
    <div className={styles.vignette} aria-label="A captured note filing itself into Stacy's folder" role="img">
      <article className={styles.vignetteCard} aria-hidden="true">
        <div className={styles.vignetteCardHeader}>
          <span>
            <PenLine aria-hidden="true" size={17} strokeWidth={2.1} />
            Quick capture
          </span>
          <span>Tue 9:12 AM</span>
        </div>
        <p>
          <span className={styles.vignetteMention}>@Stacy</span> used her calm-down strategy!!
        </p>
      </article>

      <span className={styles.vignetteChip} aria-hidden="true">
        Filing under Stacy
        <span className={styles.vignetteChipType}>Behavior</span>
      </span>

      <div className={styles.vignetteTravel} aria-hidden="true">
        Used her calm-down strategy!!
      </div>

      <div className={styles.vignetteDrawer} aria-hidden="true">
        <span className={styles.vignetteDrawerLabel}>Your students</span>
        <div className={styles.vignetteFolders}>
          {students.map((student) => (
            <div
              key={student.name}
              className={
                student.name === "Stacy"
                  ? `${styles.vignetteFolder} ${styles.vignetteFolderActive}`
                  : styles.vignetteFolder
              }
            >
              <span className={styles.vignetteFolderTab}>{student.name}</span>
              <span className={styles.vignetteFolderBody} />
              <span className={styles.vignetteFolderMeta}>{student.records}</span>
              {student.name === "Stacy" ? (
                <span className={styles.vignetteFiledFlag}>
                  <Check size={13} strokeWidth={3} />
                  Filed
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
