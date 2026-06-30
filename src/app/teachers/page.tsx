import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicLayout } from "@/components/layouts";
import { IOSBadge } from "@/components/ui/ios";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">找老师</h1>
        <p className="text-ios-gray mt-2">
          浏览学长学姐的简历，为孩子选择合适的辅导老师
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-16 text-ios-gray">
          暂无公开的老师简历
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {teachers.map((teacher) => {
            const subjects = teacher.subjects.split(",").filter(Boolean);

            return (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="group block"
              >
                <article className="bg-ios-card rounded-3xl overflow-hidden shadow-sm transition-transform active:scale-[0.98] h-full flex flex-col">
                  <div className="aspect-[5/3] bg-gradient-to-br from-ios-blue/8 to-ios-blue/20 flex items-center justify-center overflow-hidden">
                    {teacher.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center">
                        <User className="w-10 h-10 text-ios-blue" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 className="text-xl font-semibold leading-tight">
                        {teacher.user.name}
                      </h2>
                      <span className="text-xs text-ios-gray shrink-0 pt-1">
                        {teacher._count.sessions} 次授课
                      </span>
                    </div>

                    {subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {subjects.map((s) => (
                          <IOSBadge key={s} color="blue">
                            {s.trim()}
                          </IOSBadge>
                        ))}
                      </div>
                    )}

                    {teacher.bio && (
                      <p className="text-sm text-ios-gray leading-relaxed line-clamp-3 flex-1">
                        {teacher.bio}
                      </p>
                    )}

                    <p className="text-ios-blue text-sm font-medium mt-4 group-hover:underline">
                      查看详情 →
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </PublicLayout>
  );
}
