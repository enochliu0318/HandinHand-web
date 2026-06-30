import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IOSCard, IOSBadge } from "@/components/ui/ios";
import { BookOpen, Users, Clock } from "lucide-react";
import { formatDurationMinutes, formatScheduledRange } from "@/lib/utils";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      sessions: {
        include: { student: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!teacher) {
    return <p className="text-center text-ios-gray py-8">未找到老师信息</p>;
  }

  const totalMinutes = teacher.sessions.reduce(
    (s, r) => s + r.durationMinutes,
    0
  );
  const uniqueStudents = new Set(teacher.sessions.map((s) => s.studentId)).size;
  const subjects = [
    ...new Set(teacher.sessions.map((s) => s.subject)),
  ];

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-1">你好，{session.user.name}</h1>
      <p className="text-ios-gray mb-6">这是你的授课概览</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: BookOpen, label: "总时长", value: formatDurationMinutes(totalMinutes) },
          { icon: Users, label: "学生数", value: uniqueStudents },
          { icon: Clock, label: "授课次数", value: teacher.sessions.length },
        ].map((s) => (
          <IOSCard key={s.label} className="text-center py-4">
            <s.icon className="w-5 h-5 text-ios-blue mx-auto mb-1" />
            <p className="text-lg font-bold leading-tight">{s.value}</p>
            <p className="text-xs text-ios-gray">{s.label}</p>
          </IOSCard>
        ))}
      </div>

      {subjects.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-2">
            授课科目
          </p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <IOSBadge key={s} color="blue">
                {s}
              </IOSBadge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-2">
        最近授课
      </p>
      <div className="bg-ios-card rounded-2xl overflow-hidden shadow-sm">
        {teacher.sessions.length === 0 ? (
          <p className="text-center text-ios-gray py-8 text-sm">暂无授课记录</p>
        ) : (
          teacher.sessions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3.5 ios-separator"
            >
              <div>
                <p className="font-medium">{s.student.name}</p>
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
