"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IOSPage, IOSTabBar } from "@/components/ui/nav";
import { LayoutDashboard, BookOpen, User, LogOut } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "概览", icon: <LayoutDashboard className="w-full h-full" /> },
  { href: "/dashboard/sessions", label: "课程", icon: <BookOpen className="w-full h-full" /> },
  { href: "/dashboard/profile", label: "我的", icon: <User className="w-full h-full" /> },
];

export function TeacherShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string };
}) {
  const pathname = usePathname();

  return (
    <IOSPage withTabBar>
      <header className="ios-blur sticky top-0 z-50 border-b border-ios-separator safe-top">
        <div className="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between">
          <span className="text-ios-blue font-semibold">老师面板</span>
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
      <IOSTabBar items={tabs} activeHref={pathname} />
    </IOSPage>
  );
}
