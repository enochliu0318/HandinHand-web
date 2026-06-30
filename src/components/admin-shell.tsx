"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IOSPage, IOSTabBar } from "@/components/ui/nav";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  LogOut,
} from "lucide-react";

const tabs = [
  { href: "/admin", label: "概览", icon: <LayoutDashboard className="w-full h-full" /> },
  { href: "/admin/teachers", label: "老师", icon: <GraduationCap className="w-full h-full" /> },
  { href: "/admin/students", label: "学生", icon: <Users className="w-full h-full" /> },
  { href: "/admin/sessions", label: "课程", icon: <BookOpen className="w-full h-full" /> },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string };
}) {
  const pathname = usePathname();
  const activeTab =
    tabs.find((t) =>
      t.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(t.href)
    )?.href ?? "/admin";

  return (
    <IOSPage withTabBar>
      <header className="ios-blur sticky top-0 z-50 border-b border-ios-separator safe-top">
        <div className="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between">
          <span className="text-ios-blue font-semibold">管理后台</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ios-gray">{user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-ios-red"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
      <IOSTabBar items={tabs} activeHref={activeTab} />
    </IOSPage>
  );
}

export function AdminPageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-ios-gray mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
