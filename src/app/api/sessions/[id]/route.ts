import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const record = await prisma.session.update({
    where: { id },
    data: {
      subject: body.subject,
      date: body.date ? new Date(body.date) : undefined,
      duration: body.duration,
      notes: body.notes,
    },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      student: true,
    },
  });

  return NextResponse.json(record);
}
