import "dotenv/config";
import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("file:./")) {
    return `file:${path.join(process.cwd(), url.slice(5))}`;
  }
  return url;
}

const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@handinhand.com" },
    update: {},
    create: {
      email: "admin@handinhand.com",
      password,
      name: "管理员",
      role: "ADMIN",
    },
  });

  const teacherPassword = await bcrypt.hash("teacher123", 10);

  const teacher1User = await prisma.user.upsert({
    where: { email: "zhangsan@example.com" },
    update: {},
    create: {
      email: "zhangsan@example.com",
      password: teacherPassword,
      name: "张小明",
      role: "TEACHER",
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      userId: teacher1User.id,
      bio: "我是高三学生，擅长数学和物理，有两年辅导小学生的经验。耐心细致，善于用生活化的例子讲解难题。",
      subjects: "数学,物理",
      isPublished: true,
    },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: "lisi@example.com" },
    update: {},
    create: {
      email: "lisi@example.com",
      password: teacherPassword,
      name: "李小红",
      role: "TEACHER",
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      userId: teacher2User.id,
      bio: "高二学生，英语成绩优异，已通过剑桥英语高级考试。喜欢和小朋友们一起学习英语，寓教于乐。",
      subjects: "英语",
      isPublished: true,
    },
  });

  const parentPassword = await bcrypt.hash("parent123", 10);

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {},
    create: {
      email: "parent@example.com",
      password: parentPassword,
      name: "王家长",
      role: "PARENT",
    },
  });

  const student1 = await prisma.student.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      name: "王小宝",
      parentName: "王家长",
      parentPhone: "13800138000",
      grade: "小学三年级",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "赵小美",
      parentName: "赵家长",
      parentPhone: "13900139000",
      grade: "小学五年级",
    },
  });

  const teacher1 = await prisma.teacher.findUnique({
    where: { userId: teacher1User.id },
  });
  const teacher2 = await prisma.teacher.findUnique({
    where: { userId: teacher2User.id },
  });

  if (teacher1 && teacher2) {
    await prisma.session.createMany({
      data: [
        {
          teacherId: teacher1.id,
          studentId: student1.id,
          subject: "数学",
          date: new Date("2026-06-01"),
          duration: 2,
          notes: "分数加减法",
          recordedBy: admin.name,
        },
        {
          teacherId: teacher1.id,
          studentId: student1.id,
          subject: "数学",
          date: new Date("2026-06-08"),
          duration: 1,
          notes: "乘法口诀",
          recordedBy: admin.name,
        },
        {
          teacherId: teacher2.id,
          studentId: student2.id,
          subject: "英语",
          date: new Date("2026-06-05"),
          duration: 2,
          notes: "基础单词",
          recordedBy: admin.name,
        },
      ],
    });
  }

  console.log("种子数据创建完成！");
  console.log("管理员: admin@handinhand.com / admin123");
  console.log("老师: zhangsan@example.com / teacher123");
  console.log("家长: parent@example.com / parent123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
