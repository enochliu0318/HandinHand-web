import Link from "next/link";
import type { User } from "@/generated/prisma/client";
import { IOSNavBar, IOSPage } from "./ui/nav";
import { IOSButton } from "./ui/ios";

interface PublicHeaderProps {
  session?: { user: Pick<User, "name" | "role"> } | null;
}

export function PublicHeader({ session }: PublicHeaderProps) {
  return (
    <header className="ios-blur sticky top-0 z-50 border-b border-ios-separator safe-top">
      <div className="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between">
        <Link href="/" className="text-ios-blue font-semibold text-base">
          大手拉小手
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/teachers" className="text-sm text-ios-secondary">
            找老师
          </Link>
          <Link href="/apply" className="text-sm text-ios-secondary">
            申请账号
          </Link>
          {session ? (
            <Link
              href={
                session.user.role === "ADMIN"
                  ? "/admin"
                  : session.user.role === "TEACHER"
                    ? "/dashboard"
                    : "/parent"
              }
              className="text-sm text-ios-blue font-medium"
            >
              {session.user.name}
            </Link>
          ) : (
            <Link href="/login">
              <IOSButton size="sm" variant="primary">
                登录
              </IOSButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: PublicHeaderProps["session"];
}) {
  return (
    <IOSPage>
      <PublicHeader session={session} />
      <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
    </IOSPage>
  );
}
