"use client";

import { useEffect, useState } from "react";
import { AdminPageTitle } from "@/components/admin-shell";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSEmptyState,
} from "@/components/ui/ios";
import { Plus, Users, X, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string | null;
  grade: string | null;
  user: { email: string } | null;
  _count: { sessions: number };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        parentName: fd.get("parentName"),
        parentPhone: fd.get("parentPhone"),
        grade: fd.get("grade"),
        email: fd.get("email") || undefined,
        password: fd.get("password") || undefined,
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`确定删除学生 ${name}？`)) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <AdminPageTitle
        title="学生管理"
        subtitle={`共 ${students.length} 位学生`}
        action={
          <IOSButton size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            添加
          </IOSButton>
        }
      />

      {showForm && (
        <IOSCard className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">添加学生</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-ios-gray" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <IOSInput name="name" label="学生姓名" required />
            <IOSInput name="parentName" label="家长姓名" required />
            <IOSInput name="parentPhone" label="家长电话" type="tel" />
            <IOSInput name="grade" label="年级" placeholder="小学三年级" />
            <p className="text-xs text-ios-gray px-1">
              以下为家长登录账号（可选）
            </p>
            <IOSInput name="email" label="家长邮箱" type="email" />
            <IOSInput name="password" label="家长密码" type="password" />
            <IOSButton type="submit" fullWidth>
              创建学生
            </IOSButton>
          </form>
        </IOSCard>
      )}

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : students.length === 0 ? (
        <IOSEmptyState
          icon={<Users className="w-12 h-12" />}
          title="暂无学生"
          description="点击右上角添加第一位学生"
        />
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <IOSCard key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">{s.name}</p>
                  {s.grade && (
                    <p className="text-sm text-ios-gray">{s.grade}</p>
                  )}
                  <p className="text-sm text-ios-gray mt-1">
                    家长：{s.parentName}
                    {s.parentPhone && ` · ${s.parentPhone}`}
                  </p>
                  {s.user?.email && (
                    <p className="text-xs text-ios-gray mt-0.5">
                      账号：{s.user.email}
                    </p>
                  )}
                  <p className="text-xs text-ios-blue mt-1">
                    已上课 {s._count.sessions} 节
                  </p>
                </div>
                <IOSButton
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(s.id, s.name)}
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
