import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ParentShell } from "@/components/parent-shell";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "PARENT") redirect("/login");

  return <ParentShell user={session.user}>{children}</ParentShell>;
}
