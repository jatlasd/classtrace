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
    "Where ClassTrace beta teachers can get help when they can or cannot sign in.",
};

const sections = [
  { id: "signed-in", label: "If you can sign in" },
  { id: "cannot-sign-in", label: "If you cannot sign in" },
];

export default function SupportPage() {
  return (
    <PublicInfoPage
      title="Support for the ClassTrace beta"
      description="Choose the support path that matches how you access ClassTrace."
      sections={sections}
      lastUpdated="July 21, 2026"
    >
      <PublicNote>
        Do not include student names, notes, screenshots, roster details, or
        other student information in a support message. ClassTrace support is
        not an emergency channel.
      </PublicNote>

      <PublicInfoSection id="signed-in" title="If you can sign in">
        <p>
          Open <strong>Account</strong> and use the{" "}
          <strong>Help and feedback</strong> form to report a problem, ask a
          question, share an idea, or make an account request.
        </p>
        <PublicActionLink href={routes.settings}>
          Open Help and feedback
        </PublicActionLink>
        <p>
          Looking to remove your workspace instead? Review what account
          deletion includes before sending that request.
        </p>
        <PublicActionLink href={routes.dataDeletion}>
          Review account deletion
        </PublicActionLink>
      </PublicInfoSection>

      <PublicInfoSection id="cannot-sign-in" title="If you cannot sign in">
        <p>
          Reply to your ClassTrace invitation or contact the person who invited
          you. They can route the issue to the operator without putting student
          information in a support message.
        </p>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
