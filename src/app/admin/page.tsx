import { prisma } from "@/lib/prisma";
import { AdminPageTitle } from "@/components/admin-shell";
import { IOSCard, IOSBadge } from "@/components/ui/ios";
import { GraduationCap, Users, BookOpen, CheckCircle } from "lucide-react";
import { formatDurationMinutes, formatScheduledRange } from "@/lib/utils";

export default async function AdminDashboard() {
  const [teacherCount, studentCount, sessionCount, recentSessions] =
    await Promise.all([
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.session.count(),
      prisma.session.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          student: true,
        },
      }),
    ]);

  const totalDuration = await prisma.session.aggregate({
    _sum: { durationMinutes: true },
  });

  const stats = [
    {
      label: "老师",
      value: teacherCount,
      icon: GraduationCap,
      color: "text-ios-blue",
    },
    {
      label: "学生",
      value: studentCount,
      icon: Users,
      color: "text-ios-green",
    },
    {
      label: "授课记录",
      value: sessionCount,
      icon: BookOpen,
      color: "text-ios-orange",
    },
    {
      label: "总时长",
      value: formatDurationMinutes(totalDuration._sum.durationMinutes ?? 0),
      icon: CheckCircle,
      color: "text-ios-blue",
    },
  ];

  return (
    <>
      <AdminPageTitle title="概览" subtitle="项目数据总览" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s) => (
          <IOSCard key={s.label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-ios-gray5 flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-tight">{s.value}</p>
              <p className="text-xs text-ios-gray">{s.label}</p>
            </div>
          </IOSCard>
        ))}
      </div>

      <p className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-2">
        最近授课记录
      </p>
      <div className="bg-ios-card rounded-2xl overflow-hidden shadow-sm">
        {recentSessions.length === 0 ? (
          <p className="text-center text-ios-gray py-8 text-sm">暂无记录</p>
        ) : (
          recentSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3.5 ios-separator"
            >
              <div>
                <p className="font-medium">
                  {s.teacher.user.name} → {s.student.name}
                </p>
              <p className="text-sm text-ios-gray">
                {formatScheduledRange(s.date, s.durationMinutes)}
              </p>
              </div>
              <IOSBadge color="blue">{s.subject}</IOSBadge>
            </div>
          ))
        )}
      </div>
    </>
  );
}
