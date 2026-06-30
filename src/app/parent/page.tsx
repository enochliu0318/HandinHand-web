"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IOSCard, IOSEmptyState, IOSButton } from "@/components/ui/ios";
import { SessionDetailCard } from "@/components/session-detail";
import { ExportScheduleButton } from "@/components/export-schedule-button";
import { BookOpen, GraduationCap, Clock } from "lucide-react";
import { formatDurationMinutes } from "@/lib/utils";
import type { SessionRecord } from "@/types/session";

export default function ParentPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSessions([]);
        setLoading(false);
      });
  }, []);

  const totalMinutes = sessions.reduce((s, r) => s + r.durationMinutes, 0);
  const studentName = sessions[0]?.student?.name;

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">上课记录</h1>
          <p className="text-ios-gray">
            {studentName ? `${studentName} 的授课记录` : "查看孩子的上课情况"}
          </p>
        </div>
        <ExportScheduleButton
          sessions={sessions}
          filename="上课记录.csv"
        />
      </div>

      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <IOSCard className="text-center py-4">
            <BookOpen className="w-5 h-5 text-ios-blue mx-auto mb-1" />
            <p className="text-xl font-bold">{sessions.length}</p>
            <p className="text-xs text-ios-gray">授课次数</p>
          </IOSCard>
          <IOSCard className="text-center py-4">
            <Clock className="w-5 h-5 text-ios-green mx-auto mb-1" />
            <p className="text-xl font-bold">
              {formatDurationMinutes(totalMinutes)}
            </p>
            <p className="text-xs text-ios-gray">总时长</p>
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
          icon={<GraduationCap className="w-12 h-12" />}
          title="暂无上课记录"
          description="孩子开始上课后，记录会显示在这里"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionDetailCard key={s.id} session={s} mode="parent" />
          ))}
        </div>
      )}
    </>
  );
}
