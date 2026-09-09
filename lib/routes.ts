export const routes = {
  root: "/",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
  dataDeletion: "/data-deletion",
  betaAcknowledgements: "/beta-acknowledgements",
  app: "/app",
  feed: "/app/feed",
  explore: "/app/explore",
  roster: "/app/roster",
  studentsPrefix: "/app/students",
  student: (studentId: string): string => `/app/students/${studentId}`,
  studentReport: (studentId: string): string =>
    `/app/students/${studentId}/report`,
  evidencePhoto: (evidenceId: string): string =>
    `/app/evidence/${evidenceId}/photo`,
  settings: "/app/settings",
  operator: "/operator",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export function isStudentProfilePath(pathname: string): boolean {
  return pathname.startsWith(`${routes.studentsPrefix}/`);
}
