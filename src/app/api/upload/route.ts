import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as "resume" | "photo" | null;
  const teacherId = formData.get("teacherId") as string | null;

  if (!file || !type || !teacherId) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return NextResponse.json({ error: "未找到老师" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner =
    session.user.role === "TEACHER" && teacher.userId === session.user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const subdir = type === "resume" ? "resumes" : "photos";
  const url = await saveUpload(file, subdir);

  const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data: type === "resume" ? { resumeUrl: url } : { photoUrl: url },
  });

  return NextResponse.json({ url, teacher: updated });
}
