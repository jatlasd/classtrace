export const routes = {
  root: "/",
  app: "/app",
  feed: "/app/feed",
  roster: "/app/roster",
  studentsPrefix: "/app/students",
  student: (studentId: string): string => `/app/students/${studentId}`,
  settings: "/app/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export function isStudentProfilePath(pathname: string): boolean {
  return pathname.startsWith(`${routes.studentsPrefix}/`);
}
