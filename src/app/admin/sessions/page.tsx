"use client";

import { useEffect, useState } from "react";
import { AdminPageTitle } from "@/components/admin-shell";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSSelect,
  IOSTextarea,
  IOSBadge,
  IOSSegmentedControl,
  IOSEmptyState,
} from "@/components/ui/ios";
import { Plus, BookOpen, X, Trash2 } from "lucide-react";
import { formatDate, SUBJECTS } from "@/lib/utils";

interface Teacher {
  id: string;
  user: { name: string };
}

interface Student {
  id: string;
  name: string;
}

interface Session {
  id: string;
  subject: string;
  date: string;
  duration: number;
  notes: string | null;
  recordedBy: string | null;
  teacher: { user: { name: string } };
  student: { name: string };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [filterId, setFilterId] = useState("");

  async function load() {
    const [sessRes, teachRes, studRes] = await Promise.all([
      fetch(
        `/api/sessions${filterId ? `?${filter === "teacher" ? "teacherId" : "studentId"}=${filterId}` : ""}`
      ),
      fetch("/api/teachers"),
      fetch("/api/students"),
    ]);
    setSessions(await sessRes.json());
    setTeachers(await teachRes.json());
    setStudents(await studRes.json());
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterId]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
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
        duration: parseInt(fd.get("duration") as string) || 1,
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

  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <>
      <AdminPageTitle
        title="授课记录"
        subtitle={`共 ${sessions.length} 条 · ${totalDuration} 课时`}
        action={
          <IOSButton size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            录入
          </IOSButton>
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
          options={[
            { value: "", label: "全部老师" },
            ...teachers.map((t) => ({
              value: t.id,
              label: t.user.name,
            })),
          ]}
        />
      )}
      {filter === "student" && (
        <IOSSelect
          className="mb-4"
          label="选择学生"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          options={[
            { value: "", label: "全部学生" },
            ...students.map((s) => ({ value: s.id, label: s.name })),
          ]}
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
          <form onSubmit={handleCreate} className="space-y-3">
            <IOSSelect
              name="teacherId"
              label="老师"
              required
              options={[
                { value: "", label: "请选择老师" },
                ...teachers.map((t) => ({
                  value: t.id,
                  label: t.user.name,
                })),
              ]}
            />
            <IOSSelect
              name="studentId"
              label="学生"
              required
              options={[
                { value: "", label: "请选择学生" },
                ...students.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <IOSSelect
              name="subject"
              label="科目"
              required
              options={[
                { value: "", label: "请选择科目" },
                ...SUBJECTS.map((s) => ({ value: s, label: s })),
              ]}
            />
            <IOSInput
              name="date"
              label="上课日期"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <IOSInput
              name="duration"
              label="课时数"
              type="number"
              min="1"
              defaultValue="1"
            />
            <IOSTextarea name="notes" label="备注" rows={2} placeholder="本节内容..." />
            <IOSButton type="submit" fullWidth>
              保存记录
            </IOSButton>
          </form>
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
            <IOSCard key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IOSBadge color="blue">{s.subject}</IOSBadge>
                    <span className="text-sm text-ios-gray">
                      {s.duration} 节
                    </span>
                  </div>
                  <p className="font-medium">
                    {s.teacher.user.name} → {s.student.name}
                  </p>
                  <p className="text-sm text-ios-gray">
                    {formatDate(s.date)}
                  </p>
                  {s.notes && (
                    <p className="text-sm text-ios-gray mt-1">{s.notes}</p>
                  )}
                  {s.recordedBy && (
                    <p className="text-xs text-ios-gray mt-1">
                      录入：{s.recordedBy}
                    </p>
                  )}
                </div>
                <IOSButton
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </IOSButton>
              </div>
            </IOSCard>
          ))}
        </div>
      )}
    </>
  );
}
