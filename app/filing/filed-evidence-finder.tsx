"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import styles from "./filing.module.css";

const records = [
  {
    date: "Today, 9:15 AM",
    topic: "Science lab",
    note: "Noticed a classmate's setup was off balance and helped adjust it.",
  },
  {
    date: "May 8, 1:40 PM",
    topic: "Group project",
    note: "Organized the materials and kept the group on track.",
  },
  {
    date: "Apr 30, 10:22 AM",
    topic: "Reading discussion",
    note: "Connected themes across chapters and supported the idea with text evidence.",
  },
];

export function FiledEvidenceFinder() {
  const [query, setQuery] = useState("");

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) =>
      `${record.topic} ${record.note}`.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className={styles.finderShell}>
      <div className={styles.finderToolbar}>
        <div>
          <span>Student timeline</span>
          <strong>Jeremy</strong>
        </div>
        <label className={styles.finderSearch} htmlFor="filed-evidence-search">
          <span>Find validated evidence</span>
          <div>
            <Search aria-hidden="true" size={18} strokeWidth={1.9} />
            <input
              id="filed-evidence-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try science or project"
            />
          </div>
        </label>
        <p aria-live="polite">
          {visibleRecords.length} validated {visibleRecords.length === 1 ? "record" : "records"}
        </p>
      </div>

      {visibleRecords.length > 0 ? (
        <ol className={styles.finderResults}>
          {visibleRecords.map((record) => (
            <li key={`${record.date}-${record.topic}`}>
              <time>{record.date}</time>
              <strong>{record.topic}</strong>
              <p>{record.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.finderEmpty}>
          <strong>No matching evidence</strong>
          <p>Try a student, topic, or phrase from the note.</p>
        </div>
      )}
    </div>
  );
}
