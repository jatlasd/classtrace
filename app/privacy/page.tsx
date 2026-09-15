import type { Metadata } from "next";
import {
  PublicActionLink,
  PublicInfoPage,
  PublicInfoSection,
  PublicNote,
} from "@/components/public/public-info-page";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Privacy — ClassTrace",
  description:
    "How the ClassTrace beta handles teacher accounts, roster information, drafts, saved evidence, and support requests.",
};

const sections = [
  { id: "what-we-handle", label: "What we handle" },
  { id: "drafts-and-evidence", label: "Drafts and saved evidence" },
  { id: "service-providers", label: "Service providers" },
  { id: "retention-and-deletion", label: "Retention and deletion" },
  { id: "teacher-responsibilities", label: "Teacher responsibilities" },
];

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      title="Privacy, in plain language"
      description="ClassTrace is a small teacher-first beta. This page describes what the product handles today, what it deliberately does not collect, and where its privacy limits still are."
      sections={sections}
      lastUpdated="September 5, 2026"
    >
      <PublicNote>
        ClassTrace does not claim FERPA compliance, district approval, legal
        de-identification, or production safety. Your school or district may
        require its own review before you enter student information.
      </PublicNote>

      <PublicInfoSection id="what-we-handle" title="What ClassTrace handles">
        <p>To provide the beta, ClassTrace handles:</p>
        <ul>
          <li>
            account information from Clerk, including your account identifier,
            name, email address, and sign-in session;
          </li>
          <li>your teacher profile and personal workspace name;</li>
          <li>
            classes and roster entries you create, including student display
            names, mention handles, and optional school-local IDs;
          </li>
          <li>
            evidence notes, one optional validated photo per record, and the
            structured details you review and save; and
          </li>
          <li>
            basic record dates, archive state, and the relationships needed to
            keep each record inside your workspace.
          </li>
        </ul>
        <p>
          ClassTrace does not include advertising, analytics, session replay,
          audio, video, arbitrary file uploads, image analysis, or generative
          AI. It does not sell teacher or student information.
        </p>
      </PublicInfoSection>

      <PublicInfoSection
        id="drafts-and-evidence"
        title="Drafts and saved evidence are different"
      >
        <p>
          Before you capture, a note exists only in the page&apos;s local state.
          After capture, an unvalidated draft may remain in this browser&apos;s
          <strong> session storage</strong> until you validate it, delete it, or
          reach the next device-local midnight. A selected photo is normalized
          and stripped of embedded metadata on the device, then its encrypted
          bytes may be kept in IndexedDB using a key limited to the current
          browser-tab session. Closing the tab removes usable access to that
          key. Drafts are scoped to your workspace on that browser.
        </p>
        <p>
          Raw capture text is not stored in the ClassTrace database, reports,
          exports, timelines, analytics, or application logs. A permanent
          evidence record is created only after you review and approve the
          Evidence note or approve a photo. Photo bytes do not leave the device
          until you choose Approve and save. The reviewed note, optional
          structured fields, and validated photo are then saved to your
          workspace. If local browser storage is unavailable, the current
          preview may not survive a refresh.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="service-providers" title="Who else processes data">
        <p>
          ClassTrace relies on service providers to operate the beta. Clerk
          handles authentication and account sessions. Hosting and database
          providers process application requests and stored workspace data.
          Their own terms and operational retention may apply to information
          they process for ClassTrace.
        </p>
        <p>
          Sentry receives privacy-scrubbed application errors and sampled
          performance traces so the operator can diagnose failures. ClassTrace
          removes user identity, request contents, concrete URLs, cookies,
          headers, query parameters, teacher-entered text, and photo data before
          sending these events. Session replay and Sentry log shipping are
          disabled. Sentry may retain the resulting limited diagnostic data
          under its own settings.
        </p>
        <p>
          When you submit Help and Feedback, ClassTrace sends your selected
          category, description, reply email, limited diagnostic context, and
          account/workspace identifiers through Resend to the ClassTrace
          operator mailbox. The feedback text is not saved in the ClassTrace
          database, but Resend and the mailbox provider may retain it under
          their own settings. Do not include student information in a support
          message.
        </p>
      </PublicInfoSection>

      <PublicInfoSection
        id="retention-and-deletion"
        title="Retention and deletion"
      >
        <p>
          ClassTrace keeps saved workspace data until you permanently delete
          individual records or request deletion of the account. Deleting an
          evidence record also deletes its photo. Archived data
          remains stored until it is permanently deleted. The beta does not yet
          publish a separate inactivity-based retention schedule.
        </p>
        <p>
          A completed account-deletion request removes the ClassTrace teacher
          profile, workspace, classes, roster students, evidence records, and
          evidence photos,
          followed separately by the Clerk sign-in account. A narrow operator
          audit can remain after deletion. It records account identifiers,
          aggregate item counts, action outcome, and timestamps—not student
          names, evidence content, or raw notes. Copies may also remain in
          provider backups until those backups expire; the beta backup-retention
          process is still being finalized.
        </p>
        <PublicActionLink href={routes.dataDeletion}>
          Read the deletion request steps
        </PublicActionLink>
      </PublicInfoSection>

      <PublicInfoSection
        id="teacher-responsibilities"
        title="Your responsibilities as a teacher"
      >
        <p>
          Use ClassTrace only when you are authorized to enter the information.
          Follow your school&apos;s or district&apos;s rules, limit entries to
          what is needed for student evidence, and review every draft before
          saving. Before saving a photo, check the visible image for other
          students, names, or identifying classroom details; removing embedded
          metadata cannot remove information visible inside the picture. Do not
          use the product for emergencies or as the only copy of
          a record your role requires you to preserve elsewhere.
        </p>
        <PublicActionLink href={routes.support}>
          Ask a privacy or account question
        </PublicActionLink>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
