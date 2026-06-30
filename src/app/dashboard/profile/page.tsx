"use client";

import { useEffect, useState } from "react";
import {
  IOSCard,
  IOSButton,
  IOSInput,
  IOSTextarea,
  IOSBadge,
} from "@/components/ui/ios";
import { FileUploadButton } from "@/components/file-upload-button";
import { FileText, User } from "lucide-react";

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
  const [uploading, setUploading] = useState<"resume" | "photo" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTeacher() {
    const res = await fetch("/api/teachers");
    const data: TeacherProfile[] = await res.json();
    const mine = Array.isArray(data) ? data[0] : null;
    if (mine) {
      setTeacher(mine);
      setBio(mine.bio);
      setSubjects(mine.subjects);
    }
    return mine;
  }

  useEffect(() => {
    loadTeacher();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, subjects }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("保存成功");
      setTimeout(() => setMessage(""), 2000);
    } else {
      const err = await res.json();
      setError(err.error || "保存失败");
    }
  }

  async function handleUpload(file: File, type: "resume" | "photo") {
    if (!teacher) return;
    setUploading(type);
    setError("");
    setMessage("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    fd.append("teacherId", teacher.id);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(null);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "上传失败");
      return;
    }

    const data = await res.json();
    if (data.teacher) {
      setTeacher(data.teacher);
    } else {
      await loadTeacher();
    }

    setMessage(type === "resume" ? "简历上传成功" : "头像上传成功");
    setTimeout(() => setMessage(""), 2000);
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
            <img
              src={teacher.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-ios-blue" />
          )}
        </div>
        <p className="font-semibold text-lg">{teacher.user.name}</p>
        <p className="text-sm text-ios-gray">{teacher.user.email}</p>
        <IOSBadge
          color={teacher.isPublished ? "green" : "gray"}
          className="mt-2"
        >
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
        {error && <p className="text-ios-red text-sm text-center">{error}</p>}

        <IOSButton type="submit" fullWidth disabled={saving}>
          {saving ? "保存中..." : "保存资料"}
        </IOSButton>
      </form>

      {teacher.resumeUrl && (
        <IOSCard className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-ios-red/10 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-ios-red" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">已上传简历</p>
            <a
              href={teacher.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ios-blue truncate block"
            >
              查看文件
            </a>
          </div>
        </IOSCard>
      )}

      <div className="flex gap-2 mt-4">
        <div className="flex-1">
          <FileUploadButton
            label={uploading === "resume" ? "上传中..." : "上传简历"}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
            disabled={uploading !== null}
            fullWidth
            onSelect={(file) => handleUpload(file, "resume")}
          />
        </div>
        <div className="flex-1">
          <FileUploadButton
            label={uploading === "photo" ? "上传中..." : "上传头像"}
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading !== null}
            fullWidth
            onSelect={(file) => handleUpload(file, "photo")}
          />
        </div>
      </div>
    </>
  );
}
