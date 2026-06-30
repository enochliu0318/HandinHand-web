import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      sessions: {
        include: { student: true },
        orderBy: { date: "desc" },
        take: 10,
      },
      _count: { select: { sessions: true } },
    },
  });

  if (!teacher) return NextResponse.json({ error: "未找到" }, { status: 404 });
  return NextResponse.json(teacher);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!teacher) return NextResponse.json({ error: "未找到" }, { status: 404 });

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner =
    session?.user?.role === "TEACHER" && teacher.userId === session.user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const body = await req.json();
  const { bio, subjects, isPublished, name, password } = body;

  const updateData: Record<string, unknown> = {};
  if (bio !== undefined) updateData.bio = bio;
  if (subjects !== undefined) updateData.subjects = subjects;
  if (isAdmin && isPublished !== undefined) updateData.isPublished = isPublished;

  const userUpdate: Record<string, string> = {};
  if (name) userUpdate.name = name;
  if (password) userUpdate.password = await bcrypt.hash(password, 10);

  const updated = await prisma.teacher.update({
    where: { id },
    data: {
      ...updateData,
      ...(Object.keys(userUpdate).length > 0 && { user: { update: userUpdate } }),
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "未找到" }, { status: 404 });

  await prisma.user.delete({ where: { id: teacher.userId } });
  return NextResponse.json({ success: true });
}
