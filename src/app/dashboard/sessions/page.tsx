"use client";

import { useEffect, useState } from "react";
import {
  IOSCard,
  IOSEmptyState,
  IOSButton,
  IOSInput,
  IOSSelect,
  IOSTextarea,
  IOSSegmentedControl,
} from "@/components/ui/ios";
import { SessionDetailCard } from "@/components/session-detail";
import { ExportScheduleButton } from "@/components/export-schedule-button";
import { BookOpen, Plus, X } from "lucide-react";
import { DAYS_OF_WEEK, SUBJECTS } from "@/lib/utils";
import type { SessionRecord } from "@/types/session";

interface Student {
  id: string;
  name: string;
  grade: string | null;
}

export default function TeacherSessionsPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scheduleType, setScheduleType] = useState("once");

  async function load() {
    const [sessRes, studRes] = await Promise.all([
      fetch("/api/sessions"),
      fetch("/api/students"),
    ]);
    const sessData = await sessRes.json();
    const studData = await studRes.json();
    setSessions(Array.isArray(sessData) ? sessData : []);
    setStudents(Array.isArray(studData) ? studData : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateOnce(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: fd.get("studentId"),
        subject: fd.get("subject"),
        date: fd.get("date"),
        startTime: fd.get("startTime"),
        durationMinutes: parseInt(fd.get("durationMinutes") as string) || 60,
        notes: fd.get("notes"),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setLoading(true);
      load();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  async function handleCreateRecurring(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/recurring-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: fd.get("studentId"),
        subject: fd.get("subject"),
        dayOfWeek: fd.get("dayOfWeek"),
        startTime: fd.get("startTime"),
        startDate: fd.get("startDate"),
        weeksAhead: parseInt(fd.get("weeksAhead") as string) || 8,
        durationMinutes: parseInt(fd.get("durationMinutes") as string) || 60,
        notes: fd.get("notes"),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setLoading(true);
      load();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  const studentOptions = [
    { value: "", label: "请选择学生" },
    ...students.map((s) => ({
      value: s.id,
      label: s.grade ? `${s.name}（${s.grade}）` : s.name,
    })),
  ];

  const subjectOptions = [
    { value: "", label: "请选择科目" },
    ...SUBJECTS.map((s) => ({ value: s, label: s })),
  ];

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">我的课程</h1>
          <p className="text-ios-gray">安排课程、记录上课时间与反馈</p>
        </div>
        <div className="flex gap-2">
          <ExportScheduleButton
            sessions={sessions}
            filename="我的课表.csv"
          />
          <IOSButton size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            安排
          </IOSButton>
        </div>
      </div>

      {showForm && (
        <IOSCard className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">安排课程</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-ios-gray" />
            </button>
          </div>

          <IOSSegmentedControl
            className="mb-4"
            options={[
              { value: "once", label: "单次" },
              { value: "weekly", label: "每周" },
            ]}
            value={scheduleType}
            onChange={setScheduleType}
          />

          {scheduleType === "once" ? (
            <form onSubmit={handleCreateOnce} className="space-y-3">
              <IOSSelect
                name="studentId"
                label="学生"
                required
                options={studentOptions}
              />
              <IOSSelect
                name="subject"
                label="科目"
                required
                options={subjectOptions}
              />
              <IOSInput
                name="date"
                label="上课日期"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
              <IOSInput
                name="startTime"
                label="开始时间"
                type="time"
                required
                defaultValue="14:00"
              />
              <IOSInput
                name="durationMinutes"
                label="时长（分钟）"
                type="number"
                min="15"
                step="15"
                defaultValue="60"
              />
              <IOSTextarea
                name="notes"
                label="备注"
                rows={2}
                placeholder="本节计划内容..."
              />
              <IOSButton type="submit" fullWidth>
                保存
              </IOSButton>
            </form>
          ) : (
            <form onSubmit={handleCreateRecurring} className="space-y-3">
              <IOSSelect
                name="studentId"
                label="学生"
                required
                options={studentOptions}
              />
              <IOSSelect
                name="subject"
                label="科目"
                required
                options={subjectOptions}
              />
              <IOSSelect
                name="dayOfWeek"
                label="每周"
                required
                options={[
                  { value: "", label: "请选择" },
                  ...DAYS_OF_WEEK.map((d) => ({
                    value: String(d.value),
                    label: d.label,
                  })),
                ]}
              />
              <IOSInput
                name="startTime"
                label="开始时间"
                type="time"
                required
                defaultValue="14:00"
              />
              <IOSInput
                name="startDate"
                label="开始日期"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
              <IOSInput
                name="weeksAhead"
                label="生成周数"
                type="number"
                min="1"
                max="52"
                defaultValue="8"
              />
              <IOSInput
                name="durationMinutes"
                label="每次时长（分钟）"
                type="number"
                min="15"
                step="15"
                defaultValue="60"
              />
              <IOSTextarea
                name="notes"
                label="备注"
                rows={2}
                placeholder="固定课程内容说明..."
              />
              <IOSButton type="submit" fullWidth>
                生成课程
              </IOSButton>
            </form>
          )}
        </IOSCard>
      )}

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : sessions.length === 0 ? (
        <IOSEmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="暂无授课记录"
          description="点击右上角安排第一节课"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionDetailCard
              key={s.id}
              session={s}
              mode="teacher"
              onUpdate={load}
            />
          ))}
        </div>
      )}
    </>
  );
}
