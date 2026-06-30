import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const student = await prisma.student.update({
    where: { id },
    data: {
      name: body.name,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      grade: body.grade,
    },
  });

  return NextResponse.json(student);
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
  await prisma.session.deleteMany({ where: { studentId: id } });
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
