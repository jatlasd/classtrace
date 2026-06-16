import { formatTagLabel } from "@/lib/format-tag";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { CheckCircle2, Circle } from "lucide-react";

type SavedEvidenceRowProps = {
  record: EvidenceFeedRecord;
};

function formatEvidenceDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "tag" | "evidence";
}) {
  const className =
    variant === "tag"
      ? "border-border bg-muted/60 text-link"
      : variant === "evidence"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-card text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function SavedEvidenceRow({ record }: SavedEvidenceRowProps) {
  return (
    <article className="border-b border-border last:border-b-0">
      <div className="grid gap-4 px-4 py-5 md:grid-cols-[72px_88px_minmax(0,1fr)_220px] md:px-6">
        <div className="flex items-start gap-3 md:block">
          <span className="flex size-11 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
            <CheckCircle2 className="size-5" strokeWidth={1.75} />
          </span>
          <div className="md:hidden">
            <p className="text-xs text-muted-foreground">
              {formatEvidenceDate(record.evidenceDate)}
            </p>
            <span className="inline-flex items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
              <Circle className="size-2 fill-current" />
              Validated
            </span>
          </div>
        </div>

        <div className="hidden text-sm leading-relaxed text-muted-foreground md:block">
          <p>{formatEvidenceDate(record.evidenceDate)}</p>
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {record.studentDisplayName}
              {record.classGroupName ? (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  - {record.classGroupName}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground">
              {record.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {record.topic ? <Chip>{record.topic}</Chip> : null}
            {record.performance ? <Chip>{record.performance}</Chip> : null}
            {record.behavior ? <Chip>{record.behavior}</Chip> : null}
            <Chip variant="evidence">{record.evidenceType}</Chip>
            {record.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                {formatTagLabel(tag)}
              </Chip>
            ))}
          </div>

          {record.followUpNotes ? (
            <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Follow-up:</span>{" "}
              {record.followUpNotes}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 md:border-l md:border-border md:pl-6">
          <span className="inline-flex items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Saved evidence record
          </p>
        </div>
      </div>
    </article>
  );
}
