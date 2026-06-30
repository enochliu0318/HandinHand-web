import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  if (session.user.role === "TEACHER") {
    const students = await prisma.student.findMany({
      select: { id: true, name: true, grade: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(students);
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const body = await req.json();
  const { name, parentName, parentPhone, grade, email, password } = body;

  if (!name || !parentName) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  let userCreate = undefined;
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "邮箱已存在" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    userCreate = {
      create: { email, password: hashed, name: parentName, role: "PARENT" as const },
    };
  }

  const student = await prisma.student.create({
    data: {
      name,
      parentName,
      parentPhone: parentPhone || null,
      grade: grade || null,
      user: userCreate,
    },
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json(student, { status: 201 });
}
