"use client";

import type { ReactElement } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentReportPrintAction(): ReactElement {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-lg px-4"
      onClick={() => window.print()}
    >
      <Printer className="size-3.5" strokeWidth={1.75} />
      Print / Save as PDF
    </Button>
  );
}
