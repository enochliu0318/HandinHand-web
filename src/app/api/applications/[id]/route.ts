import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
  const { action, password, childName } = body;

  const application = await prisma.accountApplication.findUnique({
    where: { id },
  });

  if (!application) {
    return NextResponse.json({ error: "申请不存在" }, { status: 404 });
  }

  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "该申请已处理" }, { status: 400 });
  }

  if (action === "reject") {
    const updated = await prisma.accountApplication.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json(updated);
  }

  if (action !== "approve") {
    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "请设置至少 6 位的初始密码" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: application.email },
  });
  if (existingUser) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    if (application.role === "TEACHER") {
      await prisma.teacher.create({
        data: {
          bio: application.message || "",
          subjects: "",
          isPublished: false,
          user: {
            create: {
              email: application.email,
              password: hashed,
              name: application.name,
              role: "TEACHER",
            },
          },
        },
      });
    } else {
      const studentName = childName?.trim() || `${application.name}的孩子`;
      await prisma.student.create({
        data: {
          name: studentName,
          parentName: application.name,
          parentPhone: application.phone,
          user: {
            create: {
              email: application.email,
              password: hashed,
              name: application.name,
              role: "PARENT",
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to approve application:", error);
    return NextResponse.json(
      { error: "创建账号失败，请检查邮箱是否已被使用" },
      { status: 500 }
    );
  }

  const updated = await prisma.accountApplication.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  return NextResponse.json(updated);
}
