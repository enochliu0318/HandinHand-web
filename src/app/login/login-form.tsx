"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { IOSCard, IOSInput, IOSButton } from "@/components/ui/ios";
import { IOSPage } from "@/components/ui/nav";
import Link from "next/link";
import { getDashboardPath } from "@/lib/utils";
import type { Role } from "@/generated/prisma/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("邮箱或密码错误");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as Role | undefined;
    router.refresh();
    if (callbackUrl?.startsWith("/")) {
      router.push(callbackUrl);
    } else {
      router.push(role ? getDashboardPath(role) : "/");
    }
  }

  return (
    <IOSPage>
      <div className="max-w-sm mx-auto px-4 pt-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-ios-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">大</span>
          </div>
          <h1 className="text-2xl font-bold">登录</h1>
          <p className="text-ios-gray text-sm mt-1">大手拉小手管理系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <IOSInput
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <IOSInput
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-ios-red text-sm text-center">{error}</p>
          )}

          <IOSButton type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </IOSButton>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-ios-gray">
            还没有账号？{" "}
            <Link href="/apply" className="text-ios-blue">
              申请账号
            </Link>
          </p>
          <Link href="/" className="text-ios-blue text-sm block">
            返回首页
          </Link>
        </div>
      </div>
    </IOSPage>
  );
}
