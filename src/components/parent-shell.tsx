"use client";

import { signOut } from "next-auth/react";
import { IOSPage } from "@/components/ui/nav";
import { LogOut } from "lucide-react";

export function ParentShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string };
}) {
  return (
    <IOSPage>
      <header className="ios-blur sticky top-0 z-50 border-b border-ios-separator safe-top">
        <div className="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between">
          <span className="text-ios-blue font-semibold">家长中心</span>
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
    </IOSPage>
  );
}
