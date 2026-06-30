"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IOSCard, IOSBadge, IOSEmptyState, IOSButton } from "@/components/ui/ios";
import { BookOpen, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Session {
  id: string;
  subject: string;
  date: string;
  duration: number;
  notes: string | null;
  teacher: { user: { name: string } };
  student: { name: string; grade: string | null };
}

export default function ParentPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  const totalDuration = sessions.reduce((s, r) => s + r.duration, 0);
  const studentName = sessions[0]?.student.name;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-1">上课记录</h1>
      <p className="text-ios-gray mb-6">
        {studentName ? `${studentName} 的授课记录` : "查看孩子的上课情况"}
      </p>

      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <IOSCard className="text-center py-4">
            <BookOpen className="w-5 h-5 text-ios-blue mx-auto mb-1" />
            <p className="text-xl font-bold">{sessions.length}</p>
            <p className="text-xs text-ios-gray">授课次数</p>
          </IOSCard>
          <IOSCard className="text-center py-4">
            <GraduationCap className="w-5 h-5 text-ios-green mx-auto mb-1" />
            <p className="text-xl font-bold">{totalDuration}</p>
            <p className="text-xs text-ios-gray">总课时</p>
          </IOSCard>
        </div>
      )}

      <Link href="/teachers" className="block mb-4">
        <IOSButton variant="secondary" fullWidth>
          浏览老师简历
        </IOSButton>
      </Link>

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : sessions.length === 0 ? (
        <IOSEmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="暂无上课记录"
          description="孩子开始上课后，记录会显示在这里"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <IOSCard key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IOSBadge color="blue">{s.subject}</IOSBadge>
                    <span className="text-sm text-ios-gray">
                      {s.duration} 节
                    </span>
                  </div>
                  <p className="font-medium">老师：{s.teacher.user.name}</p>
                  <p className="text-sm text-ios-gray">
                    {formatDate(s.date)}
                  </p>
                  {s.notes && (
                    <p className="text-sm text-ios-gray mt-1">{s.notes}</p>
                  )}
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      )}
    </>
  );
}
