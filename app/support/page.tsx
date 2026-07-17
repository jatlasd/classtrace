import type { Metadata } from "next";
import {
  PublicActionLink,
  PublicInfoPage,
  PublicInfoSection,
  PublicNote,
} from "@/components/public/public-info-page";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Support — ClassTrace",
  description:
    "How controlled-beta teachers can get help, report a problem, or ask an account question in ClassTrace.",
};

const sections = [
  { id: "get-help", label: "Get help" },
  { id: "what-to-send", label: "What to send" },
  { id: "sign-in-problems", label: "Sign-in problems" },
  { id: "account-requests", label: "Account and data requests" },
];

export default function SupportPage() {
  return (
    <PublicInfoPage
      title="Support for the ClassTrace beta"
      description="Support is intentionally small and direct during the beta. Signed-in teachers can send a problem report, question, idea, or account request from their workspace."
      sections={sections}
      lastUpdated="July 14, 2026"
    >
      <PublicNote>
        Do not include student names, notes, screenshots, roster details, or
        other student information in a support message. ClassTrace support is
        not an emergency channel.
      </PublicNote>

      <PublicInfoSection id="get-help" title="Send a support request">
        <p>
          Sign in, open <strong>Account</strong>, and use the{" "}
          <strong>Help and feedback</strong> form. Choose the category that best
          fits the request and enter an email where you can receive a reply.
          The form sends the report to the ClassTrace operator; it does not
          publish the message or add it to your student records.
        </p>
        <PublicActionLink href={routes.settings}>
          Open Help and feedback
        </PublicActionLink>
      </PublicInfoSection>

      <PublicInfoSection id="what-to-send" title="What helps us investigate">
        <p>For a useful report, include:</p>
        <ul>
          <li>what you were trying to do;</li>
          <li>what happened instead;</li>
          <li>whether it happens again after retrying; and</li>
          <li>
            any ClassTrace error reference shown on the page, such as a code
            beginning with <strong>CT-S-</strong> or <strong>CT-C-</strong>.
          </li>
        </ul>
        <p>
          The form adds limited diagnostic context such as the current route,
          browser/device description, release, timestamp, and authenticated
          account/workspace identifiers. It does not attach student records,
          raw capture text, screenshots, request bodies, cookies, or error
          details.
        </p>
      </PublicInfoSection>

      <PublicInfoSection id="sign-in-problems" title="If you cannot sign in">
        <p>
          Retry from the ClassTrace sign-in page. If someone gave you beta
          access and sign-in still fails, reply to the invitation or contact
          that person so the operator can confirm the correct account without
          student information.
        </p>
        <PublicActionLink href={routes.signIn}>Go to sign in</PublicActionLink>
      </PublicInfoSection>

      <PublicInfoSection
        id="account-requests"
        title="Account and data requests"
      >
        <p>
          In Help and Feedback, choose <strong>Account or data request</strong>
          for privacy questions, access questions, or account deletion. A
          deletion request has a separate checklist so you can understand the
          scope before sending it.
        </p>
        <PublicActionLink href={routes.dataDeletion}>
          Review account deletion
        </PublicActionLink>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
