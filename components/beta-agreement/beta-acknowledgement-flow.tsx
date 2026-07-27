"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  acceptCurrentBetaAgreementAction,
  type AcceptCurrentBetaAgreementActionInput,
  type AcceptCurrentBetaAgreementActionResult,
} from "@/actions/beta-agreement";
import { Button } from "@/components/ui/button";
import {
  type BetaAgreementStepId,
} from "@/lib/beta-agreement/beta-agreement-steps";
import { routes } from "@/lib/routes";

type AgreementStep = {
  id: BetaAgreementStepId;
  title: string;
  content: ReactNode;
  checkboxLabel: string;
  actionLabel: string;
};

const agreementSteps: readonly AgreementStep[] = [
  {
    id: "independent-project",
    title: "This is an independent project",
    content: (
      <>
        <p>ClassTrace is something I built independently.</p>
        <p>
          It is not run by, connected to, endorsed by, or approved by your
          school, district, employer, or any government agency.
        </p>
      </>
    ),
    checkboxLabel:
      "I understand that ClassTrace is an independent project and is not affiliated with my school or district.",
    actionLabel: "Continue",
  },
  {
    id: "invitation-not-approval",
    title: "An invitation is not district approval",
    content: (
      <>
        <p>
          Being invited to test ClassTrace does not mean your school or district
          has approved it.
        </p>
        <p>
          You are still responsible for following your employer’s rules about
          what tools you can use and what information you can enter into them.
        </p>
      </>
    ),
    checkboxLabel:
      "I understand that being invited to ClassTrace does not mean my school or district has approved it.",
    actionLabel: "Continue",
  },
  {
    id: "fictional-student-information",
    title: "Please do not use real student information",
    content: (
      <>
        <p>For this beta, use made-up students and made-up information only.</p>
        <p>
          Do not enter real names, initials, student IDs, dates of birth,
          disability information, behavior details, academic records, or
          anything else that could identify a real student.
        </p>
      </>
    ),
    checkboxLabel:
      "I agree to use only fictional or synthetic student information during this beta.",
    actionLabel: "Continue",
  },
  {
    id: "early-beta",
    title: "Things may break",
    content: (
      <>
        <p>ClassTrace is still being tested.</p>
        <p>
          Features may change. Information may not save correctly. The site may
          go down. Bugs may happen.
        </p>
        <p>
          This beta has not been reviewed or approved as an enterprise or
          district system for storing sensitive student information.
        </p>
      </>
    ),
    checkboxLabel:
      "I understand that ClassTrace is an early beta and may not always work as expected.",
    actionLabel: "Continue",
  },
  {
    id: "not-system-of-record",
    title: "This is not an official school record system",
    content: (
      <>
        <p>
          ClassTrace is not a gradebook, student information system, IEP
          platform, emergency service, or official records repository.
        </p>
        <p>
          Do not use it as the only place you keep anything your job requires
          you to document or preserve.
        </p>
      </>
    ),
    checkboxLabel:
      "I understand that ClassTrace is not an official system of record.",
    actionLabel: "Continue",
  },
  {
    id: "final-agreement",
    title: "Final agreement",
    content: (
      <>
        <p>By entering the beta, I confirm that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>I understand the points above.</li>
          <li>I will use only fictional or synthetic student information.</li>
          <li>
            I agree to the{" "}
            <Link
              href={routes.terms}
              className="font-medium text-link underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              ClassTrace Beta Terms
            </Link>
            .
          </li>
          <li>
            I acknowledge the{" "}
            <Link
              href={routes.privacy}
              className="font-medium text-link underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              ClassTrace Privacy Notice
            </Link>
            .
          </li>
          <li>
            I understand that access may be changed or ended while the beta is
            being tested.
          </li>
        </ul>
      </>
    ),
    checkboxLabel:
      "I agree and understand the limits of the ClassTrace beta.",
    actionLabel: "Agree and enter ClassTrace",
  },
] as const;

type AcceptanceAction = (
  input: AcceptCurrentBetaAgreementActionInput
) => Promise<AcceptCurrentBetaAgreementActionResult>;

type BetaAcknowledgementFlowProps = {
  acceptanceAction?: AcceptanceAction;
};

export function BetaAcknowledgementFlow({
  acceptanceAction = acceptCurrentBetaAgreementAction,
}: BetaAcknowledgementFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [acknowledgedStepIds, setAcknowledgedStepIds] = useState<
    BetaAgreementStepId[]
  >([]);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const currentStep = agreementSteps[currentStepIndex];
  const isFinalStep = currentStepIndex === agreementSteps.length - 1;

  useEffect(() => {
    if (currentStepIndex > 0) {
      headingRef.current?.focus();
    }
  }, [currentStepIndex]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  function continueFlow() {
    if (!isChecked || isPending) {
      return;
    }

    const nextAcknowledgedStepIds = [
      ...acknowledgedStepIds,
      currentStep.id,
    ];

    if (!isFinalStep) {
      setAcknowledgedStepIds(nextAcknowledgedStepIds);
      setCurrentStepIndex((index) => index + 1);
      setIsChecked(false);
      setError("");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await acceptanceAction({
        acknowledgedStepIds: nextAcknowledgedStepIds,
      });

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <section
      aria-labelledby="beta-agreement-heading"
      className="overflow-hidden rounded-card border border-border bg-card shadow-paper"
    >
      <header className="border-b border-border px-5 py-5 sm:px-7 sm:py-6">
        <h1
          id="beta-agreement-heading"
          className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Before you get started
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          ClassTrace is still in a very early, limited beta. Before you enter, I
          need to make sure a few things are completely clear.
        </p>
      </header>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl font-semibold leading-snug text-foreground outline-none sm:text-2xl"
        >
          {currentStepIndex + 1} of {agreementSteps.length}: {currentStep.title}
        </h2>

        <div className="mt-4 space-y-3 text-[15px] leading-7 text-muted-foreground">
          {currentStep.content}
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 border-y border-border bg-muted/25 px-3 py-4 text-sm font-medium leading-6 text-foreground sm:px-4">
          <input
            type="checkbox"
            checked={isChecked}
            disabled={isPending}
            onChange={(event) => setIsChecked(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 rounded border-border accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed"
          />
          <span>{currentStep.checkboxLabel}</span>
        </label>

        {error ? (
          <div
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="mt-4 border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-destructive/20"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            size="lg"
            disabled={!isChecked || isPending}
            onClick={continueFlow}
            className="min-h-11 px-5"
          >
            {isPending ? "Saving…" : currentStep.actionLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
