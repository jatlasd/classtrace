import Link from "next/link";
import type { ReactElement } from "react";
import { StudentReportPage } from "@/components/students/student-report-page";
import { Button } from "@/components/ui/button";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  getStudentReportRecordsForWorkspace,
  parseStudentReportDateRange,
} from "@/lib/evidence/student-report-records";
import { routes } from "@/lib/routes";

type StudentReportRouteProps = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{
    start?: string | string[];
    end?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function StudentReportRoute({
  params,
  searchParams,
}: StudentReportRouteProps): Promise<ReactElement> {
  const { studentId } = await params;
  const query = await searchParams;
  const workspace = await getCurrentWorkspace();
  const dateRange = parseStudentReportDateRange({
    start: firstSearchParam(query.start),
    end: firstSearchParam(query.end),
  });

  const report = await getStudentReportRecordsForWorkspace(
    workspace.workspaceId,
    studentId,
    dateRange
  );

  if (!report) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-7 sm:px-6 lg:px-8">
        <section className="border border-border bg-card/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student report
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            Student not found on your roster.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Choose an active roster student before opening a report.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={routes.roster}>Back to roster</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <StudentReportPage
      student={report.student}
      evidenceRecords={report.evidenceRecords}
      dateRange={report.dateRange}
    />
  );
}
