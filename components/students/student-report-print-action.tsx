"use client";

import type { ReactElement } from "react";
import { Printer } from "lucide-react";
import { useStudentReportUnappliedFilters } from "@/components/students/student-report-filters";
import { Button } from "@/components/ui/button";

export function StudentReportPrintAction(): ReactElement {
  const unapplied = useStudentReportUnappliedFilters();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={unapplied}
      onClick={() => window.print()}
    >
      <Printer className="size-3.5" strokeWidth={1.75} />
      Print / Save as PDF
    </Button>
  );
}
