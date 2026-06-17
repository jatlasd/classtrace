"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  exportStudentEvidence,
  type ExportStudentEvidenceActionResult,
} from "@/actions/evidence";
import { Button } from "@/components/ui/button";

type ExportStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; recordCount: number }
  | { state: "error"; message: string };

type StudentEvidenceExportActionProps = {
  studentId: string;
  studentName: string;
  evidenceCount: number;
};

function downloadCsv(result: Extract<ExportStudentEvidenceActionResult, { success: true }>): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = result.filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function statusMessage(status: ExportStatus): string {
  if (status.state === "pending") {
    return "Preparing CSV...";
  }

  if (status.state === "success") {
    return status.recordCount === 1
      ? "CSV ready with 1 record."
      : `CSV ready with ${status.recordCount} records.`;
  }

  if (status.state === "error") {
    return status.message;
  }

  return "";
}

export function StudentEvidenceExportAction({
  studentId,
  studentName,
  evidenceCount,
}: StudentEvidenceExportActionProps) {
  const [status, setStatus] = useState<ExportStatus>({ state: "idle" });
  const hasEvidence = evidenceCount > 0;
  const message = hasEvidence
    ? statusMessage(status)
    : "No validated evidence to export yet.";

  async function handleExport(): Promise<void> {
    if (!hasEvidence || status.state === "pending") {
      return;
    }

    setStatus({ state: "pending" });
    const result = await exportStudentEvidence({ studentId });

    if (!result.success) {
      setStatus({ state: "error", message: result.error });
      return;
    }

    downloadCsv(result);
    setStatus({ state: "success", recordCount: result.recordCount });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={!hasEvidence || status.state === "pending"}
        aria-label={`Export ${studentName} evidence as CSV`}
      >
        <Download className="size-3.5" aria-hidden="true" />
        {status.state === "pending" ? "Preparing CSV" : "Export evidence"}
      </Button>
      <p
        className={`min-h-4 text-xs leading-relaxed ${
          status.state === "error" ? "text-destructive" : "text-muted-foreground"
        }`}
        role={status.state === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}
