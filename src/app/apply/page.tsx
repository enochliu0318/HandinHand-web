"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IOSCard,
  IOSInput,
  IOSButton,
  IOSSelect,
  IOSTextarea,
} from "@/components/ui/ios";
import { PublicLayout } from "@/components/layouts";
import { CheckCircle } from "lucide-react";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        role: fd.get("role"),
        message: fd.get("message"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "提交失败，请稍后重试");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="text-center py-16">
          <CheckCircle className="w-14 h-14 text-ios-green mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">申请已提交</h1>
          <p className="text-ios-gray text-sm mb-8">
            管理员审核通过后会通过邮箱联系您开通账号。
          </p>
          <Link href="/">
            <IOSButton variant="secondary">返回首页</IOSButton>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">申请账号</h1>
        <p className="text-ios-gray text-sm mb-6">
          填写信息后，管理员会审核并为您开通账号。
        </p>

        <IOSCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <IOSInput name="name" label="姓名" required placeholder="您的姓名" />
            <IOSInput
              name="email"
              label="邮箱"
              type="email"
              required
              placeholder="your@email.com"
            />
            <IOSInput
              name="phone"
              label="联系电话"
              type="tel"
              placeholder="选填"
            />
            <IOSSelect
              name="role"
              label="申请身份"
              required
              options={[
                { value: "", label: "请选择" },
                { value: "TEACHER", label: "老师（学长学姐）" },
                { value: "PARENT", label: "家长" },
              ]}
            />
            <IOSTextarea
              name="message"
              label="补充说明"
              rows={3}
              placeholder="简单介绍自己或孩子的学习需求..."
            />

            {error && (
              <p className="text-ios-red text-sm text-center">{error}</p>
            )}

            <IOSButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "提交中..." : "提交申请"}
            </IOSButton>
          </form>
        </IOSCard>

        <p className="text-center text-sm text-ios-gray mt-6">
          已有账号？{" "}
          <Link href="/login" className="text-ios-blue">
            去登录
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
