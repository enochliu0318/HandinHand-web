"use client";

import { useEffect, useState } from "react";
import { IOSCard, IOSBadge, IOSEmptyState } from "@/components/ui/ios";
import { BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Session {
  id: string;
  subject: string;
  date: string;
  duration: number;
  notes: string | null;
  student: { name: string; grade: string | null };
}

export default function TeacherSessionsPage() {
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

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-1">我的课程</h1>
      <p className="text-ios-gray mb-6">全部授课记录</p>

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : sessions.length === 0 ? (
        <IOSEmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="暂无授课记录"
          description="管理员录入后会显示在这里"
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
                  <p className="font-medium">{s.student.name}</p>
                  {s.student.grade && (
                    <p className="text-sm text-ios-gray">{s.student.grade}</p>
                  )}
                  <p className="text-sm text-ios-gray mt-1">
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
