"use client";

import { useEffect, useState } from "react";
import { AdminPageTitle } from "@/components/admin-shell";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSTextarea,
  IOSBadge,
  IOSEmptyState,
} from "@/components/ui/ios";
import { FileUploadButton } from "@/components/file-upload-button";
import { Plus, User, Trash2, X } from "lucide-react";

interface Teacher {
  id: string;
  bio: string;
  subjects: string;
  resumeUrl: string | null;
  photoUrl: string | null;
  isPublished: boolean;
  user: { name: string; email: string };
  _count: { sessions: number };
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/teachers");
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        bio: fd.get("bio"),
        subjects: fd.get("subjects"),
        isPublished: fd.get("isPublished") === "on",
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

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`确定删除老师 ${name}？`)) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    load();
  }

  async function handleUpload(
    teacherId: string,
    file: File,
    type: "resume" | "photo"
  ) {
    setUploadingId(`${teacherId}-${type}`);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    fd.append("teacherId", teacherId);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingId(null);
    if (res.ok) {
      load();
    } else {
      const err = await res.json();
      alert(err.error || "上传失败");
    }
  }

  return (
    <>
      <AdminPageTitle
        title="老师管理"
        subtitle={`共 ${teachers.length} 位老师`}
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
            <h2 className="font-semibold">添加老师</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-ios-gray" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <IOSInput name="name" label="姓名" required placeholder="张小明" />
            <IOSInput
              name="email"
              label="邮箱"
              type="email"
              required
              placeholder="zhang@example.com"
            />
            <IOSInput
              name="password"
              label="初始密码"
              type="password"
              required
              placeholder="至少6位"
            />
            <IOSInput
              name="subjects"
              label="擅长科目"
              placeholder="数学,物理（逗号分隔）"
            />
            <IOSTextarea name="bio" label="个人简介" rows={3} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" className="accent-ios-blue" />
              立即公开发布
            </label>
            <IOSButton type="submit" fullWidth>
              创建老师
            </IOSButton>
          </form>
        </IOSCard>
      )}

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : teachers.length === 0 ? (
        <IOSEmptyState
          icon={<User className="w-12 h-12" />}
          title="暂无老师"
          description="点击右上角添加第一位老师"
        />
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <IOSCard key={t.id}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-ios-blue" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{t.user.name}</p>
                    <IOSBadge color={t.isPublished ? "green" : "gray"}>
                      {t.isPublished ? "已发布" : "未发布"}
                    </IOSBadge>
                  </div>
                  <p className="text-sm text-ios-gray">{t.user.email}</p>
                  {t.subjects && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.subjects.split(",").map((s) => (
                        <IOSBadge key={s} color="blue">
                          {s.trim()}
                        </IOSBadge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-ios-gray mt-1">
                    已授课 {t._count.sessions} 节
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ios-gray5">
                <FileUploadButton
                  size="sm"
                  label={
                    uploadingId === `${t.id}-resume` ? "上传中..." : "上传简历"
                  }
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                  disabled={uploadingId !== null}
                  onSelect={(file) => handleUpload(t.id, file, "resume")}
                />
                <FileUploadButton
                  size="sm"
                  label={
                    uploadingId === `${t.id}-photo` ? "上传中..." : "上传头像"
                  }
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploadingId !== null}
                  onSelect={(file) => handleUpload(t.id, file, "photo")}
                />
                <IOSButton
                  size="sm"
                  variant="secondary"
                  onClick={() => togglePublish(t.id, t.isPublished)}
                >
                  {t.isPublished ? "下架" : "发布"}
                </IOSButton>
                <IOSButton
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(t.id, t.user.name)}
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
