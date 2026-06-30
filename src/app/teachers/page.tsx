import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicLayout } from "@/components/layouts";
import { IOSCard, IOSBadge } from "@/components/ui/ios";
import { User } from "lucide-react";

export default async function TeachersPage() {
  const session = await auth();

  const teachers = await prisma.teacher.findMany({
    where: { isPublished: true },
    include: {
      user: { select: { name: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PublicLayout session={session}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">找老师</h1>
        <p className="text-ios-gray mt-1">浏览学长学姐的简历，选择合适的老师</p>
      </div>

      {teachers.length === 0 ? (
        <IOSCard className="text-center py-12">
          <p className="text-ios-gray">暂无公开的老师简历</p>
        </IOSCard>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
              <IOSCard className="flex items-center gap-4 active:scale-[0.98] transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-ios-blue/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {teacher.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={teacher.photoUrl}
                      alt={teacher.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-ios-blue" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{teacher.user.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {teacher.subjects.split(",").filter(Boolean).map((s) => (
                      <IOSBadge key={s} color="blue">
                        {s.trim()}
                      </IOSBadge>
                    ))}
                  </div>
                  {teacher.bio && (
                    <p className="text-sm text-ios-gray mt-1.5 line-clamp-2">
                      {teacher.bio}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ios-gray">已授课</p>
                  <p className="text-lg font-bold text-ios-blue">
                    {teacher._count.sessions}
                  </p>
                  <p className="text-xs text-ios-gray">节</p>
                </div>
              </IOSCard>
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
