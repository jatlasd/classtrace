import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

type StudentProfilePageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { studentId } = await params;

  redirect(routes.student(studentId));
}
