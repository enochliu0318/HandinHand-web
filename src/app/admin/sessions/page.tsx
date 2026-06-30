"use client";

import { useEffect, useState } from "react";
import { AdminPageTitle } from "@/components/admin-shell";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSSelect,
  IOSTextarea,
  IOSSegmentedControl,
  IOSEmptyState,
} from "@/components/ui/ios";
import { Plus, BookOpen, X } from "lucide-react";
import { formatDurationMinutes, DAYS_OF_WEEK, SUBJECTS } from "@/lib/utils";
import { ExportScheduleButton } from "@/components/export-schedule-button";
import { SessionDetailCard } from "@/components/session-detail";
import type { SessionRecord } from "@/types/session";

interface Teacher {
  id: string;
  user: { name: string };
}

interface Student {
  id: string;
  name: string;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [filterId, setFilterId] = useState("");
  const [scheduleType, setScheduleType] = useState("once");

  async function load() {
    const [sessRes, teachRes, studRes] = await Promise.all([
      fetch(
        `/api/sessions${filterId ? `?${filter === "teacher" ? "teacherId" : "studentId"}=${filterId}` : ""}`
      ),
      fetch("/api/teachers"),
      fetch("/api/students"),
    ]);
    const sessData = await sessRes.json();
    const teachData = await teachRes.json();
    const studData = await studRes.json();
    setSessions(Array.isArray(sessData) ? sessData : []);
    setTeachers(Array.isArray(teachData) ? teachData : []);
    setStudents(Array.isArray(studData) ? studData : []);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterId]);

  async function handleCreateOnce(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId: fd.get("teacherId"),
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
        teacherId: fd.get("teacherId"),
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
      load();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这条授课记录？")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    load();
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const teacherOptions = [
    { value: "", label: "请选择老师" },
    ...teachers.map((t) => ({ value: t.id, label: t.user.name })),
  ];

  const studentOptions = [
    { value: "", label: "请选择学生" },
    ...students.map((s) => ({ value: s.id, label: s.name })),
  ];

  const subjectOptions = [
    { value: "", label: "请选择科目" },
    ...SUBJECTS.map((s) => ({ value: s, label: s })),
  ];

  return (
    <>
      <AdminPageTitle
        title="授课记录"
        subtitle={`共 ${sessions.length} 条 · ${formatDurationMinutes(totalMinutes)}`}
        action={
          <div className="flex gap-2">
            <ExportScheduleButton
              sessions={sessions}
              filename="授课记录.csv"
            />
            <IOSButton size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              录入
            </IOSButton>
          </div>
        }
      />

      <IOSSegmentedControl
        className="mb-4"
        options={[
          { value: "all", label: "全部" },
          { value: "teacher", label: "按老师" },
          { value: "student", label: "按学生" },
        ]}
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setFilterId("");
        }}
      />

      {filter === "teacher" && (
        <IOSSelect
          className="mb-4"
          label="选择老师"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          options={[{ value: "", label: "全部老师" }, ...teacherOptions.slice(1)]}
        />
      )}
      {filter === "student" && (
        <IOSSelect
          className="mb-4"
          label="选择学生"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          options={[{ value: "", label: "全部学生" }, ...studentOptions.slice(1)]}
        />
      )}

      {showForm && (
        <IOSCard className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">录入授课记录</h2>
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
              <IOSSelect name="teacherId" label="老师" required options={teacherOptions} />
              <IOSSelect name="studentId" label="学生" required options={studentOptions} />
              <IOSSelect name="subject" label="科目" required options={subjectOptions} />
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
              <IOSTextarea name="notes" label="备注" rows={2} placeholder="本节内容..." />
              <IOSButton type="submit" fullWidth>
                保存记录
              </IOSButton>
            </form>
          ) : (
            <form onSubmit={handleCreateRecurring} className="space-y-3">
              <IOSSelect name="teacherId" label="老师" required options={teacherOptions} />
              <IOSSelect name="studentId" label="学生" required options={studentOptions} />
              <IOSSelect name="subject" label="科目" required options={subjectOptions} />
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
              <IOSTextarea name="notes" label="备注" rows={2} placeholder="固定课程内容..." />
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
          description="点击右上角录入第一条记录"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionDetailCard
              key={s.id}
              session={s}
              mode="admin"
              onUpdate={load}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
