import type { Metadata } from "next";
import {
  PublicActionLink,
  PublicInfoPage,
  PublicInfoSection,
  PublicNote,
} from "@/components/public/public-info-page";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Beta terms — ClassTrace",
  description:
    "Plain-language terms for participating in the ClassTrace controlled beta.",
};

const sections = [
  { id: "beta-service", label: "The beta service" },
  { id: "appropriate-use", label: "Appropriate use" },
  { id: "teacher-review", label: "Teacher review" },
  { id: "availability", label: "Availability and changes" },
  { id: "ending-access", label: "Ending access" },
];

export default function TermsPage() {
  return (
    <PublicInfoPage
      title="ClassTrace beta terms"
      description="These plain-language terms set expectations for using an early ClassTrace beta. By creating or using an account, you agree to use the service within these limits."
      sections={sections}
      lastUpdated="July 14, 2026"
    >
      <PublicNote>
        ClassTrace is an early beta, not a district system of record. It is not
        represented as having completed an independent compliance review,
        received district approval, established legal de-identification, or
        completed the operational work needed for production use.
      </PublicNote>

      <PublicInfoSection id="beta-service" title="The beta service">
        <p>
          ClassTrace helps an individual teacher turn text notes into
          teacher-reviewed, student-specific evidence records. It is not a
          gradebook, SIS, IEP writer, parent communication system, emergency
          service, or official records repository.
        </p>
        <p>
          Beta access may be limited, changed, or ended while reliability,
          support, backups, and operating procedures are tested. Features and
          these terms may change. Material changes will be reflected by the
          date on this page.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="appropriate-use" title="Appropriate use">
        <p>You agree to:</p>
        <ul>
          <li>
            use ClassTrace only for information you are authorized to handle;
          </li>
          <li>
            follow the policies and approval requirements of your school,
            district, employer, and role;
          </li>
          <li>
            protect your account and avoid sharing access to your personal
            teacher workspace;
          </li>
          <li>
            avoid unlawful, harmful, abusive, or security-disrupting use; and
          </li>
          <li>
            avoid entering student information in Help and Feedback messages.
          </li>
        </ul>
      </PublicInfoSection>

      <PublicInfoSection
        id="teacher-review"
        title="Teacher review remains required"
      >
        <p>
          ClassTrace uses deterministic rules—not generative AI—to organize a
          captured note into a draft. A draft can be incomplete or wrong. You
          are responsible for checking the student match, Evidence note, and
          structured fields before saving.
        </p>
        <p>
          You remain responsible for professional decisions and for deciding
          whether a ClassTrace record is appropriate for any meeting, report,
          or other use. ClassTrace does not provide educational, legal, or
          compliance advice.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="availability" title="Availability and changes">
        <p>
          The beta is provided as available and may contain errors, lose
          availability, or change without a guaranteed service level. Keep any
          records your role requires in an approved system and do not rely on
          ClassTrace as the only copy of essential information.
        </p>
        <p>
          To the extent permitted by applicable law, ClassTrace is provided
          without warranties about uninterrupted availability, fitness for a
          particular purpose, or suitability for a school&apos;s compliance
          needs. Nothing on this page overrides rights that cannot legally be
          waived.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="ending-access" title="Ending access">
        <p>
          You may stop using ClassTrace and request account deletion. ClassTrace
          may suspend or end beta access for misuse, security risk, or when the
          beta changes or closes. ClassTrace may provide an export window before
          a planned closure, but teachers should not rely on that possibility as
          a backup.
        </p>
        <div className="flex flex-wrap gap-3">
          <PublicActionLink href={routes.dataDeletion}>
            Request account deletion
          </PublicActionLink>
          <PublicActionLink href={routes.privacy}>
            Read the privacy page
          </PublicActionLink>
        </div>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
