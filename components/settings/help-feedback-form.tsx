"use client";

import { CircleAlert, Send, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { submitFeedbackAction } from "@/actions/feedback";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FEEDBACK_TYPE_LABELS,
  type FeedbackFieldErrors,
  type FeedbackType,
} from "@/lib/feedback/feedback-contract";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type HelpFeedbackFormProps = {
  initialReplyEmail: string;
  initialErrorReference: string | null;
};

type FormMessage = {
  tone: "error" | "success";
  text: string;
};

const TYPE_OPTIONS = Object.entries(FEEDBACK_TYPE_LABELS) as Array<
  [FeedbackType, (typeof FEEDBACK_TYPE_LABELS)[FeedbackType]]
>;

const FEEDBACK_INPUT_CLASS_NAME = `${ROSTER_INPUT_CLASS_NAME} aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`;

export function HelpFeedbackForm({
  initialReplyEmail,
  initialErrorReference,
}: HelpFeedbackFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [type, setType] = useState<FeedbackType | "">(
    initialErrorReference ? "BROKE" : ""
  );
  const [description, setDescription] = useState("");
  const [replyEmail, setReplyEmail] = useState(initialReplyEmail);
  const [errorReference, setErrorReference] = useState(
    initialErrorReference
  );
  const [fieldErrors, setFieldErrors] = useState<FeedbackFieldErrors>({});
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, startTransition] = useTransition();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message?.tone === "error") {
      errorSummaryRef.current?.focus();
    }
  }, [message]);

  function clearFieldError(field: keyof FeedbackFieldErrors): void {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPending) return;

    setFieldErrors({});
    setMessage(null);

    const browserAndDevice =
      typeof navigator === "undefined" || !navigator.userAgent.trim()
        ? "Unavailable"
        : navigator.userAgent;

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof submitFeedbackAction>>;
      try {
        result = await submitFeedbackAction({
          type,
          description,
          replyEmail,
          currentRoute: pathname,
          browserAndDevice,
          ...(errorReference ? { errorReference } : {}),
        });
      } catch {
        setMessage({
          tone: "error",
          text: "Feedback is not available right now. Try again.",
        });
        return;
      }

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage({ tone: "error", text: result.error });
        return;
      }

      setType("");
      setDescription("");
      if (errorReference) {
        setErrorReference(null);
        router.replace(routes.settings, { scroll: false });
      }
      setMessage({
        tone: "success",
        text: "Feedback sent. Thank you for helping improve ClassTrace.",
      });
    });
  }

  const typeErrorId = fieldErrors.type ? "feedback-type-error" : undefined;
  const descriptionErrorId = fieldErrors.description
    ? "feedback-description-error"
    : undefined;
  const replyEmailErrorId = fieldErrors.replyEmail
    ? "feedback-reply-email-error"
    : undefined;

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="feedback-type"
            className="text-sm font-medium text-foreground"
          >
            What can we help with?
          </label>
          <select
            id="feedback-type"
            name="feedbackType"
            value={type}
            onChange={(event) => {
              setType(event.target.value as FeedbackType | "");
              clearFieldError("type");
            }}
            className={FEEDBACK_INPUT_CLASS_NAME}
            aria-invalid={Boolean(fieldErrors.type)}
            aria-describedby={typeErrorId}
            disabled={isPending}
            required
          >
            <option value="">Choose one</option>
            {TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {fieldErrors.type ? (
            <p id="feedback-type-error" className="text-sm text-destructive">
              {fieldErrors.type}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="feedback-reply-email"
            className="text-sm font-medium text-foreground"
          >
            Reply email
          </label>
          <input
            id="feedback-reply-email"
            name="replyEmail"
            type="email"
            autoComplete="email"
            value={replyEmail}
            onChange={(event) => {
              setReplyEmail(event.target.value);
              clearFieldError("replyEmail");
            }}
            className={FEEDBACK_INPUT_CLASS_NAME}
            aria-invalid={Boolean(fieldErrors.replyEmail)}
            aria-describedby={replyEmailErrorId}
            maxLength={INPUT_LIMITS.accountEmail}
            disabled={isPending}
            required
          />
          {fieldErrors.replyEmail ? (
            <p
              id="feedback-reply-email-error"
              className="text-sm text-destructive"
            >
              {fieldErrors.replyEmail}
            </p>
          ) : null}
        </div>
      </div>

      {errorReference ? (
        <div className="border-y border-border/70 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CircleAlert className="size-3.5 text-destructive" aria-hidden="true" />
            Attached error reference
          </p>
          <code className="mt-1 block select-all break-all font-mono text-sm font-semibold text-foreground">
            {errorReference}
          </code>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This reference will be included with your report so it can be
            matched to the server logs.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="feedback-description"
          className="text-sm font-medium text-foreground"
        >
          Description
        </label>
        <Textarea
          id="feedback-description"
          name="description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            clearFieldError("description");
          }}
          className="min-h-32 resize-y"
          placeholder="What happened, and what were you trying to do?"
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={[
            "feedback-privacy-guidance",
            descriptionErrorId,
          ]
            .filter(Boolean)
            .join(" ")}
          maxLength={INPUT_LIMITS.feedbackDescription}
          disabled={isPending}
          required
        />
        {fieldErrors.description ? (
          <p
            id="feedback-description-error"
            className="text-sm text-destructive"
          >
            {fieldErrors.description}
          </p>
        ) : null}
        <p
          id="feedback-privacy-guidance"
          className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
        >
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0 text-validated-foreground"
            aria-hidden="true"
          />
          <span>
            Please do not include student names, evidence notes, or other
            student information.
          </span>
        </p>
      </div>

      {message ? (
        <div
          ref={message.tone === "error" ? errorSummaryRef : undefined}
          role={message.tone === "error" ? "alert" : "status"}
          tabIndex={message.tone === "error" ? -1 : undefined}
          className={
            message.tone === "error"
              ? "border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              : "border border-validated/30 bg-validated/10 px-3 py-2 text-sm text-foreground"
          }
        >
          {message.text}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-10 px-4 font-semibold"
        disabled={isPending}
      >
        <Send aria-hidden="true" />
        {isPending ? "Sending feedback…" : "Send feedback"}
      </Button>
    </form>
  );
}
