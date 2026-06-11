import { NoteContent } from "@/components/dashboard/note-content";
import type {
  Confidence,
  MatchResult,
  NoteDraft,
} from "@/lib/note-processing/types";

export function ParsedNoteCard({ draft }: { draft: NoteDraft }) {
  const { parsed } = draft;
  const applicable = new Set(draft.applicableFields);

  return (
    <article className="rounded-card border border-border bg-card shadow-paper">
      <div className="space-y-4 p-4">
        {draft.needsTeacherValidation && (
          <p className="rounded-lg border border-accent/50 bg-accent/25 px-3 py-2 text-xs font-medium text-foreground">
            Needs teacher validation
          </p>
        )}

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Raw note
          </p>
          <NoteContent text={parsed.rawNote} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ParsedField label="Mentions" values={parsed.mentions} empty="None" />
          <ParsedField label="Tags" values={parsed.tags} empty="None" />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Clean text
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {parsed.cleanText || "—"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MatchField label="Note type" match={draft.noteType} />
          <MatchField label="Domain" match={draft.domain} />
          {applicable.has("skill") && (
            <MatchField label="Skill" match={draft.skill} />
          )}
          {applicable.has("performance") && (
            <MatchField label="Performance" match={draft.performance} />
          )}
          {applicable.has("context") && (
            <MatchField label="Context" match={draft.context} />
          )}
          {applicable.has("communication") && (
            <MatchField label="Communication" match={draft.communication} />
          )}
          {applicable.has("severity") && (
            <MatchField label="Severity" match={draft.severity} />
          )}
          {applicable.has("evidenceQuality") && (
            <MatchField
              label="Evidence quality"
              match={draft.evidenceQuality}
            />
          )}
        </div>

        {applicable.has("supports") && (
          <MatchListField label="Supports" matches={draft.supports} />
        )}
        {applicable.has("behavior") && (
          <MatchListField label="Behavior" matches={draft.behavior} />
        )}

        {draft.suggestedFollowUps.length > 0 && (
          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested follow-ups
            </p>
            <ul className="space-y-1">
              {draft.suggestedFollowUps.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function formatValue(value: string): string {
  if (value === "unclear") return "Unclear";
  return value.replace(/_/g, " ");
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const styles: Record<Confidence, string> = {
    high: "border-validated/60 bg-validated text-validated-foreground",
    medium: "border-link/30 bg-secondary text-link",
    low: "border-border bg-muted/60 text-muted-foreground",
  };

  return (
    <span
      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[confidence]}`}
    >
      {confidence}
    </span>
  );
}

function MatchField({ label, match }: { label: string; match: MatchResult }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium capitalize text-foreground">
          {formatValue(match.value)}
        </span>
        <ConfidenceBadge confidence={match.confidence} />
      </div>
    </div>
  );
}

function MatchListField({
  label,
  matches,
}: {
  label: string;
  matches: MatchResult[];
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {matches.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {matches.map((match) => (
            <span
              key={match.value}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium capitalize text-foreground"
            >
              {formatValue(match.value)}
              <ConfidenceBadge confidence={match.confidence} />
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">None</p>
      )}
    </div>
  );
}

function ParsedField({
  label,
  values,
  empty,
}: {
  label: string;
  values: string[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-link"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
