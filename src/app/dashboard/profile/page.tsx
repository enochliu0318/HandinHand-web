"use client";

import { useEffect, useState } from "react";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSTextarea,
  IOSBadge,
} from "@/components/ui/ios";
import { Upload, User } from "lucide-react";

interface TeacherProfile {
  id: string;
  bio: string;
  subjects: string;
  resumeUrl: string | null;
  photoUrl: string | null;
  isPublished: boolean;
  user: { name: string; email: string };
}

export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((data: TeacherProfile[]) => {
        const mine = data[0];
        if (mine) {
          setTeacher(mine);
          setBio(mine.bio);
          setSubjects(mine.subjects);
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher) return;
    setSaving(true);
    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, subjects }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("保存成功");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function handleUpload(file: File, type: "resume" | "photo") {
    if (!teacher) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    fd.append("teacherId", teacher.id);
    await fetch("/api/upload", { method: "POST", body: fd });
    const res = await fetch("/api/teachers");
    const data = await res.json();
    setTeacher(data[0]);
  }

  if (!teacher) {
    return <p className="text-center text-ios-gray py-8">加载中...</p>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-6">我的资料</h1>

      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-ios-blue/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
          {teacher.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teacher.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-ios-blue" />
          )}
        </div>
        <p className="font-semibold text-lg">{teacher.user.name}</p>
        <p className="text-sm text-ios-gray">{teacher.user.email}</p>
        <IOSBadge color={teacher.isPublished ? "green" : "gray"} className="mt-2">
          {teacher.isPublished ? "已公开发布" : "未发布"}
        </IOSBadge>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <IOSTextarea
          label="个人简介"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />
        <IOSInput
          label="擅长科目"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          placeholder="数学,物理（逗号分隔）"
        />

        {message && (
          <p className="text-ios-green text-sm text-center">{message}</p>
        )}

        <IOSButton type="submit" fullWidth disabled={saving}>
          {saving ? "保存中..." : "保存资料"}
        </IOSButton>
      </form>

      <div className="flex gap-2 mt-4">
        <label className="flex-1 cursor-pointer">
          <IOSButton variant="secondary" fullWidth type="button">
            <Upload className="w-4 h-4 mr-1" />
            上传简历
          </IOSButton>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "resume");
            }}
          />
        </label>
        <label className="flex-1 cursor-pointer">
          <IOSButton variant="secondary" fullWidth type="button">
            <Upload className="w-4 h-4 mr-1" />
            上传头像
          </IOSButton>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "photo");
            }}
          />
        </label>
      </div>
    </>
  );
}
