import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicLayout } from "@/components/layouts";
import { IOSCard, IOSBadge, IOSButton } from "@/components/ui/ios";
import { User, FileText, Download } from "lucide-react";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const teacher = await prisma.teacher.findUnique({
    where: { id, isPublished: true },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { sessions: true } },
    },
  });

  if (!teacher) notFound();

  const subjects = teacher.subjects.split(",").filter(Boolean);

  return (
    <PublicLayout session={session}>
      <Link
        href="/teachers"
        className="text-ios-blue text-sm flex items-center gap-1 mb-4"
      >
        <svg width="8" height="14" viewBox="0 0 10 16" fill="none">
          <path
            d="M9 1L2 8L9 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        老师列表
      </Link>

      {/* Profile header */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-ios-blue/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {teacher.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teacher.photoUrl}
              alt={teacher.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-ios-blue" />
          )}
        </div>
        <h1 className="text-2xl font-bold">{teacher.user.name}</h1>
        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          {subjects.map((s) => (
            <IOSBadge key={s} color="blue">
              {s.trim()}
            </IOSBadge>
          ))}
        </div>
        <p className="text-sm text-ios-gray mt-2">
          累计授课 {teacher._count.sessions} 节
        </p>
      </div>

      {/* Bio */}
      {teacher.bio && (
        <IOSCard className="mb-4">
          <h2 className="text-xs text-ios-gray uppercase tracking-wide mb-2">
            个人简介
          </h2>
          <p className="text-base leading-relaxed">{teacher.bio}</p>
        </IOSCard>
      )}

      {/* Resume */}
      {teacher.resumeUrl ? (
        <IOSCard className="mb-4">
          <h2 className="text-xs text-ios-gray uppercase tracking-wide mb-3">
            简历
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ios-red/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-ios-red" />
            </div>
            <div className="flex-1">
              <p className="font-medium">老师简历</p>
              <p className="text-xs text-ios-gray">PDF / 文档</p>
            </div>
            <a href={teacher.resumeUrl} target="_blank" rel="noopener noreferrer">
              <IOSButton size="sm" variant="secondary">
                <Download className="w-4 h-4" />
              </IOSButton>
            </a>
          </div>
        </IOSCard>
      ) : (
        <IOSCard className="mb-4 text-center py-6">
          <p className="text-ios-gray text-sm">暂无简历文件</p>
        </IOSCard>
      )}
    </PublicLayout>
  );
}
