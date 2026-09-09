import Link from "next/link";
import type { ReactElement } from "react";
import { StudentTimelinePage } from "@/components/students/student-timeline-page";
import { Button } from "@/components/ui/button";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import { getStudentTimelineRecordsForWorkspace } from "@/lib/evidence/student-timeline-records";
import { routes } from "@/lib/routes";

type StudentProfilePageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps): Promise<ReactElement> {
  const { studentId } = await params;
  const workspace = await getCurrentAppWorkspace();
  const timeline = await getStudentTimelineRecordsForWorkspace(
    workspace.workspaceId,
    studentId
  );

  if (!timeline) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-7 sm:px-6 lg:px-8">
        <section className="plate p-6">
          <p className="label text-fg-3">
            Student timeline
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.01em] text-fg">
            Student not found on your roster.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">
            Choose an active roster student before opening a timeline.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={routes.roster}>Back to roster</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <StudentTimelinePage
      student={timeline.student}
      evidenceRecords={timeline.evidenceRecords}
    />
  );
}
