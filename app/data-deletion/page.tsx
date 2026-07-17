import type { Metadata } from "next";
import {
  PublicActionLink,
  PublicInfoPage,
  PublicInfoSection,
  PublicNote,
} from "@/components/public/public-info-page";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Account deletion — ClassTrace",
  description:
    "How to request deletion of a ClassTrace teacher account and its workspace data.",
};

const sections = [
  { id: "before-requesting", label: "Before requesting" },
  { id: "how-to-request", label: "How to request" },
  { id: "what-is-deleted", label: "What is deleted" },
  { id: "what-may-remain", label: "What may remain" },
];

export default function DataDeletionPage() {
  return (
    <PublicInfoPage
      title="Request account deletion"
      description="You can ask ClassTrace to delete your teacher account and the personal workspace connected to it. Review the scope and export anything you need before sending the request."
      sections={sections}
      lastUpdated="July 14, 2026"
    >
      <PublicNote>
        Account deletion is permanent. It removes the full workspace, not one
        selected student or evidence record, and cannot be undone through
        ClassTrace.
      </PublicNote>

      <PublicInfoSection
        id="before-requesting"
        title="Before you request deletion"
      >
        <p>
          Export any student evidence you are authorized and required to keep.
          ClassTrace provides a one-student CSV export and printable student
          report. Store exports only in a location approved for that
          information.
        </p>
        <p>
          If you only need to remove one evidence record, student, or class, use
          the archive and permanent-delete controls inside your workspace
          instead of requesting full account deletion.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="how-to-request" title="How to send the request">
        <ol className="space-y-3 pl-5 [counter-reset:steps]">
          <li className="[counter-increment:steps] before:mr-3 before:font-mono before:text-xs before:text-foreground before:content-[counter(steps,decimal-leading-zero)]">
            Sign in to the ClassTrace account you want deleted.
          </li>
          <li className="[counter-increment:steps] before:mr-3 before:font-mono before:text-xs before:text-foreground before:content-[counter(steps,decimal-leading-zero)]">
            Open Account, then find Help and feedback.
          </li>
          <li className="[counter-increment:steps] before:mr-3 before:font-mono before:text-xs before:text-foreground before:content-[counter(steps,decimal-leading-zero)]">
            Choose <strong>Account or data request</strong>.
          </li>
          <li className="[counter-increment:steps] before:mr-3 before:font-mono before:text-xs before:text-foreground before:content-[counter(steps,decimal-leading-zero)]">
            Write <strong>Delete my ClassTrace account</strong>, provide a reply
            email, and do not include student information.
          </li>
        </ol>
        <p>
          The authenticated form attaches the account and workspace identifiers
          needed to locate the correct data. The operator may reply to confirm
          the scope or resolve an account mismatch before performing the
          deletion.
        </p>
        <PublicActionLink href={routes.settings}>
          Open the account request form
        </PublicActionLink>
      </PublicInfoSection>

      <PublicInfoSection id="what-is-deleted" title="What the operator deletes">
        <p>A completed full-account request removes:</p>
        <ul>
          <li>the ClassTrace teacher profile and personal workspace;</li>
          <li>classes and roster students in that workspace;</li>
          <li>saved and archived evidence records; and</li>
          <li>the separate Clerk sign-in account.</li>
        </ul>
        <p>
          The ClassTrace workspace and Clerk account are deleted as separate
          confirmed actions so a partial failure can be seen and safely retried.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="what-may-remain" title="What may remain after deletion">
        <p>
          A narrow operator audit remains so ClassTrace can show that a deletion
          action occurred. It contains the account identifiers used for the
          operation, aggregate class/student/evidence counts, outcome, and
          timestamps. It does not contain student names, evidence content, or
          raw notes.
        </p>
        <p>
          A support request may remain in Resend and the operator mailbox under
          those providers&apos; settings. Deleted database records may remain in
          backups until the backups expire. The beta&apos;s backup-retention and
          recovery process is still being finalized and is not represented as
          a completed production policy.
        </p>
        <PublicActionLink href={routes.privacy}>
          Read the full privacy page
        </PublicActionLink>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
