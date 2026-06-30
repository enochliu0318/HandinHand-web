import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherShell } from "@/components/teacher-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") redirect("/login");

  return <TeacherShell user={session.user}>{children}</TeacherShell>;
}
