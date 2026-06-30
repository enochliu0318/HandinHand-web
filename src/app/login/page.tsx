"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IOSCard, IOSInput, IOSButton } from "@/components/ui/ios";
import { IOSPage } from "@/components/ui/nav";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
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

    setLoading(false);

    if (result?.error) {
      setError("邮箱或密码错误");
      return;
    }

    router.refresh();
    router.push("/");
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

        <IOSCard className="mt-6 text-sm text-ios-gray">
          <p className="font-medium text-ios-label mb-2">测试账号</p>
          <p>管理员: admin@handinhand.com</p>
          <p>老师: zhangsan@example.com</p>
          <p>家长: parent@example.com</p>
          <p className="mt-1 text-xs">密码见 README</p>
        </IOSCard>

        <div className="text-center mt-6">
          <Link href="/" className="text-ios-blue text-sm">
            返回首页
          </Link>
        </div>
      </div>
    </IOSPage>
  );
}
