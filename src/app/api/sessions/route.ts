import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime } from "@/lib/recurring";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  const studentId = searchParams.get("studentId");

  const where: Record<string, string> = {};

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher) return NextResponse.json([]);
    where.teacherId = teacher.id;
  } else if (session.user.role === "PARENT") {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json([]);
    where.studentId = student.id;
  } else if (session.user.role === "ADMIN") {
    if (teacherId) where.teacherId = teacherId;
    if (studentId) where.studentId = studentId;
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      student: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const body = await req.json();
  const {
    teacherId,
    studentId,
    subject,
    date,
    startTime,
    durationMinutes,
    notes,
  } = body;

  if (!studentId || !subject || !date) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  let resolvedTeacherId = teacherId;

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher) {
      return NextResponse.json({ error: "未找到老师信息" }, { status: 403 });
    }
    resolvedTeacherId = teacher.id;
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  } else if (!resolvedTeacherId) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const scheduledAt = startTime
    ? combineDateAndTime(date, startTime)
    : new Date(date);

  const record = await prisma.session.create({
    data: {
      teacherId: resolvedTeacherId,
      studentId,
      subject,
      date: scheduledAt,
      durationMinutes: parseInt(durationMinutes, 10) || 60,
      notes: notes || null,
      recordedBy: session.user.name,
    },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      student: true,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
