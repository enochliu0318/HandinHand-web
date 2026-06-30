import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { sessions: true } },
      },
    });
    return NextResponse.json(teacher ? [teacher] : []);
  }

  const teachers = await prisma.teacher.findMany({
    where: published === "true" ? { isPublished: true } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, name, bio, subjects, isPublished } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "邮箱已存在" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const teacher = await prisma.teacher.create({
    data: {
      bio: bio || "",
      subjects: subjects || "",
      isPublished: isPublished ?? false,
      user: {
        create: { email, password: hashed, name, role: "TEACHER" },
      },
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(teacher, { status: 201 });
}
