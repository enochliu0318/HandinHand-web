import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const applications = await prisma.accountApplication.findMany({
    orderBy: { createdAt: "desc" },
    omit: { passwordHash: true },
  });

  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, role, message, password } = body;

  if (!name || !email || !role || !password) {
    return NextResponse.json({ error: "请填写必填项" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  if (role !== "TEACHER" && role !== "PARENT") {
    return NextResponse.json({ error: "无效的申请身份" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
  }

  const pending = await prisma.accountApplication.findFirst({
    where: { email, status: "PENDING" },
  });
  if (pending) {
    return NextResponse.json(
      { error: "该邮箱已有待审核的申请" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const application = await prisma.accountApplication.create({
    data: {
      name,
      email,
      phone: phone || null,
      role,
      message: message || null,
      passwordHash,
    },
    omit: { passwordHash: true },
  });

  return NextResponse.json(application, { status: 201 });
}
