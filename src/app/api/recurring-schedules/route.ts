import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  applyTimeToDate,
  combineDateAndTime,
  getRecurringDates,
} from "@/lib/recurring";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const where: Record<string, string> = {};

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher) return NextResponse.json([]);
    where.teacherId = teacher.id;
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const schedules = await prisma.recurringSchedule.findMany({
    where,
    include: {
      student: { select: { name: true, grade: true } },
      teacher: { include: { user: { select: { name: true } } } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const body = await req.json();
  const {
    teacherId,
    studentId,
    subject,
    dayOfWeek,
    startTime,
    durationMinutes,
    startDate,
    endDate,
    weeksAhead,
    notes,
  } = body;

  if (
    !studentId ||
    !subject ||
    dayOfWeek === undefined ||
    !startTime ||
    !startDate
  ) {
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

  const parsedDay = parseInt(dayOfWeek, 10);
  const parsedDuration = parseInt(durationMinutes, 10) || 60;
  const parsedWeeks = parseInt(weeksAhead, 10) || 8;
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = endDate ? new Date(endDate) : null;

  const schedule = await prisma.recurringSchedule.create({
    data: {
      teacherId: resolvedTeacherId,
      studentId,
      subject,
      dayOfWeek: parsedDay,
      startTime,
      durationMinutes: parsedDuration,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      notes: notes || null,
    },
  });

  const dates = getRecurringDates(
    parsedDay,
    parsedStartDate,
    parsedWeeks,
    parsedEndDate
  );

  if (dates.length > 0) {
    await prisma.session.createMany({
      data: dates.map((d) => ({
        teacherId: resolvedTeacherId,
        studentId,
        subject,
        date: applyTimeToDate(d, startTime),
        durationMinutes: parsedDuration,
        notes: notes || null,
        recurringScheduleId: schedule.id,
        recordedBy: session.user.name,
      })),
    });
  }

  const result = await prisma.recurringSchedule.findUnique({
    where: { id: schedule.id },
    include: {
      student: { select: { name: true, grade: true } },
      teacher: { include: { user: { select: { name: true } } } },
      _count: { select: { sessions: true } },
    },
  });

  return NextResponse.json(result, { status: 201 });
}
