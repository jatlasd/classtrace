"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import styles from "./filing.module.css";

type EvidenceType = "Academic" | "Behavior" | "Follow-up";

const TAB_FILTERS = ["All", "Academic", "Behavior", "Follow-up"] as const;

type TabFilter = (typeof TAB_FILTERS)[number];

const records: Array<{
  date: string;
  topic: string;
  type: EvidenceType;
  note: string;
}> = [
  {
    date: "Today, 9:15 AM",
    topic: "Calm-down strategy",
    type: "Behavior",
    note: "Used her calm-down strategy without a prompt.",
  },
  {
    date: "May 8, 1:40 PM",
    topic: "Science lab",
    type: "Academic",
    note: "Predicted the outcome and explained her reasoning to the table.",
  },
  {
    date: "May 2, 8:05 AM",
    topic: "Morning routine",
    type: "Follow-up",
    note: "Settled in without a prompt. Check again after the schedule change.",
  },
  {
    date: "Apr 30, 10:22 AM",
    topic: "Reading discussion",
    type: "Academic",
    note: "Connected themes across chapters and supported the idea with text evidence.",
  },
];

const activeTabClassByFilter: Record<TabFilter, string> = {
  All: styles.finderTabActiveAll,
  Academic: styles.finderTabActiveAcademic,
  Behavior: styles.finderTabActiveBehavior,
  "Follow-up": styles.finderTabActiveFollowup,
};

const typeClassByType: Record<EvidenceType, string> = {
  Academic: styles.finderRecordTypeAcademic,
  Behavior: styles.finderRecordTypeBehavior,
  "Follow-up": styles.finderRecordTypeFollowup,
};

export function FiledEvidenceFinder() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("All");

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return records.filter((record) => {
      if (activeTab !== "All" && record.type !== activeTab) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return `${record.topic} ${record.note}`.toLocaleLowerCase().includes(normalizedQuery);
    });
  }, [query, activeTab]);

  return (
    <div className={styles.finderShell}>
      <div className={styles.finderTabs} role="tablist" aria-label="Filter evidence by tab">
        {TAB_FILTERS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? `${styles.finderTab} ${styles.finderTabActive} ${activeTabClassByFilter[tab]}`
                  : styles.finderTab
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className={styles.finderBody}>
        <div className={styles.finderToolbar}>
          <div>
            <span>Student timeline</span>
            <strong>Stacy</strong>
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
                placeholder="Try calm or science"
              />
            </div>
          </label>
          <p className={styles.finderCount} aria-live="polite">
            {visibleRecords.length} validated {visibleRecords.length === 1 ? "record" : "records"}
          </p>
        </div>

        {visibleRecords.length > 0 ? (
          <ol className={styles.finderResults}>
            {visibleRecords.map((record) => (
              <li key={`${record.date}-${record.topic}`}>
                <time>{record.date}</time>
                <span className={`${styles.finderRecordType} ${typeClassByType[record.type]}`}>
                  {record.type}
                </span>
                <div className={styles.finderRecordBody}>
                  <strong>{record.topic}</strong>
                  <p>{record.note}</p>
                </div>
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
    </div>
  );
}
