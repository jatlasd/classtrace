import { AppShellNavigation } from "@/components/dashboard/app-shell-navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClassTraceClerkProvider } from "@/components/auth/class-trace-clerk-provider";
import { StudentQuickJumpProvider } from "@/components/students/student-quick-jump";
import { getCurrentAppWorkspace } from "@/lib/auth/get-current-workspace";
import { listActiveRosterStudentsForWorkspace } from "@/lib/students/roster-students";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const workspace = await getCurrentAppWorkspace();
  const students = await listActiveRosterStudentsForWorkspace(
    workspace.workspaceId
  );
  const quickJumpStudents = students
    .filter(
      (student): student is typeof student & { classGroupName: string } =>
        student.hasActiveClass && student.classGroupName !== null
    )
    .map((student) => ({
      id: student.id,
      displayName: student.displayName,
      mentionHandle: student.mentionHandle,
      classGroupName: student.classGroupName,
      schoolLocalId: student.schoolLocalId,
    }));

  return (
    <ClassTraceClerkProvider>
      <StudentQuickJumpProvider students={quickJumpStudents}>
        <div className="authenticated-app flex min-h-dvh flex-col bg-base">
          <a
            href="#main-content"
            className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-live-bright px-4 py-2 text-sm font-semibold text-live-fg transition-transform focus:translate-y-0"
          >
            Skip to main content
          </a>
          <AppShellNavigation />
          <div className="app-shell-workspace flex min-h-0 flex-1 flex-col">
            <main
              id="main-content"
              tabIndex={-1}
              className="min-w-0 flex-1 outline-none"
            >
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
      </StudentQuickJumpProvider>
    </ClassTraceClerkProvider>
  );
}
