import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime } from "@/lib/recurring";

async function canAccessSession(
  sessionUser: { id: string; role: string },
  sessionId: string
) {
  const record = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { teacher: true, student: true },
  });
  if (!record) return null;

  if (sessionUser.role === "ADMIN") return record;
  if (sessionUser.role === "TEACHER" && record.teacher.userId === sessionUser.id)
    return record;
  if (sessionUser.role === "PARENT" && record.student.userId === sessionUser.id)
    return record;

  return null;
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
  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const record = await canAccessSession(session.user, id);
  if (!record) {
    return NextResponse.json({ error: "未找到记录" }, { status: 404 });
  }

  const body = await req.json();
  const isTeacher = session.user.role === "TEACHER";
  const isAdmin = session.user.role === "ADMIN";

  const data: Record<string, unknown> = {};

  if (isTeacher || isAdmin) {
    if (body.feedback !== undefined) data.feedback = body.feedback || null;
    if (body.actualStartAt !== undefined) {
      data.actualStartAt = body.actualStartAt
        ? new Date(body.actualStartAt)
        : null;
    }
    if (body.actualEndAt !== undefined) {
      data.actualEndAt = body.actualEndAt ? new Date(body.actualEndAt) : null;
    }
  }

  if (isAdmin) {
    if (body.subject) data.subject = body.subject;
    if (body.durationMinutes !== undefined) {
      data.durationMinutes = parseInt(body.durationMinutes, 10) || 60;
    }
    if (body.notes !== undefined) data.notes = body.notes || null;
    if (body.date) {
      data.date = body.startTime
        ? combineDateAndTime(body.date, body.startTime)
        : new Date(body.date);
    }
  }

  const updated = await prisma.session.update({
    where: { id },
    data,
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      student: true,
    },
  });

  return NextResponse.json(updated);
}
