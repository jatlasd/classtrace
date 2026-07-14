export const routes = {
  root: "/",
  app: "/app",
  feed: "/app/feed",
  roster: "/app/roster",
  studentsPrefix: "/app/students",
  student: (studentId: string): string => `/app/students/${studentId}`,
  studentReport: (studentId: string): string =>
    `/app/students/${studentId}/report`,
  settings: "/app/settings",
  operator: "/operator",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export function isStudentProfilePath(pathname: string): boolean {
  return pathname.startsWith(`${routes.studentsPrefix}/`);
}
