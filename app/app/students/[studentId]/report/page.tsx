import Link from "next/link";
import type { ReactElement } from "react";
import { StudentReportPage } from "@/components/students/student-report-page";
import { Button } from "@/components/ui/button";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import { getStudentReportRecordsForWorkspace } from "@/lib/evidence/student-report-records";
import {
  parseStudentTimelineSearchParams,
  type StudentTimelineRawSearchParams,
} from "@/lib/evidence/student-timeline-query";
import { routes } from "@/lib/routes";

type StudentReportRouteProps = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<StudentTimelineRawSearchParams>;
};

export default async function StudentReportRoute({
  params,
  searchParams,
}: StudentReportRouteProps): Promise<ReactElement> {
  const { studentId } = await params;
  const workspace = await getCurrentAppWorkspace();
  const { input, dateError } = parseStudentTimelineSearchParams(
    await searchParams
  );
  const report = await getStudentReportRecordsForWorkspace(
    workspace.workspaceId,
    studentId,
    input
  );

  if (!report) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-7 sm:px-6 lg:px-8">
        <section className="plate p-6">
          <h1 className="font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
            Student not found on your roster.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">
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
      totalEvidenceCount={report.totalEvidenceCount}
      options={report.options}
      filters={input}
      dateError={dateError}
    />
  );
}
