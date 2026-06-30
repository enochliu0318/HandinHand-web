import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, validateUpload } from "@/lib/upload";
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

  const validationError = validateUpload(file, type);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const subdir = type === "resume" ? "resumes" : "photos";
    const url = await saveUpload(file, subdir);

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: type === "resume" ? { resumeUrl: url } : { photoUrl: url },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ url, teacher: updated });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "文件保存失败" }, { status: 500 });
  }
}
