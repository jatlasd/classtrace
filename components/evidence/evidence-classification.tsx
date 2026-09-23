import type { LucideIcon } from "lucide-react";
import {
  BookCheck,
  CircleDot,
  ClipboardCheck,
  Eye,
  MessageSquare,
  SlidersHorizontal,
  Tag,
  TrendingUp,
} from "lucide-react";
import {
  getSavedEvidenceClassificationByLabel,
  type SavedEvidenceClassificationLabel,
} from "@/lib/evidence/evidence-classifications";

const CLASSIFICATION_ICONS: Record<
  SavedEvidenceClassificationLabel,
  LucideIcon
> = {
  "Academic check-in": BookCheck,
  "Behavior observation": Eye,
  "Communication log": MessageSquare,
  "Accommodation log": SlidersHorizontal,
  "Assessment observation": ClipboardCheck,
  "Progress monitoring": TrendingUp,
  "General observation": CircleDot,
};

export function EvidenceClassification({ label }: { label: string }) {
  const savedClassification = getSavedEvidenceClassificationByLabel(label);
  const Icon = savedClassification
    ? CLASSIFICATION_ICONS[savedClassification.label]
    : Tag;

  return (
    <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-line px-2 py-px font-mono text-[0.75rem] leading-5 text-fg-2">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-3.5 shrink-0"
        strokeWidth={1.8}
      />
      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
        <span className="sr-only">Evidence type: </span>
        {label}
      </span>
    </span>
  );
}
