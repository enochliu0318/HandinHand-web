import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const adminPasswordPlain =
    process.env.SEED_ADMIN_PASSWORD ??
    (isProduction ? undefined : "admin123");

  if (!adminPasswordPlain) {
    console.error(
      "生产环境请设置 SEED_ADMIN_PASSWORD 后再运行 seed，例如：\n" +
        "SEED_ADMIN_PASSWORD='your-secure-password' npm run db:seed"
    );
    process.exit(1);
  }

  const password = await bcrypt.hash(adminPasswordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@handinhand.com" },
    update: { password, name: "管理员", role: "ADMIN" },
    create: {
      email: "admin@handinhand.com",
      password,
      name: "管理员",
      role: "ADMIN",
    },
  });

  const seedDemo = process.env.SEED_DEMO_DATA === "true" || !isProduction;
  if (!seedDemo) {
    console.log("种子数据：仅创建/更新管理员账号");
    console.log("管理员: admin@handinhand.com");
    return;
  }

  const teacherPassword = await bcrypt.hash(
    process.env.SEED_TEACHER_PASSWORD ?? "teacher123",
    10
  );

  const teacher1User = await prisma.user.upsert({
    where: { email: "zhangsan@example.com" },
    update: { password: teacherPassword, name: "张小明", role: "TEACHER" },
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
    update: { password: teacherPassword, name: "李小红", role: "TEACHER" },
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

  const parentPassword = await bcrypt.hash(
    process.env.SEED_PARENT_PASSWORD ?? "parent123",
    10
  );

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: { password: parentPassword, name: "王家长", role: "PARENT" },
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

  const student2 = await prisma.student.upsert({
    where: { id: "seed-student-zhao" },
    update: {},
    create: {
      id: "seed-student-zhao",
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
    await prisma.session.deleteMany({});
    await prisma.session.createMany({
      data: [
        {
          teacherId: teacher1.id,
          studentId: student1.id,
          subject: "数学",
          date: new Date("2026-06-01T14:00:00"),
          durationMinutes: 60,
          notes: "分数加减法",
          feedback: "学生掌握良好，能独立完成练习题。建议加强应用题训练。",
          actualStartAt: new Date("2026-06-01T14:05:00"),
          actualEndAt: new Date("2026-06-01T15:00:00"),
          recordedBy: admin.name,
        },
        {
          teacherId: teacher1.id,
          studentId: student1.id,
          subject: "数学",
          date: new Date("2026-06-08T14:00:00"),
          durationMinutes: 60,
          notes: "乘法口诀",
          recordedBy: admin.name,
        },
        {
          teacherId: teacher2.id,
          studentId: student2.id,
          subject: "英语",
          date: new Date("2026-06-05T10:00:00"),
          durationMinutes: 90,
          notes: "基础单词",
          feedback: "单词记忆不错，发音需要多练习。",
          actualStartAt: new Date("2026-06-05T10:02:00"),
          actualEndAt: new Date("2026-06-05T11:30:00"),
          recordedBy: admin.name,
        },
      ],
    });
  }

  console.log("种子数据创建完成！");
  console.log("管理员: admin@handinhand.com");
  if (!isProduction) {
    console.log("老师: zhangsan@example.com / teacher123");
    console.log("家长: parent@example.com / parent123");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
